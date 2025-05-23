import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  StreamableFile,
  InternalServerErrorException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiProduces,
} from '@nestjs/swagger';
import { S3Service } from '../s3/s3.service';
import prisma from '../db/prisma';
import { Response } from 'express';
import { Readable } from 'stream';
import { MediaFileResponseDto, ErrorResponseDto } from './dto';
import Public from '../common/decorators/public.decorator';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly s3Service: S3Service) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get media by ID',
    description: 'Retrieves media file from S3 by its database ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the media record',
  })
  @ApiResponse({
    status: 200,
    description: 'The media file is returned as a stream',
    type: MediaFileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Media not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  @ApiProduces(
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'application/octet-stream',
  )
  async getMedia(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      // Find the media in the database
      const media = await prisma.media.findUnique({
        where: { id },
      });

      if (!media) {
        throw new NotFoundException(`Media with ID ${id} not found`);
      }

      // Get the media from S3
      try {
        const { Body, ContentType } = await this.s3Service.getFile(media.s3Key);

        // Set appropriate headers
        res.set({
          'Content-Type': ContentType || media.mimeType,
          'Content-Disposition': `inline; filename="${media.s3Key.split('/').pop()}"`,
          'Cache-Control': 'max-age=86400', // Cache for 24 hours
        });

        // Return the file as a streamable response
        return new StreamableFile(Body as Readable);
      } catch (error) {
        Logger.error(
          `Error retrieving file from S3: ${error.message}`,
          error.stack,
          'MediaController',
        );
        throw new NotFoundException('Media file not found in storage');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      Logger.error(
        `Error in getMedia: ${error.message}`,
        error.stack,
        'MediaController',
      );
      throw new InternalServerErrorException(
        'An error occurred while retrieving the media',
      );
    }
  }

  @Get('key/:key')
  @ApiOperation({
    summary: 'Get media by S3 key',
    description: 'Retrieves media file directly from S3 using its key',
  })
  @ApiParam({ name: 'key', description: 'S3 key of the media file' })
  @ApiResponse({
    status: 200,
    description: 'The media file is returned as a stream',
    type: MediaFileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Media file not found in storage',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  @ApiProduces(
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'application/octet-stream',
  )
  async getMediaByKey(
    @Param('key') key: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const media = await prisma.media.findUnique({
        where: { s3Key: key },
      });

      if (!media) {
        throw new ForbiddenException('This media cannot be accessed.');
      }

      try {
        const { Body, ContentType } = await this.s3Service.getFile(key);

        res.set({
          'Content-Type':
            ContentType || media?.mimeType || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${key.split('/').pop()}"`,
          'Cache-Control': 'max-age=86400', // Cache for 24 hours
        });

        return new StreamableFile(Body as Readable);
      } catch (error) {
        Logger.error(
          `Error retrieving file from S3 with key ${key}: ${error.message}`,
          error.stack,
          'MediaController',
        );
        throw new NotFoundException('Media file not found in storage');
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      Logger.error(
        `Error in getMediaByKey: ${error.message}`,
        error.stack,
        'MediaController',
      );
      throw new InternalServerErrorException(
        'An error occurred while retrieving the media',
      );
    }
  }

  @Get(':userId/:filename')
  @ApiOperation({
    summary: 'Get media by direct filename',
    description:
      'Retrieves media file from S3 by its filename (useful for direct URLs in Image components)',
  })
  @ApiParam({
    name: 'filename',
    description:
      'Filename of the media file with extension (e.g., ad4d8d1a-910e-43af-9287-2dc3a8a05d61.jpg)',
  })
  @ApiResponse({
    status: 200,
    description: 'The media file is returned as a stream',
    type: MediaFileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Media not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden access',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  @ApiProduces(
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'application/octet-stream',
  )
  @Public()
  async getMediaByPath(
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const s3Key = `/media/${userId}/${filename}`;

      const s3KeyWithoutLeadingSlash = s3Key.startsWith('/')
        ? s3Key.substring(1)
        : s3Key;

      const media = await prisma.media.findFirst({
        where: {
          s3Key: {
            endsWith: s3KeyWithoutLeadingSlash,
          },
        },
      });

      // If not found, try to find media where filename is the complete s3Key
      if (!media) {
        const mediaByExactKey = await prisma.media.findFirst({
          where: {
            s3Key: filename,
          },
        });

        if (!mediaByExactKey) {
          throw new NotFoundException(
            `Media with filename ${filename} not found`,
          );
        }

        return this.serveMediaFile(mediaByExactKey.s3Key, mediaByExactKey, res);
      }

      return this.serveMediaFile(media.s3Key, media, res);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      Logger.error(
        `Error in getMediaByPath: ${error.message}`,
        error.stack,
        'MediaController',
      );
      throw new InternalServerErrorException(
        'An error occurred while retrieving the media',
      );
    }
  }

  // Helper method to serve media files
  private async serveMediaFile(
    s3Key: string,
    media: { mimeType?: string },
    res: Response,
  ) {
    try {
      const { Body, ContentType } = await this.s3Service.getFile(s3Key);

      res.set({
        'Content-Type':
          ContentType || media?.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${s3Key.split('/').pop()}"`,
        'Cache-Control': 'max-age=86400', // Cache for 24 hours
      });

      return new StreamableFile(Body as Readable);
    } catch (error) {
      Logger.error(
        `Error retrieving file from S3 with key ${s3Key}: ${error.message}`,
        error.stack,
        'MediaController',
      );
      throw new NotFoundException('Media file not found in storage');
    }
  }
}
