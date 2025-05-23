// Mock NestJS decorators
jest.mock('@nestjs/common', () => {
  const original = jest.requireActual('@nestjs/common');
  return {
    ...original,
    Controller: () => (target: any) => target,
    Get: () => (target: any) => target,
    Param: () => (target: any, _propertyKey: string) => target,
    Res: () => (target: any, _propertyKey: string) => target,
  };
});

// Mock the Public decorator
jest.mock('../common/decorators/public.decorator', () => ({
  __esModule: true,
  default: () => {
    return (target: any) => target;
  },
}));

// Mock Swagger decorators
jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => {
    return (target: any) => target;
  },
  ApiOperation: () => {
    return (target: any) => target;
  },
  ApiParam: () => {
    return (target: any) => target;
  },
  ApiResponse: () => {
    return (target: any) => target;
  },
  ApiProduces: () => {
    return (target: any) => target;
  },
  ApiProperty: () => {
    return (target: any) => target;
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { S3Service } from '../s3/s3.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
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

  describe('getMediaByPath', () => {
    beforeEach(() => {
      // Make sure findFirst and findUnique are mocked
      (prisma.media as any).findFirst = jest.fn();
      (prisma.media as any).findUnique = jest.fn();
    });

    it('should return a streamable file when media is found by path', async () => {
      const mockUserId = 'user-123';
      const mockFilename = 'ad4d8d1a-910e-43af-9287-2dc3a8a05d61.jpg';
      const mockMedia = {
        id: 'test-media-id',
        s3Key: 'media/user-123/ad4d8d1a-910e-43af-9287-2dc3a8a05d61.jpg',
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

      const result = await controller.getMediaByPath(
        mockUserId,
        mockFilename,
        mockResponse as any,
      );

      expect(prisma.media.findFirst).toHaveBeenCalledWith({
        where: {
          s3Key: {
            endsWith: `media/${mockUserId}/${mockFilename}`,
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

    it('should find media by exact s3Key when not found by endsWith', async () => {
      const mockUserId = 'user-123';
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

      const result = await controller.getMediaByPath(
        mockUserId,
        mockFilename,
        mockResponse as any,
      );

      // Verify first call to findFirst (endsWith)
      expect(prisma.media.findFirst).toHaveBeenNthCalledWith(1, {
        where: {
          s3Key: {
            endsWith: `media/${mockUserId}/${mockFilename}`,
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

    it('should throw NotFoundException when media is not found by path', async () => {
      const mockUserId = 'user-123';
      const mockFilename = 'non-existent-image.jpg';
      // Both queries return null
      (prisma.media.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (prisma.media.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        controller.getMediaByPath(
          mockUserId,
          mockFilename,
          mockResponse as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMediaByKey', () => {
    it('should return a streamable file when media is found by key', async () => {
      const mockKey = 'test/key.jpg';
      const mockMedia = {
        id: 'test-media-id',
        s3Key: mockKey,
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

      const result = await controller.getMediaByKey(
        mockKey,
        mockResponse as any,
      );

      expect(prisma.media.findUnique).toHaveBeenCalledWith({
        where: { s3Key: mockKey },
      });
      expect(mockS3Service.getFile).toHaveBeenCalledWith(mockKey);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'inline; filename="key.jpg"',
        'Cache-Control': 'max-age=86400',
      });
      expect(result.getStream()).toBe(mockBody);
    });

    it('should throw ForbiddenException when media is not found in database', async () => {
      (prisma.media.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        controller.getMediaByKey('non-existent-key', mockResponse as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when S3 file retrieval fails', async () => {
      const mockKey = 'test/key.jpg';
      const mockMedia = {
        id: 'test-id',
        s3Key: mockKey,
        mimeType: 'image/jpeg',
        postId: 'post-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.media.findUnique as jest.Mock).mockResolvedValueOnce(mockMedia);
      mockS3Service.getFile.mockRejectedValueOnce(new Error('S3 error'));

      await expect(
        controller.getMediaByKey(mockKey, mockResponse as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
