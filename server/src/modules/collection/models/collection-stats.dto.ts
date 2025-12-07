import { NumberField } from '@app/decorators';

/**
 * DTO for collection statistics
 */
export class CollectionStatsDto {
  @NumberField({
    description: 'Total collections count',
    int: true,
    min: 0,
  })
  totalCollections: number;

  @NumberField({
    description: 'Root collections count',
    int: true,
    min: 0,
  })
  rootCollections: number;

  @NumberField({
    description: 'Active collections count',
    int: true,
    min: 0,
  })
  activeCollections: number;

  @NumberField({
    description: 'Deleted collections count',
    int: true,
    min: 0,
  })
  deletedCollections: number;

  @NumberField({
    description: 'Maximum depth level',
    int: true,
    min: 0,
  })
  maxDepth: number;

  @NumberField({
    description: 'Average children per collection',
    min: 0,
  })
  avgChildrenPerCollection: number;
}
