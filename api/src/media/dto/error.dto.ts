import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Media with ID abc-123 not found',
  })
  message: string;

  @ApiProperty({
    description: 'Error code or type',
    example: 'Not Found',
  })
  error: string;
}
