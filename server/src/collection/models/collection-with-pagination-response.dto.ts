import { NumberField } from '@app/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { CollectionDto } from './collection.dto';

/**
 * DTO for paginated collection response
 */
export class CollectionWithPaginationResponseDto {
  @ApiProperty({
    description: 'Collections array',
    type: [CollectionDto],
  })
  collections: CollectionDto[];

  @NumberField({
    description: 'Total count of collections',
    example: 100,
    int: true,
    min: 0,
  })
  total: number;

  @NumberField({
    description: 'Current offset',
    example: 0,
    int: true,
    min: 0,
  })
  offset: number;

  @NumberField({
    description: 'Items per page',
    example: 20,
    int: true,
    min: 1,
  })
  limit: number;
}
