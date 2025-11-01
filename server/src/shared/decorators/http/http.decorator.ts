import { SWAGGER_SCHEME } from '@app/constants';
import { applyDecorators, HttpCode, HttpStatus, Type } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';
import { STATUS_CODES } from 'http';
import { Public } from '../public.decorator';
import {
  ApiErrorResponses,
  ErrorResponseConfig,
} from './api-error-responses.decorator';
import {
  ApiOkResponseList,
  ApiOkResponsePagination,
  ApiOkResponseSingle,
} from './api-ok-responses.decorator';

type ErrorResponseStatus = number;
type ApiAuthType = 'basic' | 'api-key' | 'jwt';
type PaginationType = 'offset' | 'cursor';
type ResponseType = 'single' | 'list' | 'pagination';

interface IApiOptions<T extends Type<unknown>> {
  type?: T;
  summary?: string;
  description?: string;
  errorResponses?: ErrorResponseStatus[];
  statusCode?: HttpStatus;
  responseType?: ResponseType;
  paginationType?: PaginationType;
}

type IApiPublicOptions = IApiOptions<Type<unknown>>;

interface IApiAuthOptions extends IApiOptions<Type<unknown>> {
  auths?: ApiAuthType[];
}

export const ApiPublic = (options: IApiPublicOptions = {}): MethodDecorator => {
  const defaultStatusCode = HttpStatus.OK;
  const defaultErrorResponses = [
    HttpStatus.BAD_REQUEST,
    HttpStatus.FORBIDDEN,
    HttpStatus.NOT_FOUND,
    HttpStatus.UNPROCESSABLE_ENTITY,
    HttpStatus.INTERNAL_SERVER_ERROR,
  ];

  const errorResponses = (options.errorResponses || defaultErrorResponses)?.map(
    (statusCode) =>
      ({
        status: statusCode,
        description: STATUS_CODES[statusCode],
      }) as ErrorResponseConfig,
  );

  const decorators = [
    Public(),
    ApiErrorResponses(errorResponses),
    ApiOperation({ summary: options?.summary }),
    HttpCode(options.statusCode || defaultStatusCode),
  ];

  if (options.type) {
    switch (options.responseType) {
      case 'pagination': {
        decorators.push(
          ApiOkResponsePagination({
            itemType: options.type,
            description: options?.description ?? 'OK',
          }),
        );
        break;
      }
      case 'list': {
        decorators.push(
          ApiOkResponseList({
            itemType: options.type,
            description: options?.description ?? 'OK',
          }),
        );
        break;
      }
      case 'single': {
        decorators.push(
          ApiOkResponseSingle({
            dataType: options.type,
            description: options?.description ?? 'OK',
          }),
        );
        break;
      }
    }
  }

  return applyDecorators(...decorators);
};

export const ApiAuth = (options: IApiAuthOptions = {}): MethodDecorator => {
  const defaultStatusCode = HttpStatus.OK;
  const defaultErrorResponses = [
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.FORBIDDEN,
    HttpStatus.NOT_FOUND,
    HttpStatus.UNPROCESSABLE_ENTITY,
    HttpStatus.INTERNAL_SERVER_ERROR,
  ];

  const auths = options.auths || ['jwt'];

  const errorResponses = (options.errorResponses || defaultErrorResponses)?.map(
    (statusCode) =>
      ({
        status: statusCode,
        description: STATUS_CODES[statusCode],
      }) as ErrorResponseConfig,
  );

  const authDecorators = auths.map((auth) => {
    switch (auth) {
      case 'basic':
        return ApiBasicAuth(SWAGGER_SCHEME.BASIC_AUTH);
      case 'api-key':
        return ApiSecurity(SWAGGER_SCHEME.API_KEY);
      case 'jwt':
        return ApiBearerAuth(SWAGGER_SCHEME.JWT_AUTH);
    }
  });

  const decorators = [
    ...authDecorators,
    ApiErrorResponses(errorResponses),
    ApiOperation({ summary: options?.summary }),
    HttpCode(options.statusCode || defaultStatusCode),
  ];

  const responseType = options.responseType || 'single';
  if (options.type) {
    switch (responseType) {
      case 'pagination': {
        decorators.push(
          ApiOkResponsePagination({
            itemType: options.type,
            description: options?.description ?? 'OK',
          }),
        );
        break;
      }
      case 'list': {
        decorators.push(
          ApiOkResponseList({
            itemType: options.type,
            description: options?.description ?? 'OK',
          }),
        );
        break;
      }
      case 'single': {
        decorators.push(
          ApiOkResponseSingle({
            dataType: options.type,
            description: options?.description ?? 'OK',
          }),
        );
        break;
      }
    }
  } else {
    decorators.push(
      ApiOkResponseSingle({ description: options?.description ?? 'OK' }),
    );
  }

  return applyDecorators(...decorators);
};
