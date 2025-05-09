import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { AuthenticatedRequest } from 'src/common/types/request.type';
import prisma from 'src/db/prisma';
import { S3Service } from 'src/s3/s3.service';
import { v4 as uuidv4 } from 'uuid';
import CreatePostDto from './dto/CreatePostDto';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  private s3service: S3Service;

  constructor(s3Service: S3Service) {
    this.s3service = s3Service;
  }

  @Post()
  @ApiOperation({ summary: 'Submit a new post.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The post has been created.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'The user does not have access to submit posts.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The user is not authenticated. ',
  })
  @ApiBody({
    description: 'Post metadata and media.',
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', example: 'Night out with the girls!' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['sunset', 'beach'],
        },
        media: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('media', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/', 'video/'];
        if (allowed.some((type) => file.mimetype.startsWith(type))) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('Only image and video files are allowed'),
            false,
          );
        }
      },
    }),
  )
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let uploadedMedia = [];
    const userId = request.user.id;
    try {
      uploadedMedia = await Promise.all(
        files.map(async (file) => {
          const ext = extname(file.originalname);
          const key = `media/${userId}/${uuidv4()}${ext}`;
          return this.s3service.uploadFile(key, file);
        }),
      );

      const createdPost = await prisma.post.create({
        data: {
          description: body.description,
          tags: body.tags,
          authorId: userId,
          media: {
            create: uploadedMedia.map((m) => ({
              s3Key: m.key,
              mimeType: m.mimetype,
            })),
          },
        },
        include: {
          media: true,
        },
      });

      return createdPost;
    } catch (e) {
      for (const media of uploadedMedia) {
        await this.s3service.deleteFile(media.key);
      }
      Logger.debug(`Cleaned up media after post creation failed.`);
      Logger.error(e.message, e);
      throw new InternalServerErrorException(
        `Post creation failed: ${e.message}`,
      );
    }
  }
}
