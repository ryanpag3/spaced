import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

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
}
