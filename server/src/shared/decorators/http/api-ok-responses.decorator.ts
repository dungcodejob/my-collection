import { BaseResponseDto } from '@app/models';
import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
/**
 * Generic Single Response Decorator
 * Sử dụng applyDecorators và getSchemaPath để tạo response documentation
 */
export const ApiOkResponseSingle = <
  GenericType extends Type<unknown>,
>(options: {
  dataType?: GenericType;
  description: string;
}) => {
  const {
    dataType,
    description = `Successful response with ${dataType?.name} data`,
  } = options;
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
export const ApiOkResponseList = <GenericType extends Type<unknown>>(options: {
  itemType: GenericType;
  description: string;
}) => {
  const {
    itemType,
    description = `Successful list response with ${itemType.name} items`,
  } = options;

  return applyDecorators(
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
};

/**
 * Generic Pagination Response Decorator
 */
export const ApiOkResponsePagination = <
  GenericType extends Type<unknown>,
>(options: {
  itemType: GenericType;
  description: string;
}) => {
  const {
    itemType,
    description = `Successful paginated response with ${itemType.name} items`,
  } = options;
  return applyDecorators(
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
};

// Legacy factory functions for backward compatibility
// Deprecated: Use decorators above instead
export const createSwaggerResponseDto = <T>(dataType: Type<T>) =>
  ApiOkResponseSingle({ dataType, description: '' });
export const createSwaggerListResponseDto = <T>(itemType: Type<T>) =>
  ApiOkResponseList({ itemType, description: '' });
export const createSwaggerPaginationResponseDto = <T>(itemType: Type<T>) =>
  ApiOkResponsePagination({ itemType, description: '' });
