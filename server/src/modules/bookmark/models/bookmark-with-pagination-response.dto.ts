import { ApiProperty } from '@nestjs/swagger';
import { BookmarkResponseDto } from './bookmark-response.dto';

export class BookmarkWithPaginationResponseDto {
  @ApiProperty({
    description: 'List of bookmarks',
    type: [BookmarkResponseDto],
  })
  bookmarks: BookmarkResponseDto[];

  @ApiProperty({
    description: 'Total number of bookmarks',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current offset',
    example: 0,
  })
  offset: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Whether there are more items',
    example: true,
  })
  hasMore: boolean;
}
