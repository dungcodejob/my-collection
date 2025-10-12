import {
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
} from '@app/decorators';

/**
 * DTO for updating a collection
 */
export class CollectionUpdateDto {
  @StringField({
    description: 'Collection name',
    example: 'Updated Documents',
    maxLength: 255,
  })
  name: string;

  @StringFieldOptional({
    description: 'Collection icon',
    example: 'folder-open',
    maxLength: 100,
  })
  icon?: string;

  @StringFieldOptional({
    description: 'Collection description',
    example: 'Updated description',
    maxLength: 1000,
  })
  description?: string;

  @NumberFieldOptional({
    description: 'Sort order',
    example: 1,
    min: 0,
    int: true,
  })
  sortOrder?: number;
}
