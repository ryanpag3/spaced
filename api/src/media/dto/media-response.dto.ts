import { ApiProperty } from '@nestjs/swagger';

export class MediaFileResponseDto {
  @ApiProperty({
    description: 'The content type of the returned file',
    examples: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'application/octet-stream',
    ],
  })
  contentType: string;

  @ApiProperty({
    description: 'The file data',
    type: 'string',
    format: 'binary',
  })
  file: any;
}
