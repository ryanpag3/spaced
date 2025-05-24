import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateSpaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: 'My Updated Vacation Photos',
    description: 'The updated name of the space.',
    maxLength: 100,
  })
  name: string;

  @IsString()
  @MaxLength(500)
  @ApiProperty({
    example: 'Updated description for my vacation photos',
    description: 'An optional description of the space.',
    maxLength: 500,
    required: false,
  })
  description?: string;
}
