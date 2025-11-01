import {
  BooleanFieldOptional,
  EnumFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from '@app/decorators';
import { Transform } from 'class-transformer';

enum SortByEnum {
  NAME = 'name',
  USAGE_COUNT = 'usageCount',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

enum SortOrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class TagSearchDto {
  @StringFieldOptional({
    description: 'Search term to filter tags by name or description',
    example: 'web',
  })
  search?: string;

  @StringFieldOptional({
    description: 'Category to filter tags',
    example: 'Technology',
  })
  category?: string;

  @BooleanFieldOptional({
    description: 'Filter by active status',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @BooleanFieldOptional({
    description: 'Filter by system tag status',
    example: false,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isSystem?: boolean;

  @NumberFieldOptional({
    description: 'Minimum usage count',
    example: 1,
    minimum: 0,
    int: true,
    min: 0,
  })
  minUsage?: number;

  @NumberFieldOptional({
    description: 'Maximum usage count',
    example: 100,
    minimum: 0,
    int: true,
    min: 0,
  })
  maxUsage?: number;

  @NumberFieldOptional({
    description: 'Number of items to skip for pagination',
    example: 0,
    minimum: 0,
    int: true,
    min: 0,
  })
  offset?: number = 0;

  @NumberFieldOptional({
    description: 'Number of items to return',
    example: 20,
    minimum: 1,
    maximum: 100,
    int: true,
    min: 1,
    max: 100,
  })
  limit?: number = 20;

  @EnumFieldOptional(() => SortByEnum, {
    description: 'Sort field',
    example: 'usageCount',
    enumName: 'SortByEnum',
  })
  sortBy?: 'name' | 'usageCount' | 'createdAt' | 'updatedAt' = 'usageCount';

  @EnumFieldOptional(() => SortOrderEnum, {
    description: 'Sort order',
    example: 'DESC',
    enumName: 'SortOrderEnum',
  })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
