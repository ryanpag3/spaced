import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { S3Service } from '../s3/s3.service';
import { NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';

// Mock prisma
jest.mock('../db/prisma', () => ({
  __esModule: true,
  default: {
    media: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

import prisma from '../db/prisma';

describe('MediaController', () => {
  let controller: MediaController;

  const mockS3Service = {
    getFile: jest.fn(),
  };

  const mockResponse = {
    set: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMedia', () => {
    it('should return a streamable file when media is found', async () => {
      const mockMediaId = 'test-media-id';
      const mockMedia = {
        id: mockMediaId,
        s3Key: 'test/key.jpg',
        mimeType: 'image/jpeg',
        postId: 'post-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockBody = Readable.from(['test data']);
      const mockGetObjectResult = {
        Body: mockBody,
        ContentType: 'image/jpeg',
      };

      (prisma.media.findUnique as jest.Mock).mockResolvedValueOnce(mockMedia);
      mockS3Service.getFile.mockResolvedValueOnce(mockGetObjectResult);

      const result = await controller.getMedia(
        mockMediaId,
        mockResponse as any,
      );

      expect(prisma.media.findUnique).toHaveBeenCalledWith({
        where: { id: mockMediaId },
      });
      expect(mockS3Service.getFile).toHaveBeenCalledWith(mockMedia.s3Key);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'inline; filename="key.jpg"',
        'Cache-Control': 'max-age=86400',
      });
      expect(result.getStream()).toBe(mockBody);
    });

    it('should throw NotFoundException when media is not found in database', async () => {
      (prisma.media.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        controller.getMedia('non-existent-id', mockResponse as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when S3 file retrieval fails', async () => {
      const mockMedia = {
        id: 'test-id',
        s3Key: 'test/key.jpg',
        mimeType: 'image/jpeg',
        postId: 'post-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.media.findUnique as jest.Mock).mockResolvedValueOnce(mockMedia);
      mockS3Service.getFile.mockRejectedValueOnce(new Error('S3 error'));

      await expect(
        controller.getMedia('test-id', mockResponse as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMediaByDirectFilename', () => {
    beforeEach(() => {
      // Make sure findFirst and findUnique are mocked
      (prisma.media as any).findFirst = jest.fn();
      (prisma.media as any).findUnique = jest.fn();
    });

    it('should return a streamable file when media is found by filename with extension', async () => {
      const mockFilename = 'ad4d8d1a-910e-43af-9287-2dc3a8a05d61.jpg';
      const mockMedia = {
        id: 'test-media-id',
        s3Key: 'uploads/ad4d8d1a-910e-43af-9287-2dc3a8a05d61.jpg',
        mimeType: 'image/jpeg',
        postId: 'post-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockBody = Readable.from(['test data']);
      const mockGetObjectResult = {
        Body: mockBody,
        ContentType: 'image/jpeg',
      };

      (prisma.media.findFirst as jest.Mock).mockResolvedValueOnce(mockMedia);
      mockS3Service.getFile.mockResolvedValueOnce(mockGetObjectResult);

      const result = await controller.getMediaByDirectFilename(
        mockFilename,
        mockResponse as any,
      );

      expect(prisma.media.findFirst).toHaveBeenCalledWith({
        where: {
          s3Key: {
            endsWith: `/${mockFilename}`,
          },
        },
      });
      expect(mockS3Service.getFile).toHaveBeenCalledWith(mockMedia.s3Key);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `inline; filename="ad4d8d1a-910e-43af-9287-2dc3a8a05d61.jpg"`,
        'Cache-Control': 'max-age=86400',
      });
      expect(result.getStream()).toBe(mockBody);
    });

    it('should fall back to getMedia when the filename looks like a UUID without extension', async () => {
      const mockId = 'ad4d8d1a-910e-43af-9287-2dc3a8a05d61';
      const mockMedia = {
        id: mockId,
        s3Key: 'uploads/ad4d8d1a-910e-43af-9287-2dc3a8a05d61.jpg',
        mimeType: 'image/jpeg',
        postId: 'post-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockBody = Readable.from(['test data']);
      const mockGetObjectResult = {
        Body: mockBody,
        ContentType: 'image/jpeg',
      };

      (prisma.media.findUnique as jest.Mock).mockResolvedValueOnce(mockMedia);
      mockS3Service.getFile.mockResolvedValueOnce(mockGetObjectResult);

      const result = await controller.getMediaByDirectFilename(
        mockId,
        mockResponse as any,
      );

      expect(prisma.media.findUnique).toHaveBeenCalledWith({
        where: { id: mockId },
      });
      expect(mockS3Service.getFile).toHaveBeenCalledWith(mockMedia.s3Key);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `inline; filename="ad4d8d1a-910e-43af-9287-2dc3a8a05d61.jpg"`,
        'Cache-Control': 'max-age=86400',
      });
      expect(result.getStream()).toBe(mockBody);
    });

    it('should find media by exact s3Key when not found by endsWith', async () => {
      const mockFilename = 'direct-image.jpg';
      const mockMedia = {
        id: 'test-media-id',
        s3Key: 'direct-image.jpg',
        mimeType: 'image/jpeg',
        postId: 'post-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockBody = Readable.from(['test data']);
      const mockGetObjectResult = {
        Body: mockBody,
        ContentType: 'image/jpeg',
      };

      // First query (by endsWith) returns null
      (prisma.media.findFirst as jest.Mock).mockResolvedValueOnce(null);
      // Second query (by exact match) returns the media
      (prisma.media.findFirst as jest.Mock).mockResolvedValueOnce(mockMedia);
      mockS3Service.getFile.mockResolvedValueOnce(mockGetObjectResult);

      const result = await controller.getMediaByDirectFilename(
        mockFilename,
        mockResponse as any,
      );

      // Verify first call to findFirst (endsWith)
      expect(prisma.media.findFirst).toHaveBeenNthCalledWith(1, {
        where: {
          s3Key: {
            endsWith: `/${mockFilename}`,
          },
        },
      });

      // Verify second call to findFirst (exact match)
      expect(prisma.media.findFirst).toHaveBeenNthCalledWith(2, {
        where: {
          s3Key: mockFilename,
        },
      });

      expect(mockS3Service.getFile).toHaveBeenCalledWith(mockMedia.s3Key);
      expect(result.getStream()).toBe(mockBody);
    });

    it('should throw NotFoundException when media is not found by filename', async () => {
      const mockFilename = 'non-existent-image.jpg';
      // Both queries return null
      (prisma.media.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (prisma.media.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        controller.getMediaByDirectFilename(mockFilename, mockResponse as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
