import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

/**
 * DTO for collection response
 */
export class CollectionDto {
  @ApiProperty({ description: 'Collection ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Collection name', example: 'My Documents' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: 'Collection icon', example: 'folder' })
  @Expose()
  icon?: string;

  @ApiPropertyOptional({ description: 'Parent collection ID' })
  @Expose()
  @Transform(({ obj }) => obj.parent?.id, { toClassOnly: true })
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Parent path',
    example: 'Documents/Work',
  })
  @Expose()
  @Transform(({ obj }) => obj.parent?.path, { toClassOnly: true })
  parentPath?: string;

  @ApiProperty({ description: 'Full path', example: 'Documents/Work/Projects' })
  @Expose()
  path: string;

  @ApiPropertyOptional({ description: 'Collection description' })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Sort order', example: 0 })
  @Expose()
  sortOrder: number;

  @ApiProperty({
    description: 'Whether collection has children',
    example: true,
  })
  @Expose()
  isHasChild: boolean;

  @ApiProperty({ description: 'Whether collection is active', example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Creation date' })
  @Expose()
  @Transform(({ obj }) => obj.createAt || new Date(), { toClassOnly: true })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @Expose()
  @Transform(({ obj }) => obj.updateAt || new Date(), { toClassOnly: true })
  updatedAt: Date;
}
