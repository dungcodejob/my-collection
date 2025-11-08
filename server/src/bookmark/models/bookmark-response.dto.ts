import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CollectionDto } from '../../collection/models';

export class BookmarkResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the bookmark',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'URL of the bookmark',
    example: 'https://example.com',
  })
  url: string;

  @ApiProperty({
    description: 'Title of the bookmark',
    example: 'Example Website',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the bookmark',
    example: 'This is an example website',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Image URL for the bookmark',
    example: 'https://example.com/image.jpg',
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Favicon URL for the bookmark',
    example: 'https://example.com/favicon.ico',
  })
  faviconUrl?: string;

  @ApiPropertyOptional({
    description: 'Site name',
    example: 'Example Site',
  })
  siteName?: string;

  @ApiPropertyOptional({
    description: 'Content type of the bookmark',
    example: 'text/html',
  })
  contentType?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { author: 'John Doe', publishedDate: '2023-01-01' },
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Tags associated with the bookmark',
    example: ['web', 'development', 'tutorial'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Personal notes about the bookmark',
    example: 'Great resource for learning web development',
  })
  notes?: string;

  @ApiProperty({
    description: 'Whether the bookmark is marked as favorite',
    example: false,
  })
  isFavorite: boolean;

  @ApiProperty({
    description: 'Whether the bookmark is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Number of times the bookmark has been visited',
    example: 5,
  })
  visitCount: number;

  @ApiPropertyOptional({
    description: 'Last time the bookmark was visited',
    example: '2023-12-01T10:00:00Z',
  })
  lastVisitedAt?: Date;

  // @ApiPropertyOptional({
  //   description: 'Collection the bookmark belongs to',
  //   type: CollectionDto,
  // })
  collection?: CollectionDto;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-12-01T10:00:00Z',
  })
  createAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-12-01T10:00:00Z',
  })
  updateAt: Date;
}
