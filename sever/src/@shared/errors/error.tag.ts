import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TAG_ERROR_CODES } from './error-codes.constants';

export const Tag = {
  NotFound: new NotFoundException({
    message: 'Tag not found',
    error: TAG_ERROR_CODES.NOT_FOUND,
    statusCode: 404,
  }),

  AlreadyExists: new ConflictException({
    message: 'Tag with this name already exists',
    error: TAG_ERROR_CODES.ALREADY_EXISTS,
    statusCode: 409,
  }),

  CannotDelete: new BadRequestException({
    message: 'Cannot delete tag that is in use or is a system tag',
    error: TAG_ERROR_CODES.CANNOT_DELETE,
    statusCode: 400,
  }),

  CannotRemove: new ForbiddenException({
    message: 'Cannot remove this tag assignment',
    error: TAG_ERROR_CODES.CANNOT_REMOVE,
    statusCode: 403,
  }),

  AlreadyAssigned: new ConflictException({
    message: 'Tag is already assigned to this bookmark',
    error: TAG_ERROR_CODES.ALREADY_ASSIGNED,
    statusCode: 409,
  }),

  NotAssigned: new NotFoundException({
    message: 'Tag is not assigned to this bookmark',
    error: TAG_ERROR_CODES.NOT_ASSIGNED,
    statusCode: 404,
  }),

  InvalidName: (message?: string) =>
    new BadRequestException({
      message: message || 'Invalid tag name format',
      error: TAG_ERROR_CODES.INVALID_NAME,
      statusCode: 400,
    }),

  NameRequired: new BadRequestException({
    message: 'Tag name is required',
    error: TAG_ERROR_CODES.NAME_REQUIRED,
    statusCode: 400,
  }),

  NameTooLong: new BadRequestException({
    message: 'Tag name is too long (maximum 100 characters)',
    error: TAG_ERROR_CODES.NAME_TOO_LONG,
    statusCode: 400,
  }),

  DescriptionTooLong: new BadRequestException({
    message: 'Tag description is too long (maximum 500 characters)',
    error: TAG_ERROR_CODES.DESCRIPTION_TOO_LONG,
    statusCode: 400,
  }),

  InvalidColor: new BadRequestException({
    message: 'Invalid color format (must be hex color)',
    error: TAG_ERROR_CODES.INVALID_COLOR,
    statusCode: 400,
  }),

  InvalidCategory: new BadRequestException({
    message: 'Invalid category format',
    error: TAG_ERROR_CODES.INVALID_CATEGORY,
    statusCode: 400,
  }),

  SystemTagProtected: new ForbiddenException({
    message: 'System tags cannot be modified or deleted',
    error: TAG_ERROR_CODES.SYSTEM_TAG_PROTECTED,
    statusCode: 403,
  }),

  BulkOperationFailed: (message?: string) =>
    new UnprocessableEntityException({
      message: message || 'Bulk tag operation failed',
      error: TAG_ERROR_CODES.BULK_OPERATION_FAILED,
      statusCode: 422,
    }),

  AssignmentFailed: (message?: string) =>
    new UnprocessableEntityException({
      message: message || 'Tag assignment failed',
      error: TAG_ERROR_CODES.ASSIGNMENT_FAILED,
      statusCode: 422,
    }),

  UsageCountError: new UnprocessableEntityException({
    message: 'Error updating tag usage count',
    error: TAG_ERROR_CODES.USAGE_COUNT_ERROR,
    statusCode: 422,
  }),

  InvalidConfidence: new BadRequestException({
    message: 'Invalid confidence value (must be between 0 and 1)',
    error: TAG_ERROR_CODES.INVALID_CONFIDENCE,
    statusCode: 400,
  }),

  AutoGenerationFailed: new UnprocessableEntityException({
    message: 'Automatic tag generation failed',
    error: TAG_ERROR_CODES.AUTO_GENERATION_FAILED,
    statusCode: 422,
  }),
};
