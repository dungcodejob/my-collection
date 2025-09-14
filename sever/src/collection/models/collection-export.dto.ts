import {
  BooleanField,
  DateField,
  NumberField,
  StringField,
  StringFieldOptional,
} from '@app/decorators';

/**
 * DTO for collection export
 */
export class CollectionExportDto {
  @StringField({ description: 'Collection ID' })
  id: string;

  @StringField({ description: 'Collection name' })
  name: string;

  @StringFieldOptional({ description: 'Collection icon' })
  icon?: string;

  @StringFieldOptional({ description: 'Parent collection ID' })
  parentId?: string;

  @StringFieldOptional({ description: 'Parent path' })
  parentPath?: string;

  @StringField({ description: 'Full path' })
  path: string;

  @StringFieldOptional({ description: 'Collection description' })
  description?: string;

  @NumberField({
    description: 'Sort order',
    int: true,
    min: 0,
  })
  sortOrder: number;

  @BooleanField({ description: 'Whether collection is active' })
  isActive: boolean;

  @DateField({ description: 'Creation date' })
  createdAt: Date;

  @DateField({ description: 'Last update date' })
  updatedAt: Date;
}
