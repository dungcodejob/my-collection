import { EnumField, UUIDField } from '@app/decorators';

enum BulkOperationType {
  DELETE = 'delete',
  RESTORE = 'restore',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
}

/**
 * DTO for bulk operations
 */
export class BulkCollectionOperationDto {
  @UUIDField({
    description: 'Array of collection IDs to operate on',
    each: true,
  })
  collectionIds: string[];

  @EnumField(() => BulkOperationType, {
    description: 'Operation type',
    example: 'delete',
  })
  operation: 'delete' | 'restore' | 'activate' | 'deactivate';
}
