import { BadRequestException, applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiQuery } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, validateSync } from 'class-validator';

// Types and interfaces
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export type Sort<TField extends string = string> = {
  field: TField;
  direction: SortDirection;
};

type RawSort = string;

// DTO for validation
class RawSortDto {
  @IsArray()
  @IsString({ each: true })
  sorts: RawSort[];
}

/**
 * Parse a single sort string in format "fieldName:sortType"
 * @param sortString - String in format "field:direction"
 * @returns ParsedSort object with field and direction
 * @throws BadRequestException if format is invalid
 */
function parseSingle(sortString: string): Sort {
  const trimmed = sortString.trim();

  if (!trimmed) {
    throw new BadRequestException('Sort string cannot be empty');
  }

  const parts = trimmed.split(':');

  if (parts.length !== 2) {
    throw new BadRequestException(
      `Invalid sort format: "${sortString}". Expected format: "fieldName:sortType"`,
    );
  }

  const [field, direction] = parts.map((part) => part.trim());

  if (!field) {
    throw new BadRequestException(
      `Field name cannot be empty in sort: "${sortString}"`,
    );
  }

  if (!direction) {
    throw new BadRequestException(
      `Sort direction cannot be empty in sort: "${sortString}"`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (direction !== SortDirection.ASC && direction !== SortDirection.DESC) {
    throw new BadRequestException(
      `Invalid sort direction: "${direction}". Must be "${SortDirection.ASC}" or "${SortDirection.DESC}"`,
    );
  }

  return {
    field,
    direction: direction as SortDirection,
  };
}

/**
 * Transform decorator for parsing sort query parameters
 * Accepts both string and string[] inputs
 * Supports comma-separated values in strings
 *
 * @example
 * // Single sort: ?sort=name:asc
 * // Multiple sorts: ?sort=name:asc,created:desc
 * // Array format: ?sort=name:asc&sort=created:desc
 *
 * @returns Array of ParsedSort objects
 */
export function ParseSort() {
  return applyDecorators(
    IsOptional(),
    Transform(({ value }) => {
      // Normalize input to array of strings
      let rawValues: RawSort[] = [];

      if (value == null) {
        rawValues = [];
      } else if (typeof value === 'string') {
        rawValues = value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
      } else if (Array.isArray(value)) {
        rawValues = (value as string[])
          .flatMap((v) => String(v).split(','))
          .map((v) => v.trim())
          .filter(Boolean);
      } else {
        throw new BadRequestException('sort must be string or string[]');
      }

      // Validate raw container shape first
      const dto = new RawSortDto();
      dto.sorts = rawValues;
      const errors = validateSync(dto, { whitelist: true });
      if (errors.length) {
        throw new BadRequestException('Invalid sort payload');
      }

      // Parse each item strictly
      const parsed: Sort[] = rawValues.map(parseSingle);
      return parsed;
    }),
  );
}

/**
 * Swagger documentation decorator for sort query parameter
 * Documents the expected format and provides examples
 */
export function ApiSortQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'sort',
      required: false,
      description:
        'Sort parameters in format `fieldName:sortType`. Supports `string` or `string[]`.\n' +
        '- sortType: `asc` (ascending) or `desc` (descending).\n' +
        '- Syntax: `sort=field:direction` (comma-separated for multiple) or repeated `sort=...&sort=...`.\n' +
        '- Automatically normalizes whitespace and filters empty values.',
      style: 'form',
      explode: true,
      isArray: true,
      schema: {
        type: 'array',
        items: {
          type: 'string',
          pattern: '^[a-zA-Z_][a-zA-Z0-9_]*:(asc|desc)$',
        },
        example: ['name:asc', 'created:desc', 'updated:asc'],
      },
      examples: {
        single: {
          summary: 'Single sort field',
          value: 'name:asc',
        },
        multiple: {
          summary: 'Multiple sort fields (comma-separated)',
          value: 'name:asc,created:desc',
        },
        array: {
          summary: 'Array format (repeated parameters)',
          value: ['name:asc', 'created:desc', 'updated:asc'],
        },
        ascending: {
          summary: 'Ascending sort',
          value: 'title:asc',
        },
        descending: {
          summary: 'Descending sort',
          value: 'created:desc',
        },
      },
    }),
    ApiBadRequestResponse({
      description:
        'Invalid sort payload: missing field name, invalid direction (must be "asc" or "desc"), ' +
        'wrong format (expected "fieldName:sortType"), or malformed array/string structure.',
    }),
  );
}
