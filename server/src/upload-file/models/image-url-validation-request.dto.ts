import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

/**
 * T113: ImageUrlValidationRequestDto
 * Request DTO for validating custom image URL
 */
export class ImageUrlValidationRequestDto {
  @ApiProperty({
    description: 'Image URL to validate',
    example: 'https://example.com/images/bookmark-thumbnail.jpg',
  })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    { message: 'URL must be a valid HTTP or HTTPS URL' },
  )
  imageUrl: string;
}
