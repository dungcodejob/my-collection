import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DuplicateBookmarkDto {
  @ApiProperty({
    description: 'Bookmark ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Bookmark title',
    example: 'Example Website',
  })
  title: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-12-01T10:00:00Z',
  })
  createdAt: string;

  @ApiPropertyOptional({
    description: 'Image URL',
    example: 'https://example.com/image.jpg',
  })
  imageUrl?: string;
}

export class DuplicateCheckResponseDto {
  @ApiProperty({
    description: 'Whether a duplicate exists',
    example: false,
  })
  exists: boolean;

  @ApiPropertyOptional({
    description: 'Existing bookmark details if duplicate found',
    type: DuplicateBookmarkDto,
  })
  bookmark?: DuplicateBookmarkDto;
}
