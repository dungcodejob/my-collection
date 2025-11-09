import {
  StringField,
  StringFieldOptional,
  URLField,
  URLFieldOptional,
  UUIDFieldOptional,
} from '@app/decorators';

export class BookmarkCreateDto {
  @URLField({
    description: 'URL of the bookmark',
    example: 'https://example.com',
    maxLength: 2048,
    message: 'URL must be a valid URL',
    maxLengthMessage: 'URL must not exceed 2048 characters',
  })
  url: string;

  @StringField({
    description: 'Title of the bookmark',
    example: 'Example Website',
    maxLength: 500,
    message: 'Title must be a string',
    maxLengthMessage: 'Title must not exceed 500 characters',
  })
  title: string;

  @StringFieldOptional({
    description: 'Description of the bookmark',
    example: 'This is an example website',
    maxLength: 1000,
    message: 'Description must be a string',
    maxLengthMessage: 'Description must not exceed 1000 characters',
  })
  description?: string;

  @URLFieldOptional({
    description: 'Image URL for the bookmark',
    example: 'https://example.com/image.jpg',
    maxLength: 2048,
    message: 'Image URL must be a valid URL',
    maxLengthMessage: 'Image URL must not exceed 2048 characters',
  })
  imageUrl?: string;

  @URLFieldOptional({
    description: 'Favicon URL for the bookmark',
    example: 'https://example.com/favicon.ico',
    maxLength: 2048,
    message: 'Favicon URL must be a valid URL',
    maxLengthMessage: 'Favicon URL must not exceed 2048 characters',
  })
  faviconUrl?: string;

  @StringFieldOptional({
    description: 'Site name',
    example: 'Example Site',
    maxLength: 100,
    message: 'Site name must be a string',
    maxLengthMessage: 'Site name must not exceed 100 characters',
  })
  siteName?: string;

  @UUIDFieldOptional({
    description: 'Collection ID to add bookmark to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    message: 'Collection ID must be a valid UUID',
  })
  collectionId?: string;

  @StringFieldOptional({
    description: 'Tags for the bookmark',
    example: ['web', 'development', 'tutorial'],
    each: true,
    message: 'Each tag must be a string',
  })
  tags?: string[];

  @StringFieldOptional({
    description: 'Personal notes about the bookmark',
    example: 'Great resource for learning web development',
    maxLength: 2000,
    message: 'Notes must be a string',
    maxLengthMessage: 'Notes cannot exceed 2000 characters',
  })
  notes?: string;
}
