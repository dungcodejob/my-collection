import { UUIDFieldOptional } from '@app/decorators';

/**
 * DTO for moving a collection to new parent
 */
export class CollectionMoveDto {
  @UUIDFieldOptional({
    description: 'New parent collection ID (null for root level)',
  })
  newParentId?: string;
}
