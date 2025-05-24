import { Test, TestingModule } from '@nestjs/testing';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';
import { CreateSpaceDto } from './dto/CreateSpaceDto';
import { UpdateSpaceDto } from './dto/UpdateSpaceDto';
import { AuthenticatedRequest } from '../common/types/request.type';

describe('SpaceController', () => {
  let controller: SpaceController;
  let service: SpaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpaceController],
      providers: [
        {
          provide: SpaceService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SpaceController>(SpaceController);
    service = module.get<SpaceService>(SpaceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a space', async () => {
      const createSpaceDto: CreateSpaceDto = {
        name: 'Test Space',
        description: 'Test description',
      };
      const mockRequest = { user: { id: 'user-123' } } as AuthenticatedRequest;
      const mockResult = {
        id: 'space-123',
        name: 'Test Space',
        description: 'Test description',
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockResult);

      const result = await controller.create(createSpaceDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createSpaceDto, 'user-123');
      expect(result).toBe(mockResult);
    });
  });

  describe('findAll', () => {
    it('should return all spaces for user', async () => {
      const mockRequest = { user: { id: 'user-123' } } as AuthenticatedRequest;
      const mockSpaces = [
        {
          id: 'space-1',
          name: 'Space 1',
          ownerId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockSpaces);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith('user-123');
      expect(result).toBe(mockSpaces);
    });
  });

  describe('findOne', () => {
    it('should return a specific space', async () => {
      const spaceId = 'space-123';
      const mockRequest = { user: { id: 'user-123' } } as AuthenticatedRequest;
      const mockSpace = {
        id: spaceId,
        name: 'Test Space',
        description: 'Test description',
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockSpace);

      const result = await controller.findOne(spaceId, mockRequest);

      expect(service.findOne).toHaveBeenCalledWith(spaceId, 'user-123');
      expect(result).toBe(mockSpace);
    });
  });

  describe('update', () => {
    it('should update a space', async () => {
      const spaceId = 'space-123';
      const updateSpaceDto: UpdateSpaceDto = {
        name: 'Updated Space',
        description: 'Updated description',
      };
      const mockRequest = { user: { id: 'user-123' } } as AuthenticatedRequest;
      const mockResult = {
        id: spaceId,
        name: 'Updated Space',
        description: 'Updated description',
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'update').mockResolvedValue(mockResult);

      const result = await controller.update(
        spaceId,
        updateSpaceDto,
        mockRequest,
      );

      expect(service.update).toHaveBeenCalledWith(
        spaceId,
        updateSpaceDto,
        'user-123',
      );
      expect(result).toBe(mockResult);
    });
  });

  describe('remove', () => {
    it('should delete a space', async () => {
      const spaceId = 'space-123';
      const mockRequest = { user: { id: 'user-123' } } as AuthenticatedRequest;

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(spaceId, mockRequest);

      expect(service.remove).toHaveBeenCalledWith(spaceId, 'user-123');
    });
  });
});
