import {
  BooleanFieldOptional,
  StringField,
  StringFieldOptional,
} from '@app/decorators';

export class TagCreateDto {
  @StringField({
    description: 'Name of the tag',
    example: 'web development',
    minLength: 1,
    maxLength: 100,
  })
  name: string;

  @StringFieldOptional({
    description: 'Description of the tag',
    example: 'Tags related to web development technologies',
    maxLength: 500,
  })
  description?: string;

  @StringFieldOptional({
    description: 'Color for the tag in hex format',
    example: '#3B82F6',
    isHexColor: true,
  })
  color?: string;

  @StringFieldOptional({
    description: 'Category to group similar tags',
    example: 'Technology',
    maxLength: 50,
  })
  category?: string;

  @BooleanFieldOptional({
    description: 'Whether this is a system-generated tag',
    example: false,
    default: false,
  })
  isSystem?: boolean = false;
}
