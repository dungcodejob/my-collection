import {
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
  UUIDFieldOptional,
} from '@app/decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsOptional, IsUUID } from 'class-validator';

/**
 * DTO for creating a new collection
 */
export class CollectionCreateDto {
  @StringField({
    description: 'Collection name',
    example: 'My Documents',
    maxLength: 255,
  })
  name: string;

  @StringFieldOptional({
    description: 'Collection icon',
    example: 'folder',
    maxLength: 100,
  })
  icon?: string;

  @UUIDFieldOptional({
    description: 'Parent collection ID',
  })
  parentId?: string;

  @StringFieldOptional({
    description: 'Collection description',
    example: 'Important documents and files',
    maxLength: 1000,
  })
  description?: string;

  @NumberFieldOptional({
    description: 'Sort order',
    example: 0,
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
