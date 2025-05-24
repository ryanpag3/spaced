import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import prisma from '../db/prisma';
import { CreateSpaceDto } from './dto/CreateSpaceDto';
import { UpdateSpaceDto } from './dto/UpdateSpaceDto';
import { SpaceDto } from './dto/SpaceDto';

@Injectable()
export class SpaceService {
  async create(
    createSpaceDto: CreateSpaceDto,
    ownerId: string,
  ): Promise<SpaceDto> {
    const space = await prisma.space.create({
      data: {
        name: createSpaceDto.name,
        description: createSpaceDto.description,
        ownerId,
      },
    });

    return plainToInstance(SpaceDto, space);
  }

  async findAll(ownerId: string): Promise<SpaceDto[]> {
    const spaces = await prisma.space.findMany({
      where: {
        ownerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return plainToInstance(SpaceDto, spaces);
  }

  async findOne(id: string, userId: string): Promise<SpaceDto> {
    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      throw new NotFoundException(`Space with ID ${id} not found`);
    }

    if (space.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this space');
    }

    return plainToInstance(SpaceDto, space);
  }

  async update(
    id: string,
    updateSpaceDto: UpdateSpaceDto,
    userId: string,
  ): Promise<SpaceDto> {
    const existingSpace = await prisma.space.findUnique({
      where: { id },
    });

    if (!existingSpace) {
      throw new NotFoundException(`Space with ID ${id} not found`);
    }

    if (existingSpace.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this space',
      );
    }

    const updatedSpace = await prisma.space.update({
      where: { id },
      data: {
        name: updateSpaceDto.name,
        ...(updateSpaceDto.description !== undefined && {
          description: updateSpaceDto.description,
        }),
      },
    });

    return plainToInstance(SpaceDto, updatedSpace);
  }

  async remove(id: string, userId: string): Promise<void> {
    const existingSpace = await prisma.space.findUnique({
      where: { id },
    });

    if (!existingSpace) {
      throw new NotFoundException(`Space with ID ${id} not found`);
    }

    if (existingSpace.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this space',
      );
    }

    await prisma.space.delete({
      where: { id },
    });
  }
}
