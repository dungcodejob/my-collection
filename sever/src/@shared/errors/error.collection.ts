import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

export const Collection = {
  NotFound: new NotFoundException({
    message: 'Collection not found',
    error: 'COLLECTION_NOT_FOUND',
    statusCode: 404,
  }),

  AlreadyExists: new ConflictException({
    message: 'Collection with this name already exists in the same parent',
    error: 'COLLECTION_ALREADY_EXISTS',
    statusCode: 409,
  }),

  CannotMoveToSelf: new BadRequestException({
    message: 'Cannot move collection to itself',
    error: 'COLLECTION_CANNOT_MOVE_TO_SELF',
    statusCode: 400,
  }),

  CannotMoveToDescendant: new BadRequestException({
    message: 'Cannot move collection to its descendant',
    error: 'COLLECTION_CANNOT_MOVE_TO_DESCENDANT',
    statusCode: 400,
  }),

  InvalidParent: new BadRequestException({
    message: 'Invalid parent collection',
    error: 'COLLECTION_INVALID_PARENT',
    statusCode: 400,
  }),

  MaxDepthExceeded: new BadRequestException({
    message: 'Maximum collection depth exceeded',
    error: 'COLLECTION_MAX_DEPTH_EXCEEDED',
    statusCode: 400,
  }),

  NameRequired: new BadRequestException({
    message: 'Collection name is required',
    error: 'COLLECTION_NAME_REQUIRED',
    statusCode: 400,
  }),

  NameTooLong: new BadRequestException({
    message: 'Collection name is too long (maximum 255 characters)',
    error: 'COLLECTION_NAME_TOO_LONG',
    statusCode: 400,
  }),

  InvalidName: new BadRequestException({
    message: 'Collection name contains invalid characters',
    error: 'COLLECTION_INVALID_NAME',
    statusCode: 400,
  }),

  HasChildren: new ConflictException({
    message: 'Cannot delete collection that has children',
    error: 'COLLECTION_HAS_CHILDREN',
    statusCode: 409,
  }),

  NotEmpty: new ConflictException({
    message: 'Cannot delete collection that contains items',
    error: 'COLLECTION_NOT_EMPTY',
    statusCode: 409,
  }),

  AccessDenied: new BadRequestException({
    message: 'Access denied to this collection',
    error: 'COLLECTION_ACCESS_DENIED',
    statusCode: 403,
  }),

  InvalidSortOrder: new BadRequestException({
    message: 'Invalid sort order provided',
    error: 'COLLECTION_INVALID_SORT_ORDER',
    statusCode: 400,
  }),

  CircularReference: new BadRequestException({
    message: 'Circular reference detected in collection hierarchy',
    error: 'COLLECTION_CIRCULAR_REFERENCE',
    statusCode: 400,
  }),

  PathTooLong: new BadRequestException({
    message: 'Collection path is too long (maximum 500 characters)',
    error: 'COLLECTION_PATH_TOO_LONG',
    statusCode: 400,
  }),

  InvalidIcon: new BadRequestException({
    message: 'Invalid icon format or name',
    error: 'COLLECTION_INVALID_ICON',
    statusCode: 400,
  }),

  DescriptionTooLong: new BadRequestException({
    message: 'Collection description is too long (maximum 1000 characters)',
    error: 'COLLECTION_DESCRIPTION_TOO_LONG',
    statusCode: 400,
  }),

  AlreadyDeleted: new ConflictException({
    message: 'Collection is already deleted',
    error: 'COLLECTION_ALREADY_DELETED',
    statusCode: 409,
  }),

  CannotRestore: new BadRequestException({
    message: 'Cannot restore collection - parent may be deleted',
    error: 'COLLECTION_CANNOT_RESTORE',
    statusCode: 400,
  }),

  InvalidBulkOperation: new BadRequestException({
    message: 'Invalid bulk operation parameters',
    error: 'COLLECTION_INVALID_BULK_OPERATION',
    statusCode: 400,
  }),

  ExportFailed: new BadRequestException({
    message: 'Failed to export collections',
    error: 'COLLECTION_EXPORT_FAILED',
    statusCode: 400,
  }),

  ImportFailed: new BadRequestException({
    message: 'Failed to import collections',
    error: 'COLLECTION_IMPORT_FAILED',
    statusCode: 400,
  }),

  InvalidImportFormat: new BadRequestException({
    message: 'Invalid import file format',
    error: 'COLLECTION_INVALID_IMPORT_FORMAT',
    statusCode: 400,
  }),
};
