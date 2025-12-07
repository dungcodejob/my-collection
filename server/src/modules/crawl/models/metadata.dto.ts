import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MetadataDto {
  @ApiProperty({
    description: 'Source website URL',
    example: 'https://example.com/article',
  })
  url: string;

  @ApiProperty({
    description: 'Domain name',
    example: 'example.com',
  })
  domain: string;

  @ApiPropertyOptional({
    description: 'Page title from HTML metadata',
    example: 'Example Article Title',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Page description from HTML metadata',
    example: 'This is an example article description',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Primary/featured image URL',
    example: 'https://example.com/images/featured.jpg',
  })
  image?: string;

  @ApiPropertyOptional({
    description: 'Website favicon URL',
    example: 'https://example.com/favicon.ico',
  })
  favicon?: string;

  @ApiPropertyOptional({
    description: 'Array of image URLs found on the page (max 10)',
    example: [
      'https://example.com/images/img1.jpg',
      'https://example.com/images/img2.jpg',
    ],
    type: [String],
  })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Website name from og:site_name',
    example: 'Example Website',
  })
  siteName?: string;

  @ApiPropertyOptional({
    description: 'Content author from meta tags',
    example: 'John Doe',
  })
  author?: string;

  @ApiPropertyOptional({
    description: 'Publication date in ISO 8601 format',
    example: '2023-12-01T10:00:00Z',
  })
  publishedDate?: string;
}
