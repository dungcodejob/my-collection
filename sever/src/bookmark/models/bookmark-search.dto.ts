import { UUIDFieldOptional } from '@app/decorators';
import { PaginationQueryDto } from '@app/models';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class BookmarkSearchDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'Search term to filter bookmarks by title, description, tags, or URL',
    example: 'web development',
  })
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  search?: string;

  @UUIDFieldOptional({
    description: 'Collection ID to filter bookmarks',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  collectionId?: string;

  @ApiPropertyOptional({
    description: 'Filter by favorite status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'isFavorite must be a boolean' })
  isFavorite?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by tags',
    example: ['web', 'development'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((tag) => tag.trim());
    }
    return value;
  })
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];
}
