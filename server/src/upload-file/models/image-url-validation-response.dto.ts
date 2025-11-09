import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * T114: ImageUrlValidationResponseDto
 * Response DTO containing image URL validation result
 */
export class ImageUrlValidationResponseDto {
  @ApiProperty({
    description: 'Whether the image URL is valid and accessible',
    example: true,
  })
  valid: boolean;

  @ApiPropertyOptional({
    description: 'MIME type of the image (if valid)',
    example: 'image/jpeg',
  })
  mimeType?: string;

  @ApiPropertyOptional({
    description: 'File size in bytes (if available)',
    example: 1048576,
  })
  size?: number;

  @ApiPropertyOptional({
    description: 'Image width in pixels (if available)',
    example: 1920,
  })
  width?: number;

  @ApiPropertyOptional({
    description: 'Image height in pixels (if available)',
    example: 1080,
  })
  height?: number;

  @ApiPropertyOptional({
    description: 'Error message (if validation failed)',
    example: 'Invalid content type: text/html. Expected image type.',
  })
  error?: string;
}
