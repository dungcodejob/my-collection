import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO for creating a new collection
 */
export class CollectionCreateDto {
  @ApiProperty({ description: 'Collection name', example: 'My Documents' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Collection icon', example: 'folder' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @ApiPropertyOptional({ description: 'Parent collection ID' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Collection description',
    example: 'Important documents and files',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

/**
 * DTO for updating a collection
 */
export class CollectionUpdateDto {
  @ApiPropertyOptional({
    description: 'Collection name',
    example: 'Updated Documents',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Collection icon',
    example: 'folder-open',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @ApiPropertyOptional({
    description: 'Collection description',
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

/**
 * DTO for moving a collection to new parent
 */
export class CollectionMoveDto {
  @ApiPropertyOptional({
    description: 'New parent collection ID (null for root level)',
  })
  @IsOptional()
  @IsUUID()
  newParentId?: string;
}

/**
 * DTO for updating sort order of multiple collections
 */
export class UpdateSortOrderDto {
  @ApiProperty({
    description: 'Array of collection IDs in desired order',
    example: ['uuid1', 'uuid2', 'uuid3'],
    type: [String],
  })
  @IsArray()
  @IsUUID(4, { each: true })
  collectionIds: string[];
}

/**
 * DTO for collection response
 */
export class CollectionResponseDto {
  @ApiProperty({ description: 'Collection ID' })
  id: string;

  @ApiProperty({ description: 'Collection name', example: 'My Documents' })
  name: string;

  @ApiPropertyOptional({ description: 'Collection icon', example: 'folder' })
  icon?: string;

  @ApiPropertyOptional({ description: 'Parent collection ID' })
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Parent path',
    example: 'Documents/Work',
  })
  parentPath?: string;

  @ApiProperty({ description: 'Full path', example: 'Documents/Work/Projects' })
  path: string;

  @ApiPropertyOptional({ description: 'Collection description' })
  description?: string;

  @ApiProperty({ description: 'Sort order', example: 0 })
  sortOrder: number;

  @ApiProperty({
    description: 'Whether collection has children',
    example: true,
  })
  isHasChild: boolean;

  @ApiProperty({ description: 'Whether collection is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

/**
 * DTO for collection tree response (includes children)
 */
export class CollectionTreeResponseDto extends CollectionResponseDto {
  @ApiProperty({
    description: 'Child collections',
    type: [CollectionTreeResponseDto],
    required: false,
  })
  children?: CollectionTreeResponseDto[];
}

/**
 * DTO for paginated collection response
 */
export class CollectionWithPaginationResponseDto {
  @ApiProperty({
    description: 'Collections array',
    type: [CollectionResponseDto],
  })
  collections: CollectionResponseDto[];

  @ApiProperty({ description: 'Total count of collections', example: 100 })
  total: number;

  @ApiProperty({ description: 'Current offset', example: 0 })
  offset: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;
}

/**
 * DTO for collection search result
 */
export class CollectionSearchResultDto {
  @ApiProperty({ description: 'Collection ID' })
  id: string;

  @ApiProperty({ description: 'Collection name' })
  name: string;

  @ApiProperty({ description: 'Full path' })
  path: string;

  @ApiPropertyOptional({ description: 'Parent path' })
  parentPath?: string;

  @ApiPropertyOptional({ description: 'Collection icon' })
  icon?: string;

  @ApiPropertyOptional({ description: 'Collection description' })
  description?: string;

  @ApiProperty({
    description: 'Type of match',
    enum: ['name', 'path', 'description'],
    example: 'name',
  })
  matchType: 'name' | 'path' | 'description';
}

/**
 * DTO for collection breadcrumb
 */
export class CollectionBreadcrumbDto {
  @ApiProperty({ description: 'Collection ID' })
  id: string;

  @ApiProperty({ description: 'Collection name' })
  name: string;

  @ApiProperty({ description: 'Collection path' })
  path: string;
}

/**
 * DTO for collection select option
 */
export class CollectionSelectOptionDto {
  @ApiProperty({ description: 'Collection ID (value)' })
  value: string;

  @ApiProperty({ description: 'Collection name (label)' })
  label: string;

  @ApiProperty({ description: 'Collection path' })
  path: string;

  @ApiPropertyOptional({ description: 'Whether option is disabled' })
  disabled?: boolean;

  @ApiPropertyOptional({ description: 'Hierarchy level (for nested display)' })
  level?: number;
}

/**
 * DTO for collection statistics
 */
export class CollectionStatsDto {
  @ApiProperty({ description: 'Total collections count' })
  totalCollections: number;

  @ApiProperty({ description: 'Root collections count' })
  rootCollections: number;

  @ApiProperty({ description: 'Active collections count' })
  activeCollections: number;

  @ApiProperty({ description: 'Deleted collections count' })
  deletedCollections: number;

  @ApiProperty({ description: 'Maximum depth level' })
  maxDepth: number;

  @ApiProperty({ description: 'Average children per collection' })
  avgChildrenPerCollection: number;
}

/**
 * DTO for bulk operations
 */
export class BulkCollectionOperationDto {
  @ApiProperty({
    description: 'Array of collection IDs to operate on',
    type: [String],
  })
  @IsArray()
  @IsUUID(4, { each: true })
  collectionIds: string[];

  @ApiProperty({
    description: 'Operation type',
    enum: ['delete', 'restore', 'activate', 'deactivate'],
    example: 'delete',
  })
  @IsString()
  @IsNotEmpty()
  operation: 'delete' | 'restore' | 'activate' | 'deactivate';
}

/**
 * DTO for collection export
 */
export class CollectionExportDto {
  @ApiProperty({ description: 'Collection ID' })
  id: string;

  @ApiProperty({ description: 'Collection name' })
  name: string;

  @ApiPropertyOptional({ description: 'Collection icon' })
  icon?: string;

  @ApiPropertyOptional({ description: 'Parent collection ID' })
  parentId?: string;

  @ApiPropertyOptional({ description: 'Parent path' })
  parentPath?: string;

  @ApiProperty({ description: 'Full path' })
  path: string;

  @ApiPropertyOptional({ description: 'Collection description' })
  description?: string;

  @ApiProperty({ description: 'Sort order' })
  sortOrder: number;

  @ApiProperty({ description: 'Whether collection is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
