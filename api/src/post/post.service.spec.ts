import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';

// Mock the prisma client
jest.mock('../db/prisma', () => {
  return {
    __esModule: true,
    default: {
      post: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    },
  };
});

// Import the mocked prisma after mocking
import prisma from '../db/prisma';

describe('PostService', () => {
  let service: PostService;
  const mockUserId = 'mock-user-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostService],
    }).compile();

    service = module.get<PostService>(PostService);
    
    // Reset mock calls between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  describe('getProfilePosts', () => {
    it('should return user posts with default pagination', async () => {
      // Arrange
      const mockPosts = [
        {
          id: 'post-id-1',
          description: 'First post',
          authorId: mockUserId,
          tags: ['tag1', 'tag2'],
          createdAt: new Date(),
          media: [
            { id: 'media-1', s3Key: 's3://bucket/media1.jpg' },
            { id: 'media-2', s3Key: 's3://bucket/media2.jpg' },
          ],
        },
        {
          id: 'post-id-2',
          description: 'Second post',
          authorId: mockUserId,
          tags: ['tag3'],
          createdAt: new Date(),
          media: [
            { id: 'media-3', s3Key: 's3://bucket/media3.jpg' },
          ],
        },
      ];
      
      const mockCount = 2;
      
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(mockCount);
      
      // Act
      const result = await service.getProfilePosts(mockUserId);
      
      // Assert
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { authorId: mockUserId },
        take: 21, // default size (20) + 1
        orderBy: { createdAt: 'desc' },
        include: { media: true },
      });
      
      expect(prisma.post.count).toHaveBeenCalledWith({
        where: { authorId: mockUserId },
      });
      
      expect(result).toBeDefined();
      expect(result.posts).toHaveLength(2);
      expect(result.posts[0].id).toBe('post-id-1');
      expect(result.posts[0].mediaUris).toEqual(['s3://bucket/media1.jpg', 's3://bucket/media2.jpg']);
      expect(result.total).toBe(mockCount);
      expect(result.nextPageToken).toBeUndefined();
    });
    
    it('should handle pagination with cursor', async () => {
      // Arrange
      const mockPosts = [
        {
          id: 'post-id-3',
          description: 'Third post',
          authorId: mockUserId,
          tags: ['tag4'],
          createdAt: new Date(),
          media: [
            { id: 'media-4', s3Key: 's3://bucket/media4.jpg' },
          ],
        },
      ];
      
      const mockCount = 3;
      const mockCursor = 'post-id-2';
      const mockSize = 10;
      
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(mockCount);
      
      // Act
      const result = await service.getProfilePosts(mockUserId, mockSize, mockCursor);
      
      // Assert
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { authorId: mockUserId },
        take: mockSize + 1,
        cursor: { id: mockCursor },
        skip: 1,
        orderBy: { createdAt: 'desc' },
        include: { media: true },
      });
      
      expect(result.posts).toHaveLength(1);
      expect(result.total).toBe(mockCount);
      expect(result.nextPageToken).toBeUndefined();
    });
    
    it('should handle hasNextPage when there are more results', async () => {
      // Arrange
      const mockSize = 2;
      // Creating mockPosts with one extra item to simulate having more results
      const mockPosts = [
        {
          id: 'post-id-1',
          description: 'First post',
          authorId: mockUserId,
          tags: ['tag1'],
          createdAt: new Date(),
          media: [{ id: 'media-1', s3Key: 's3://bucket/media1.jpg' }],
        },
        {
          id: 'post-id-2',
          description: 'Second post',
          authorId: mockUserId,
          tags: ['tag2'],
          createdAt: new Date(),
          media: [{ id: 'media-2', s3Key: 's3://bucket/media2.jpg' }],
        },
        {
          id: 'post-id-3',
          description: 'Third post',
          authorId: mockUserId,
          tags: ['tag3'],
          createdAt: new Date(),
          media: [{ id: 'media-3', s3Key: 's3://bucket/media3.jpg' }],
        },
      ];
      
      const mockCount = 3;
      
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(mockCount);
      
      // Act
      const result = await service.getProfilePosts(mockUserId, mockSize);
      
      // Assert
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { authorId: mockUserId },
        take: mockSize + 1,
        orderBy: { createdAt: 'desc' },
        include: { media: true },
      });
      
      // Should only return mockSize items, not the extra one
      expect(result.posts).toHaveLength(mockSize);
      expect(result.total).toBe(mockCount);
      // The nextPageToken should be set to the ID of the last item
      expect(result.nextPageToken).toBe('post-id-2');
    });
    
    it('should handle empty results', async () => {
      // Arrange
      const mockPosts = [];
      const mockCount = 0;
      
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(mockCount);
      
      // Act
      const result = await service.getProfilePosts(mockUserId);
      
      // Assert
      expect(result.posts).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.nextPageToken).toBeUndefined();
    });
    
    it('should handle error cases gracefully', async () => {
      // Arrange
      const mockError = new Error('Database error');
      (prisma.post.findMany as jest.Mock).mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(service.getProfilePosts(mockUserId)).rejects.toThrow(mockError);
    });
  });
});
