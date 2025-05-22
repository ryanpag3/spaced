import { Controller, Get, Param, Res, NotFoundException, StreamableFile, InternalServerErrorException, Logger, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiProduces } from '@nestjs/swagger';
import { S3Service } from '../s3/s3.service';
import prisma from '../db/prisma';
import { Response } from 'express';
import { Readable } from 'stream';
import { MediaFileResponseDto, ErrorResponseDto } from './dto';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly s3Service: S3Service,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID', description: 'Retrieves media file from S3 by its database ID' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the media record' })
  @ApiResponse({ status: 200, description: 'The media file is returned as a stream', type: MediaFileResponseDto })
  @ApiResponse({ status: 404, description: 'Media not found', type: ErrorResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto })
  @ApiProduces('image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/octet-stream')
  async getMedia(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
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
        Logger.error(`Error retrieving file from S3: ${error.message}`, error.stack, 'MediaController');
        throw new NotFoundException('Media file not found in storage');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      Logger.error(`Error in getMedia: ${error.message}`, error.stack, 'MediaController');
      throw new InternalServerErrorException('An error occurred while retrieving the media');
    }
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get media by S3 key', description: 'Retrieves media file directly from S3 using its key' })
  @ApiParam({ name: 'key', description: 'S3 key of the media file' })
  @ApiResponse({ status: 200, description: 'The media file is returned as a stream', type: MediaFileResponseDto })
  @ApiResponse({ status: 404, description: 'Media file not found in storage', type: ErrorResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto })
  @ApiProduces('image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/octet-stream')
  async getMediaByKey(@Param('key') key: string, @Res({ passthrough: true }) res: Response) {
    try {
      const media = await prisma.media.findUnique({
        where: { s3Key: key },
      });

      if (!media) {
        throw new ForbiddenException("This media cannot be accessed.");
      }

      try {
        const { Body, ContentType } = await this.s3Service.getFile(key);
        
        res.set({
          'Content-Type': ContentType || (media?.mimeType || 'application/octet-stream'),
          'Content-Disposition': `inline; filename="${key.split('/').pop()}"`,
          'Cache-Control': 'max-age=86400', // Cache for 24 hours
        });

        return new StreamableFile(Body as Readable);
      } catch (error) {
        Logger.error(`Error retrieving file from S3 with key ${key}: ${error.message}`, error.stack, 'MediaController');
        throw new NotFoundException('Media file not found in storage');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      Logger.error(`Error in getMediaByKey: ${error.message}`, error.stack, 'MediaController');
      throw new InternalServerErrorException('An error occurred while retrieving the media');
    }
  }
}
