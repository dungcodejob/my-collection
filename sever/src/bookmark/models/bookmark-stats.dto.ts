import { ApiProperty } from '@nestjs/swagger';

export class BookmarkStatsDto {
  @ApiProperty({
    description: 'Total number of bookmarks',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Number of favorite bookmarks',
    example: 25,
  })
  favorites: number;

  @ApiProperty({
    description: 'Number of bookmarks with collection',
    example: 120,
  })
  withCollection: number;

  @ApiProperty({
    description: 'Number of bookmarks without collection',
    example: 30,
  })
  withoutCollection: number;

  @ApiProperty({
    description: 'Total number of visits across all bookmarks',
    example: 500,
  })
  totalVisits: number;
}
