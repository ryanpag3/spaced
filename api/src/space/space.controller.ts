import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SpaceService } from './space.service';
import { CreateSpaceDto } from './dto/CreateSpaceDto';
import { UpdateSpaceDto } from './dto/UpdateSpaceDto';
import { SpaceDto } from './dto/SpaceDto';
import { AuthenticatedRequest } from '../common/types/request.type';

@ApiTags('spaces')
@ApiBearerAuth()
@Controller('spaces')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new space' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The space has been successfully created.',
    type: SpaceDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  async create(
    @Body() createSpaceDto: CreateSpaceDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<SpaceDto> {
    return this.spaceService.create(createSpaceDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all spaces for the authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of user spaces.',
    type: [SpaceDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  async findAll(@Req() req: AuthenticatedRequest): Promise<SpaceDto[]> {
    return this.spaceService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific space by ID' })
  @ApiParam({
    name: 'id',
    description: 'Space ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The space details.',
    type: SpaceDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Space not found.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access to this space is forbidden.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  async findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<SpaceDto> {
    return this.spaceService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a space' })
  @ApiParam({
    name: 'id',
    description: 'Space ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The space has been successfully updated.',
    type: SpaceDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Space not found.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You do not have permission to update this space.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSpaceDto: UpdateSpaceDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<SpaceDto> {
    return this.spaceService.update(id, updateSpaceDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a space' })
  @ApiParam({
    name: 'id',
    description: 'Space ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The space has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Space not found.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You do not have permission to delete this space.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.spaceService.remove(id, req.user.id);
  }
}
