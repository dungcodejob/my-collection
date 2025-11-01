import {
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
  UUIDFieldOptional,
} from '@app/decorators';

/**
 * DTO for creating a new collection
 */
export class CollectionCreateDto {
  @StringField({
    description: 'Collection name',
    example: 'My Documents',
    maxLength: 255,
  })
  name: string;

  @StringFieldOptional({
    description: 'Collection icon',
    example: 'folder',
    maxLength: 100,
  })
  icon?: string;

  @UUIDFieldOptional({
    description: 'Parent collection ID',
  })
  parentId?: string;

  @StringFieldOptional({
    description: 'Collection description',
    example: 'Important documents and files',
    maxLength: 1000,
  })
  description?: string;

  @NumberFieldOptional({
    description: 'Sort order',
    example: 0,
    min: 0,
    int: true,
  })
  sortOrder?: number;
}
