import { UUIDField } from '@app/decorators';

/**
 * DTO for updating sort order of multiple collections
 */
export class UpdateSortOrderDto {
  @UUIDField({
    description: 'Array of collection IDs in desired order',
    example: ['uuid1', 'uuid2', 'uuid3'],
    each: true,
  })
  collectionIds: string[];
}
