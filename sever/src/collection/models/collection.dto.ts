import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for collection response
 */
export class CollectionDto {
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
