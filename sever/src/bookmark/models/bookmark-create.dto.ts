import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class BookmarkCreateDto {
  @ApiProperty({
    description: 'URL of the bookmark',
    example: 'https://example.com',
    maxLength: 2048,
  })
  @IsUrl({}, { message: 'URL must be a valid URL' })
  @MaxLength(2048, { message: 'URL must not exceed 2048 characters' })
  url: string;

  @ApiProperty({
    description: 'Title of the bookmark',
    example: 'Example Website',
    maxLength: 500,
  })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(500, { message: 'Title must not exceed 500 characters' })
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the bookmark',
    example: 'This is an example website',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Image URL for the bookmark',
    example: 'https://example.com/image.jpg',
    maxLength: 2048,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @MaxLength(2048, { message: 'Image URL must not exceed 2048 characters' })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Site name',
    example: 'Example Site',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Site name must be a string' })
  @MaxLength(100, { message: 'Site name must not exceed 100 characters' })
  siteName?: string;

  @ApiPropertyOptional({
    description: 'Collection ID to add bookmark to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Collection ID must be a valid UUID' })
  collectionId?: string;

  @ApiPropertyOptional({
    description: 'Tags for the bookmark',
    example: ['web', 'development', 'tutorial'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Personal notes about the bookmark',
    example: 'Great resource for learning web development',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}
