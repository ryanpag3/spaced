import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: 'My Vacation Photos',
    description: 'The name of the space.',
    maxLength: 100,
  })
  name: string;

  @IsString()
  @MaxLength(500)
  @ApiProperty({
    example: 'Photos from my summer vacation in Italy',
    description: 'An optional description of the space.',
    maxLength: 500,
    required: false,
  })
  description?: string;
}
