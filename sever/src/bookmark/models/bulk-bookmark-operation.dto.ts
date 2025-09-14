import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class BulkBookmarkOperationDto {
  @ApiProperty({
    description: 'Array of bookmark IDs to perform operation on',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsArray({ message: 'Bookmark IDs must be an array' })
  @IsUUID(4, { each: true, message: 'Each bookmark ID must be a valid UUID' })
  bookmarkIds: string[];
}

export class BulkMoveBookmarksDto extends BulkBookmarkOperationDto {
  @ApiProperty({
    description:
      'Collection ID to move bookmarks to (null to remove from collection)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  @IsOptional()
  @IsUUID(4, { message: 'Collection ID must be a valid UUID' })
  collectionId?: string | null;
}

export class BulkFavoriteBookmarksDto extends BulkBookmarkOperationDto {
  @ApiProperty({
    description: 'Whether to mark as favorite or unfavorite',
    example: true,
  })
  @IsBoolean({ message: 'isFavorite must be a boolean' })
  isFavorite: boolean;
}

export class BulkBookmarkOperationResponseDto {
  @ApiProperty({
    description: 'Number of bookmarks successfully processed',
    example: 5,
  })
  successCount: number;

  @ApiProperty({
    description: 'Number of bookmarks that failed to process',
    example: 0,
  })
  failureCount: number;

  @ApiProperty({
    description: 'Total number of bookmarks processed',
    example: 5,
  })
  totalProcessed: number;

  @ApiProperty({
    description: 'List of bookmark IDs that failed to process',
    example: [],
    type: [String],
  })
  failures: string[];
}
