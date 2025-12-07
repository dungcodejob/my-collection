import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class BookmarkUpdateDto {
  @ApiPropertyOptional({
    description: 'Title of the bookmark',
    example: 'Updated Example Website',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MaxLength(500, { message: 'Title must not exceed 500 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Description of the bookmark',
    example: 'This is an updated example website',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Image URL for the bookmark',
    example: 'https://example.com/new-image.jpg',
    maxLength: 2048,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @MaxLength(2048, { message: 'Image URL must not exceed 2048 characters' })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Site name',
    example: 'Updated Example Site',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Site name must be a string' })
  @MaxLength(100, { message: 'Site name must not exceed 100 characters' })
  siteName?: string;

  @ApiPropertyOptional({
    description: 'Collection ID to move bookmark to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Collection ID must be a valid UUID' })
  collectionId?: string;

  @ApiPropertyOptional({
    description: 'Tags for the bookmark',
    example: ['web', 'development', 'updated'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Personal notes about the bookmark',
    example: 'Updated notes about this great resource',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether the bookmark is marked as favorite',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isFavorite must be a boolean' })
  isFavorite?: boolean;
}
