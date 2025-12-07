import {
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
} from '@app/decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsOptional, IsUUID } from 'class-validator';

/**
 * DTO for updating a collection
 */
export class CollectionUpdateDto {
  @StringField({
    description: 'Collection name',
    example: 'Updated Documents',
    maxLength: 255,
  })
  name: string;

  @StringFieldOptional({
    description: 'Collection icon',
    example: 'folder-open',
    maxLength: 100,
  })
  icon?: string;

  @StringFieldOptional({
    description: 'Collection description',
    example: 'Updated description',
    maxLength: 1000,
  })
  description?: string;

  @NumberFieldOptional({
    description: 'Sort order',
    example: 1,
    min: 0,
    int: true,
  })
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Tag IDs to assign to collection',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440001'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(20, { message: 'Maximum 20 tags per collection' })
  tagIds?: string[];
}
