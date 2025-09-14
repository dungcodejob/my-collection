import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class BookmarkSearchDto {
  @ApiPropertyOptional({
    description:
      'Search term to filter bookmarks by title, description, tags, or URL',
    example: 'web development',
  })
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Collection ID to filter bookmarks',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Collection ID must be a valid UUID' })
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

  @ApiPropertyOptional({
    description: 'Number of items to skip for pagination',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Offset must be an integer' })
  @Min(0, { message: 'Offset must be at least 0' })
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Number of items to return',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createAt',
    enum: ['createAt', 'updateAt', 'title', 'visitCount', 'lastVisitedAt'],
  })
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  sortBy?: 'createAt' | 'updateAt' | 'title' | 'visitCount' | 'lastVisitedAt' =
    'createAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
