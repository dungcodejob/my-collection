import { StringField, StringFieldOptional, EnumField } from '@app/decorators';

enum MatchType {
  NAME = 'name',
  PATH = 'path',
  DESCRIPTION = 'description',
}

/**
 * DTO for collection search result
 */
export class CollectionSearchResultDto {
  @StringField({ description: 'Collection ID' })
  id: string;

  @StringField({ description: 'Collection name' })
  name: string;

  @StringField({ description: 'Full path' })
  path: string;

  @StringFieldOptional({ description: 'Parent path' })
  parentPath?: string;

  @StringFieldOptional({ description: 'Collection icon' })
  icon?: string;

  @StringFieldOptional({ description: 'Collection description' })
  description?: string;

  @EnumField(() => MatchType, {
    description: 'Type of match',
    example: 'name',
  })
  matchType: 'name' | 'path' | 'description';
}
