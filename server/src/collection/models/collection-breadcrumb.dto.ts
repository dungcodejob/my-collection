import { StringField } from '@app/decorators';

/**
 * DTO for collection breadcrumb
 */
export class CollectionBreadcrumbDto {
  @StringField({ description: 'Collection ID' })
  id: string;

  @StringField({ description: 'Collection name' })
  name: string;

  @StringField({ description: 'Collection path' })
  path: string;
}
