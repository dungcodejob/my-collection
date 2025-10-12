import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ERROR_MESSAGES, USER_ERROR_CODES } from './error-codes.constants';

export const User = {
  NotFound: new NotFoundException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.NOT_FOUND],
    error: USER_ERROR_CODES.NOT_FOUND,
    statusCode: 404,
  }),

  NotExist: new BadRequestException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.NOT_EXIST],
    error: USER_ERROR_CODES.NOT_EXIST,
    statusCode: 400,
  }),

  InvalidData: new BadRequestException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.INVALID_DATA],
    error: USER_ERROR_CODES.INVALID_DATA,
    statusCode: 400,
  }),

  EmailRequired: new BadRequestException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.EMAIL_REQUIRED],
    error: USER_ERROR_CODES.EMAIL_REQUIRED,
    statusCode: 400,
  }),

  InvalidEmail: new BadRequestException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.INVALID_EMAIL],
    error: USER_ERROR_CODES.INVALID_EMAIL,
    statusCode: 400,
  }),

  UsernameRequired: new BadRequestException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.USERNAME_REQUIRED],
    error: USER_ERROR_CODES.USERNAME_REQUIRED,
    statusCode: 400,
  }),

  UsernameTooShort: new BadRequestException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.USERNAME_TOO_SHORT],
    error: USER_ERROR_CODES.USERNAME_TOO_SHORT,
    statusCode: 400,
  }),

  UsernameTooLong: new BadRequestException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.USERNAME_TOO_LONG],
    error: USER_ERROR_CODES.USERNAME_TOO_LONG,
    statusCode: 400,
  }),

  UsernameInvalidCharacters: new BadRequestException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.USERNAME_INVALID_CHARACTERS],
    error: USER_ERROR_CODES.USERNAME_INVALID_CHARACTERS,
    statusCode: 400,
  }),

  UsernameAlreadyExists: new ConflictException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.USERNAME_ALREADY_EXISTS],
    error: USER_ERROR_CODES.USERNAME_ALREADY_EXISTS,
    statusCode: 409,
  }),

  ProfileUpdateFailed: new UnprocessableEntityException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.PROFILE_UPDATE_FAILED],
    error: USER_ERROR_CODES.PROFILE_UPDATE_FAILED,
    statusCode: 422,
  }),

  AvatarUploadFailed: new UnprocessableEntityException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.AVATAR_UPLOAD_FAILED],
    error: USER_ERROR_CODES.AVATAR_UPLOAD_FAILED,
    statusCode: 422,
  }),

  InvalidAvatarFormat: new BadRequestException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.INVALID_AVATAR_FORMAT],
    error: USER_ERROR_CODES.INVALID_AVATAR_FORMAT,
    statusCode: 400,
  }),

  AvatarTooLarge: new BadRequestException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.AVATAR_TOO_LARGE],
    error: USER_ERROR_CODES.AVATAR_TOO_LARGE,
    statusCode: 400,
  }),

  PreferencesUpdateFailed: new UnprocessableEntityException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.PREFERENCES_UPDATE_FAILED],
    error: USER_ERROR_CODES.PREFERENCES_UPDATE_FAILED,
    statusCode: 422,
  }),

  AccountDeletionFailed: new UnprocessableEntityException({
    message: ERROR_MESSAGES[USER_ERROR_CODES.ACCOUNT_DELETION_FAILED],
    error: USER_ERROR_CODES.ACCOUNT_DELETION_FAILED,
    statusCode: 422,
  }),
};

// Backward compatibility aliases
export const UserNotExist = User.NotExist;
export const UserNotFound = User.NotFound;
export const InvalidUserData = User.InvalidData;
