import {
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AUTH_ERROR_CODES, ERROR_MESSAGES } from './error-codes.constants';

export const Authentication = {
  EmailAlreadyExists: new BadRequestException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS],
    error: AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
    statusCode: 400,
  }),

  InvalidEmailOrUsername: new UnauthorizedException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_EMAIL_OR_USERNAME],
    error: AUTH_ERROR_CODES.INVALID_EMAIL_OR_USERNAME,
    statusCode: 401,
  }),

  InvalidCredentials: new UnauthorizedException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS],
    error: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
    statusCode: 401,
  }),

  InvalidToken: new UnauthorizedException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_TOKEN],
    error: AUTH_ERROR_CODES.INVALID_TOKEN,
    statusCode: 401,
  }),

  InvalidRefreshToken: new UnauthorizedException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN],
    error: AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN,
    statusCode: 401,
  }),

  Unauthorized: new UnauthorizedException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.UNAUTHORIZED],
    error: AUTH_ERROR_CODES.UNAUTHORIZED,
    statusCode: 401,
  }),

  AccessDenied: new UnauthorizedException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.ACCESS_DENIED],
    error: AUTH_ERROR_CODES.ACCESS_DENIED,
    statusCode: 401,
  }),

  SessionExpired: new UnauthorizedException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.SESSION_EXPIRED],
    error: AUTH_ERROR_CODES.SESSION_EXPIRED,
    statusCode: 401,
  }),

  AccountLocked: new HttpException(
    {
      message: ERROR_MESSAGES[AUTH_ERROR_CODES.ACCOUNT_LOCKED],
      error: AUTH_ERROR_CODES.ACCOUNT_LOCKED,
    },
    HttpStatus.LOCKED,
  ),

  AccountDisabled: new HttpException(
    {
      message: ERROR_MESSAGES[AUTH_ERROR_CODES.ACCOUNT_DISABLED],
      error: AUTH_ERROR_CODES.ACCOUNT_DISABLED,
    },
    HttpStatus.FORBIDDEN,
  ),

  PasswordExpired: new BadRequestException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.PASSWORD_EXPIRED],
    error: AUTH_ERROR_CODES.PASSWORD_EXPIRED,
    statusCode: 400,
  }),

  WeakPassword: new BadRequestException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.WEAK_PASSWORD],
    error: AUTH_ERROR_CODES.WEAK_PASSWORD,
    statusCode: 400,
  }),

  PasswordReuse: new BadRequestException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.PASSWORD_REUSE],
    error: AUTH_ERROR_CODES.PASSWORD_REUSE,
    statusCode: 400,
  }),

  TooManyLoginAttempts: new HttpException(
    {
      message: ERROR_MESSAGES[AUTH_ERROR_CODES.TOO_MANY_LOGIN_ATTEMPTS],
      error: AUTH_ERROR_CODES.TOO_MANY_LOGIN_ATTEMPTS,
    },
    HttpStatus.TOO_MANY_REQUESTS,
  ),

  EmailNotVerified: new BadRequestException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED],
    error: AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED,
    statusCode: 400,
  }),

  VerificationTokenExpired: new BadRequestException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.VERIFICATION_TOKEN_EXPIRED],
    error: AUTH_ERROR_CODES.VERIFICATION_TOKEN_EXPIRED,
    statusCode: 400,
  }),

  InvalidVerificationToken: new BadRequestException({
    message: ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_VERIFICATION_TOKEN],
    error: AUTH_ERROR_CODES.INVALID_VERIFICATION_TOKEN,
    statusCode: 400,
  }),
};
