import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export default class CreatePostDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'A night out with friends',
    description: 'Any description a user would like to append to their media.',
  })
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    example: ['friends', 'nightout'],
    description: 'An array of strings representing the tags of the content.',
  })
  tags?: string[];

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Optional space ID to assign the post to a specific space.',
  })
  spaceId?: string;
}
