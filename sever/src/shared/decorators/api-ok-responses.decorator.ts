import { BaseResponseDto } from '@app/models';
import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
/**
 * Generic Single Response Decorator
 * Sử dụng applyDecorators và getSchemaPath để tạo response documentation
 */
export const ApiOkResponseSingle = <GenericType extends Type<unknown>>(
  dataType: GenericType | null,
  description: string = `Successful response with ${dataType?.name} data`,
) => {
  if (dataType) {
    return applyDecorators(
      ApiExtraModels(BaseResponseDto, dataType),
      ApiOkResponse({
        description,
        schema: {
          allOf: [
            { $ref: getSchemaPath(BaseResponseDto) },
            {
              properties: {
                success: {
                  type: 'boolean',
                  example: true,
                },
                result: {
                  type: 'object',
                  properties: {
                    data: { $ref: getSchemaPath(dataType) },
                  },
                },
              },
            },
          ],
        },
      }),
    );
  }

  return applyDecorators(
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: {
              success: {
                type: 'boolean',
                example: true,
              },
            },
          },
        ],
      },
    }),
  );
};

/**
 * Generic List Response Decorator
 */
export const ApiOkResponseList = <GenericType extends Type<unknown>>(
  itemType: GenericType,
  description: string = `Successful list response with ${itemType.name} items`,
) =>
  applyDecorators(
    ApiExtraModels(BaseResponseDto, itemType),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: {
              success: {
                type: 'boolean',
                example: true,
              },
              result: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(itemType) },
                  },
                  meta: {
                    type: 'object',
                    properties: {
                      count: {
                        type: 'number',
                        example: 0,
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );

/**
 * Generic Pagination Response Decorator
 */
export const ApiOkResponsePagination = <GenericType extends Type<unknown>>(
  itemType: GenericType,
  description: string = `Successful paginated response with ${itemType.name} items`,
) =>
  applyDecorators(
    ApiExtraModels(BaseResponseDto, itemType),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: {
              success: {
                type: 'boolean',
                example: true,
              },
              result: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(itemType) },
                  },
                  meta: {
                    type: 'object',
                    properties: {
                      pagination: {
                        type: 'object',
                        properties: {
                          page: {
                            type: 'number',
                            example: 1,
                          },
                          limit: {
                            type: 'number',
                            example: 10,
                          },
                          total: {
                            type: 'number',
                            example: 100,
                          },
                          totalPages: {
                            type: 'number',
                            example: 10,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );

// Legacy factory functions for backward compatibility
// Deprecated: Use decorators above instead
export const createSwaggerResponseDto = <T>(dataType: Type<T>) =>
  ApiOkResponseSingle(dataType);
export const createSwaggerListResponseDto = <T>(itemType: Type<T>) =>
  ApiOkResponseList(itemType);
export const createSwaggerPaginationResponseDto = <T>(itemType: Type<T>) =>
  ApiOkResponsePagination(itemType);
