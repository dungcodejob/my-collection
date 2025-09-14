import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BOOKMARK_ERROR_CODES } from './error-codes.constants';

export const Bookmark = {
  NotFound: new NotFoundException({
    message: 'Bookmark not found',
    error: BOOKMARK_ERROR_CODES.NOT_FOUND,
    statusCode: 404,
  }),

  AlreadyExists: new ConflictException({
    message: 'Bookmark with this URL already exists',
    error: BOOKMARK_ERROR_CODES.ALREADY_EXISTS,
    statusCode: 409,
  }),

  InvalidUrl: (message?: string) =>
    new BadRequestException({
      message: message || 'Invalid URL format',
      error: BOOKMARK_ERROR_CODES.INVALID_URL,
      statusCode: 400,
    }),

  UrlRequired: new BadRequestException({
    message: 'URL is required',
    error: BOOKMARK_ERROR_CODES.URL_REQUIRED,
    statusCode: 400,
  }),

  TitleRequired: new BadRequestException({
    message: 'Title is required',
    error: BOOKMARK_ERROR_CODES.TITLE_REQUIRED,
    statusCode: 400,
  }),

  TitleTooLong: new BadRequestException({
    message: 'Title is too long (maximum 500 characters)',
    error: BOOKMARK_ERROR_CODES.TITLE_TOO_LONG,
    statusCode: 400,
  }),

  DescriptionTooLong: new BadRequestException({
    message: 'Description is too long (maximum 1000 characters)',
    error: BOOKMARK_ERROR_CODES.DESCRIPTION_TOO_LONG,
    statusCode: 400,
  }),

  InvalidCollection: new BadRequestException({
    message: 'Invalid collection specified',
    error: BOOKMARK_ERROR_CODES.INVALID_COLLECTION,
    statusCode: 400,
  }),

  AccessDenied: new ForbiddenException({
    message: 'Access denied to this bookmark',
    error: BOOKMARK_ERROR_CODES.ACCESS_DENIED,
    statusCode: 403,
  }),

  BulkOperationFailed: (message?: string) =>
    new UnprocessableEntityException({
      message: message || 'Bulk operation failed',
      error: BOOKMARK_ERROR_CODES.BULK_OPERATION_FAILED,
      statusCode: 422,
    }),

  InvalidTags: new BadRequestException({
    message: 'Invalid tags format',
    error: BOOKMARK_ERROR_CODES.INVALID_TAGS,
    statusCode: 400,
  }),

  TooManyTags: new BadRequestException({
    message: 'Too many tags (maximum 20 tags allowed)',
    error: BOOKMARK_ERROR_CODES.TOO_MANY_TAGS,
    statusCode: 400,
  }),

  DuplicateInCollection: new ConflictException({
    message: 'Bookmark already exists in this collection',
    error: BOOKMARK_ERROR_CODES.DUPLICATE_IN_COLLECTION,
    statusCode: 409,
  }),

  CannotMoveToCollection: new BadRequestException({
    message: 'Cannot move bookmark to the specified collection',
    error: BOOKMARK_ERROR_CODES.CANNOT_MOVE_TO_COLLECTION,
    statusCode: 400,
  }),

  MetadataExtractionFailed: new UnprocessableEntityException({
    message: 'Failed to extract metadata from URL',
    error: BOOKMARK_ERROR_CODES.METADATA_EXTRACTION_FAILED,
    statusCode: 422,
  }),

  InvalidFavoriteStatus: new BadRequestException({
    message: 'Invalid favorite status',
    error: BOOKMARK_ERROR_CODES.INVALID_FAVORITE_STATUS,
    statusCode: 400,
  }),

  VisitCountError: new UnprocessableEntityException({
    message: 'Error updating visit count',
    error: BOOKMARK_ERROR_CODES.VISIT_COUNT_ERROR,
    statusCode: 422,
  }),

  ExportFailed: new UnprocessableEntityException({
    message: 'Failed to export bookmarks',
    error: BOOKMARK_ERROR_CODES.EXPORT_FAILED,
    statusCode: 422,
  }),

  ImportFailed: (message?: string) =>
    new UnprocessableEntityException({
      message: message || 'Failed to import bookmarks',
      error: BOOKMARK_ERROR_CODES.IMPORT_FAILED,
      statusCode: 422,
    }),
};
