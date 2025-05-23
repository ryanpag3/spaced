import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class SpaceDto {
  @Expose()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The unique identifier of the space.',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'My Vacation Photos',
    description: 'The name of the space.',
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: '2023-05-23T10:30:00.000Z',
    description: 'The creation timestamp of the space.',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    example: '2023-05-23T10:30:00.000Z',
    description: 'The last update timestamp of the space.',
  })
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'The ID of the space owner.',
  })
  ownerId: string;

  @Exclude()
  owner?: any;

  @Exclude()
  posts?: any;
}
