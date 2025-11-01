import {
  StringField,
  BooleanFieldOptional,
  NumberFieldOptional,
} from '@app/decorators';

/**
 * DTO for collection select option
 */
export class CollectionSelectOptionDto {
  @StringField({ description: 'Collection ID (value)' })
  value: string;

  @StringField({ description: 'Collection name (label)' })
  label: string;

  @StringField({ description: 'Collection path' })
  path: string;

  @BooleanFieldOptional({ description: 'Whether option is disabled' })
  disabled?: boolean;

  @NumberFieldOptional({
    description: 'Hierarchy level (for nested display)',
    int: true,
    min: 0,
  })
  level?: number;
}
