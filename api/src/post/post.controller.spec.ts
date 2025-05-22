import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../common/types/request.type';
import { S3Service } from '../s3/s3.service';
import { PostController } from './post.controller';
import { PostService } from './post.service';

// Mock uuid to return predictable values
jest.mock('uuid');
(uuidv4 as jest.Mock).mockImplementation(() => 'mocked-uuid');

// Mock the prisma client properly
jest.mock('../db/prisma', () => {
  return {
    __esModule: true,
    default: {
      post: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    },
  };
});

// Import the mocked prisma after mocking
import prisma from '../db/prisma';

// Mock the S3Service
const mockS3Service = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
};

// Mock the PostService
const mockPostService = {
  getProfilePosts: jest.fn(),
};

describe('PostController', () => {
  let controller: PostController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const mockRequest = {
      user: { id: 'user-123' },
    } as AuthenticatedRequest;

    const mockFiles = [
      {
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('mock-image-data'),
      },
      {
        originalname: 'test-video.mp4',
        mimetype: 'video/mp4',
        buffer: Buffer.from('mock-video-data'),
      },
    ] as Express.Multer.File[];

    const mockBody = {
      description: 'Test post description',
      tags: ['test', 'post'],
    };

    const mockUploadResults = [
      { key: 'media/user-123/mocked-uuid.jpg', mimetype: 'image/jpeg' },
      { key: 'media/user-123/mocked-uuid.mp4', mimetype: 'video/mp4' },
    ];

    const mockCreatedPost = {
      id: 'post-123',
      description: 'Test post description',
      tags: ['test', 'post'],
      authorId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      media: [
        {
          id: 'media-1',
          s3Key: 'media/user-123/mocked-uuid.jpg',
          mimeType: 'image/jpeg',
        },
        {
          id: 'media-2',
          s3Key: 'media/user-123/mocked-uuid.mp4',
          mimeType: 'video/mp4',
        },
      ],
    };

    it('should create a new post with media successfully', async () => {
      // Setup mocks
      mockS3Service.uploadFile.mockImplementation((key, file) => {
        if (file.mimetype.startsWith('image/')) {
          return Promise.resolve(mockUploadResults[0]);
        } else {
          return Promise.resolve(mockUploadResults[1]);
        }
      });

      prisma.post.create = jest.fn().mockResolvedValue(mockCreatedPost);

      // Call the method
      const result = await controller.create(mockRequest, mockBody, mockFiles);

      // Assertions
      expect(mockS3Service.uploadFile).toHaveBeenCalledTimes(2);
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          description: mockBody.description,
          tags: mockBody.tags,
          authorId: mockRequest.user.id,
          media: {
            create: mockUploadResults.map((m) => ({
              s3Key: m.key,
              mimeType: m.mimetype,
            })),
          },
        },
        include: {
          media: true,
        },
      });

      expect(result).toEqual(mockCreatedPost);
      expect(mockS3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('should clean up uploaded media if post creation fails', async () => {
      // Setup mocks
      mockS3Service.uploadFile.mockImplementation((key, file) => {
        if (file.mimetype.startsWith('image/')) {
          return Promise.resolve(mockUploadResults[0]);
        } else {
          return Promise.resolve(mockUploadResults[1]);
        }
      });

      const mockError = new Error('Database error');
      prisma.post.create = jest.fn().mockRejectedValue(mockError);

      // Call the method and catch the error
      await expect(
        controller.create(mockRequest, mockBody, mockFiles),
      ).rejects.toThrow(InternalServerErrorException);

      // Assertions
      expect(mockS3Service.uploadFile).toHaveBeenCalledTimes(2);
      expect(prisma.post.create).toHaveBeenCalledTimes(1);

      // Verify cleanup occurred
      expect(mockS3Service.deleteFile).toHaveBeenCalledTimes(2);
      expect(mockS3Service.deleteFile).toHaveBeenCalledWith(
        mockUploadResults[0].key,
      );
      expect(mockS3Service.deleteFile).toHaveBeenCalledWith(
        mockUploadResults[1].key,
      );
    });

    it('should handle empty file list', async () => {
      // Call with empty files array
      prisma.post.create = jest.fn().mockResolvedValue({
        ...mockCreatedPost,
        media: [],
      });

      const result = await controller.create(mockRequest, mockBody, []);

      expect(mockS3Service.uploadFile).not.toHaveBeenCalled();
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          description: mockBody.description,
          tags: mockBody.tags,
          authorId: mockRequest.user.id,
          media: {
            create: [],
          },
        },
        include: {
          media: true,
        },
      });

      expect(result.media).toEqual([]);
    });

    it('should handle S3 upload failure', async () => {
      // Setup S3 upload to fail
      const uploadError = new Error('S3 upload failed');
      mockS3Service.uploadFile.mockRejectedValue(uploadError);

      // Call the method and expect it to throw
      await expect(
        controller.create(mockRequest, mockBody, mockFiles),
      ).rejects.toThrow(InternalServerErrorException);

      // Verify behavior
      expect(mockS3Service.uploadFile).toHaveBeenCalled();
      expect(prisma.post.create).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    const mockRequest = {
      user: { id: 'user-456' },
    } as AuthenticatedRequest;

    const mockListResponse = {
      posts: [
        {
          id: 'post-1',
          description: 'First post',
          authorId: 'user-456',
          tags: ['test'],
          mediaUris: ['media/user-456/image1.jpg']
        },
        {
          id: 'post-2',
          description: 'Second post',
          authorId: 'user-456',
          tags: ['sample'],
          mediaUris: ['media/user-456/image2.jpg']
        }
      ],
      nextPageToken: 'post-2',
      total: 10
    };

    beforeEach(() => {
      mockPostService.getProfilePosts.mockReset();
    });

    it('should return profile posts with pagination', async () => {
      // Setup mock
      mockPostService.getProfilePosts.mockResolvedValue(mockListResponse);

      // Call the method
      const result = await controller.list(
        mockRequest,
        'profile',
        20,
        undefined,
        undefined
      );

      // Assertions
      expect(mockPostService.getProfilePosts).toHaveBeenCalledWith(
        mockRequest.user.id,
        20,
        undefined
      );
      expect(result).toEqual(mockListResponse);
    });

    it('should pass cursor to getProfilePosts when provided', async () => {
      // Setup mock
      mockPostService.getProfilePosts.mockResolvedValue(mockListResponse);
      
      // Call with cursor
      const cursor = 'post-1';
      await controller.list(
        mockRequest,
        'profile',
        10,
        undefined,
        cursor
      );

      // Verify cursor was passed
      expect(mockPostService.getProfilePosts).toHaveBeenCalledWith(
        mockRequest.user.id,
        10,
        cursor
      );
    });
  });
});
