import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SpaceService } from './space.service';
import { CreateSpaceDto } from './dto/CreateSpaceDto';
import { UpdateSpaceDto } from './dto/UpdateSpaceDto';

// Mock Prisma
jest.mock('../db/prisma', () => ({
  __esModule: true,
  default: {
    space: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import prisma from '../db/prisma';

describe('SpaceService', () => {
  let service: SpaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpaceService],
    }).compile();

    service = module.get<SpaceService>(SpaceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new space', async () => {
      const createSpaceDto: CreateSpaceDto = { name: 'Test Space' };
      const ownerId = 'user-123';
      const mockSpace = {
        id: 'space-123',
        name: 'Test Space',
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.space.create as jest.Mock).mockResolvedValue(mockSpace);

      const result = await service.create(createSpaceDto, ownerId);

      expect(prisma.space.create).toHaveBeenCalledWith({
        data: {
          name: createSpaceDto.name,
          ownerId,
        },
      });
      expect(result.name).toBe(mockSpace.name);
      expect(result.ownerId).toBe(ownerId);
    });
  });

  describe('findAll', () => {
    it('should return all spaces for a user', async () => {
      const ownerId = 'user-123';
      const mockSpaces = [
        {
          id: 'space-1',
          name: 'Space 1',
          ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'space-2',
          name: 'Space 2',
          ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.space.findMany as jest.Mock).mockResolvedValue(mockSpaces);

      const result = await service.findAll(ownerId);

      expect(prisma.space.findMany).toHaveBeenCalledWith({
        where: { ownerId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Space 1');
    });
  });

  describe('findOne', () => {
    it('should return a space when user owns it', async () => {
      const spaceId = 'space-123';
      const userId = 'user-123';
      const mockSpace = {
        id: spaceId,
        name: 'Test Space',
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.space.findUnique as jest.Mock).mockResolvedValue(mockSpace);

      const result = await service.findOne(spaceId, userId);

      expect(prisma.space.findUnique).toHaveBeenCalledWith({
        where: { id: spaceId },
      });
      expect(result.name).toBe(mockSpace.name);
    });

    it('should throw NotFoundException when space does not exist', async () => {
      const spaceId = 'nonexistent-space';
      const userId = 'user-123';

      (prisma.space.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(spaceId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own the space', async () => {
      const spaceId = 'space-123';
      const userId = 'user-123';
      const differentOwnerId = 'user-456';
      const mockSpace = {
        id: spaceId,
        name: 'Test Space',
        ownerId: differentOwnerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.space.findUnique as jest.Mock).mockResolvedValue(mockSpace);

      await expect(service.findOne(spaceId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a space when user owns it', async () => {
      const spaceId = 'space-123';
      const userId = 'user-123';
      const updateSpaceDto: UpdateSpaceDto = { name: 'Updated Space' };
      const mockExistingSpace = {
        id: spaceId,
        name: 'Old Space',
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockUpdatedSpace = {
        ...mockExistingSpace,
        name: updateSpaceDto.name,
        updatedAt: new Date(),
      };

      (prisma.space.findUnique as jest.Mock).mockResolvedValue(mockExistingSpace);
      (prisma.space.update as jest.Mock).mockResolvedValue(mockUpdatedSpace);

      const result = await service.update(spaceId, updateSpaceDto, userId);

      expect(prisma.space.update).toHaveBeenCalledWith({
        where: { id: spaceId },
        data: { name: updateSpaceDto.name },
      });
      expect(result.name).toBe(updateSpaceDto.name);
    });

    it('should throw NotFoundException when space does not exist', async () => {
      const spaceId = 'nonexistent-space';
      const userId = 'user-123';
      const updateSpaceDto: UpdateSpaceDto = { name: 'Updated Space' };

      (prisma.space.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update(spaceId, updateSpaceDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own the space', async () => {
      const spaceId = 'space-123';
      const userId = 'user-123';
      const differentOwnerId = 'user-456';
      const updateSpaceDto: UpdateSpaceDto = { name: 'Updated Space' };
      const mockSpace = {
        id: spaceId,
        name: 'Test Space',
        ownerId: differentOwnerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.space.findUnique as jest.Mock).mockResolvedValue(mockSpace);

      await expect(service.update(spaceId, updateSpaceDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a space when user owns it', async () => {
      const spaceId = 'space-123';
      const userId = 'user-123';
      const mockSpace = {
        id: spaceId,
        name: 'Test Space',
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.space.findUnique as jest.Mock).mockResolvedValue(mockSpace);
      (prisma.space.delete as jest.Mock).mockResolvedValue(mockSpace);

      await service.remove(spaceId, userId);

      expect(prisma.space.delete).toHaveBeenCalledWith({
        where: { id: spaceId },
      });
    });

    it('should throw NotFoundException when space does not exist', async () => {
      const spaceId = 'nonexistent-space';
      const userId = 'user-123';

      (prisma.space.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(spaceId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own the space', async () => {
      const spaceId = 'space-123';
      const userId = 'user-123';
      const differentOwnerId = 'user-456';
      const mockSpace = {
        id: spaceId,
        name: 'Test Space',
        ownerId: differentOwnerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.space.findUnique as jest.Mock).mockResolvedValue(mockSpace);

      await expect(service.remove(spaceId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
