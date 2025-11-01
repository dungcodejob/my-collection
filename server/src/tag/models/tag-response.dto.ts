import {
  BooleanField,
  DateField,
  NumberField,
  StringField,
  StringFieldOptional,
  UUIDFieldOptional,
} from '@app/decorators';

export class TagResponseDto {
  @UUIDFieldOptional({
    description: 'Unique identifier of the tag',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @StringField({
    description: 'Name of the tag',
    example: 'web development',
  })
  name: string;

  @StringField({
    description: 'Display name of the tag (capitalized)',
    example: 'Web development',
  })
  displayName: string;

  @StringFieldOptional({
    description: 'Description of the tag',
    example: 'Tags related to web development technologies',
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
  })
  category?: string;

  @NumberField({
    description: 'Number of times this tag has been used',
    example: 15,
    int: true,
    min: 0,
  })
  usageCount: number;

  @BooleanField({
    description: 'Whether the tag is active',
    example: true,
  })
  isActive: boolean;

  @BooleanField({
    description: 'Whether this is a system-generated tag',
    example: false,
  })
  isSystem: boolean;

  @UUIDFieldOptional({
    description: 'ID of the user who created this tag',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  authorId?: string;

  @DateField({
    description: 'Creation timestamp',
    example: '2023-12-01T10:00:00Z',
  })
  createdAt: Date;

  @DateField({
    description: 'Last update timestamp',
    example: '2023-12-01T10:00:00Z',
  })
  updatedAt: Date;
}
