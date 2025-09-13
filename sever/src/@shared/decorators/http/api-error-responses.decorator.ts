import { BaseResponseDto } from '@app/models';
import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * Error Response Interface
 */
export interface ErrorResponseConfig {
  status: number;
  description: string;
  example?: any;
}

/**
 * Common Error Examples
 */
export const validationErrorExample = {
  statusCode: 400,
  errorCode: 'Validation.Failed',
  success: false,
  message: 'Validation failed',
  result: {
    meta: {
      errors: [
        {
          field: 'email',
          message: 'Email must be a valid email address',
          value: 'invalid-email',
        },
        {
          field: 'password',
          message: 'Password must be at least 8 characters long',
          value: '123',
        },
      ],
    },
  },
  timestamp: '2024-01-01T00:00:00.000Z',
  url: '/api/auth/register',
  method: 'POST',
};

export const unauthorizedExample = {
  statusCode: 401,
  errorCode: 'Auth.Unauthorized',
  success: false,
  message: 'Unauthorized',
  result: null,
  timestamp: '2024-01-01T00:00:00.000Z',
  url: '/api/users/profile',
  method: 'GET',
};

export const forbiddenExample = {
  statusCode: 403,
  errorCode: 'Auth.Forbidden',
  success: false,
  message: 'Forbidden - Insufficient permissions',
  result: null,
  timestamp: '2024-01-01T00:00:00.000Z',
  url: '/api/admin/users',
  method: 'GET',
};

export const notFoundExample = {
  statusCode: 404,
  errorCode: 'Resource.NotFound',
  success: false,
  message: 'Resource not found',
  result: null,
  timestamp: '2024-01-01T00:00:00.000Z',
  url: '/api/users/999',
  method: 'GET',
};

export const rateLimitExample = {
  statusCode: 429,
  errorCode: 'RateLimit.Exceeded',
  success: false,
  message: 'Too many requests. Please try again later.',
  result: {
    meta: {
      limit: 100,
      remaining: 0,
      resetTime: '2024-01-01T01:00:00.000Z',
    },
  },
  timestamp: '2024-01-01T00:00:00.000Z',
  url: '/api/auth/login',
  method: 'POST',
};

export const internalServerErrorExample = {
  statusCode: 500,
  errorCode: 'App.InternalServerError',
  success: false,
  message: 'Internal server error',
  result: null,
  timestamp: '2024-01-01T00:00:00.000Z',
  url: '/api/collections',
  method: 'POST',
};

export const conflictExample = {
  statusCode: 409,
  errorCode: 'Resource.Conflict',
  success: false,
  message: 'Resource already exists',
  result: {
    meta: {
      conflictField: 'email',
      conflictValue: 'user@example.com',
    },
  },
  timestamp: '2024-01-01T00:00:00.000Z',
  url: '/api/auth/register',
  method: 'POST',
};

export const unprocessableEntityExample = {
  statusCode: 422,
  errorCode: 'Validation.UnprocessableEntity',
  success: false,
  message: 'The request was well-formed but contains semantic errors',
  result: {
    meta: {
      errors: [
        {
          field: 'url',
          message: 'URL is not accessible',
          value: 'https://invalid-domain.xyz',
        },
      ],
    },
  },
  timestamp: '2024-01-01T00:00:00.000Z',
  url: '/api/bookmarks',
  method: 'POST',
};

/**
 * Predefined Error Response Sets
 */
export const COMMON_ERROR_RESPONSES: ErrorResponseConfig[] = [
  {
    status: 400,
    description: 'Validation Error',
    example: validationErrorExample,
  },
  { status: 401, description: 'Unauthorized', example: unauthorizedExample },
  {
    status: 500,
    description: 'Internal Server Error',
    example: internalServerErrorExample,
  },
];

export const AUTH_ERROR_RESPONSES: ErrorResponseConfig[] = [
  {
    status: 400,
    description: 'Validation Error',
    example: validationErrorExample,
  },
  { status: 401, description: 'Unauthorized', example: unauthorizedExample },
  { status: 429, description: 'Rate Limited', example: rateLimitExample },
  {
    status: 500,
    description: 'Internal Server Error',
    example: internalServerErrorExample,
  },
];

export const CRUD_ERROR_RESPONSES: ErrorResponseConfig[] = [
  {
    status: 400,
    description: 'Validation Error',
    example: validationErrorExample,
  },
  { status: 401, description: 'Unauthorized', example: unauthorizedExample },
  { status: 403, description: 'Forbidden', example: forbiddenExample },
  { status: 404, description: 'Not Found', example: notFoundExample },
  { status: 409, description: 'Conflict', example: conflictExample },
  {
    status: 422,
    description: 'Unprocessable Entity',
    example: unprocessableEntityExample,
  },
  {
    status: 500,
    description: 'Internal Server Error',
    example: internalServerErrorExample,
  },
];

/**
 * Custom API Error Responses Decorator
 *
 * @param errorConfigs Array of error response configurations
 * @returns Combined decorators for all error responses
 *
 * @example
 * ```typescript
 * @ApiErrorResponses([
 *   { status: 400, description: 'Validation Error', example: validationErrorExample },
 *   { status: 401, description: 'Unauthorized', example: unauthorizedExample },
 *   { status: 429, description: 'Rate Limited', example: rateLimitExample }
 * ])
 * @Post('login')
 * async login() { ... }
 * ```
 *
 * @example
 * // Using predefined sets
 * @ApiErrorResponses(AUTH_ERROR_RESPONSES)
 * @Post('login')
 * async login() { ... }
 *
 * @ApiErrorResponses(CRUD_ERROR_RESPONSES)
 * @Get(':id')
 * async findOne() { ... }
 */
export const ApiErrorResponses = (errorConfigs: ErrorResponseConfig[]) => {
  const decorators = [
    ApiExtraModels(BaseResponseDto),
    ...errorConfigs.map((config) =>
      ApiResponse({
        status: config.status,
        description: config.description,
        schema: {
          allOf: [
            { $ref: getSchemaPath(BaseResponseDto) },
            {
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                result: {
                  type: 'object',
                  nullable: true,
                  example: config.example?.result || null,
                },
              },
            },
          ],
          example: config.example,
        },
      }),
    ),
  ];

  return applyDecorators(...decorators);
};

/**
 * Shorthand decorators for common error response sets
 */
export const ApiCommonErrors = () => ApiErrorResponses(COMMON_ERROR_RESPONSES);
export const ApiAuthErrors = () => ApiErrorResponses(AUTH_ERROR_RESPONSES);
export const ApiCrudErrors = () => ApiErrorResponses(CRUD_ERROR_RESPONSES);
