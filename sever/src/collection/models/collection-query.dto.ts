import { StringFieldOptional } from '@app/decorators';
import { QueryDto } from '@app/models';

// Define allowed filter and sort fields for collections
type CollectionFilterField =
  | 'name'
  | 'description'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt';
type CollectionSortField = 'name' | 'sortOrder' | 'createdAt' | 'updatedAt';

export class CollectionQueryDto extends QueryDto<
  CollectionFilterField,
  CollectionSortField
> {
  @StringFieldOptional()
  path?: string;
}
