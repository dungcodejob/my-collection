import { ApiProperty } from '@nestjs/swagger';

/**
 * T110: ImageUploadResponseDto
 * Response DTO containing presigned URL for image upload
 */
export class ImageUploadResponseDto {
  @ApiProperty({
    description: 'Presigned URL for direct upload to cloud storage',
    example:
      'https://storage.example.com/upload?signature=abc123&expires=1704537600',
  })
  presignedUrl: string;

  @ApiProperty({
    description:
      'Seconds until presigned URL expires (typically 900 = 15 minutes)',
    example: 900,
  })
  expiresIn: number;

  @ApiProperty({
    description:
      'Final CDN URL where the image will be accessible after upload',
    example:
      'https://cdn.example.com/bookmarks/550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  finalUrl: string;
}
