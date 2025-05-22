import { ApiProperty } from '@nestjs/swagger';

export class MediaDto {
  @ApiProperty({
    description: 'Unique identifier of the media',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'The ID of the post this media belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  postId: string;

  @ApiProperty({
    description: 'S3 key for the media file',
    example: 'uploads/550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  s3Key: string;

  @ApiProperty({
    description: 'MIME type of the media file',
    example: 'image/jpeg',
  })
  mimeType: string;

  @ApiProperty({
    description: 'When the media was created',
    example: '2025-05-22T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the media was last updated',
    example: '2025-05-22T12:00:00Z',
  })
  updatedAt: Date;
}
