import { applyDecorators, BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, validateSync } from 'class-validator';

import { ApiQuery } from '@nestjs/swagger';

export type RawFilter<TField extends string = string> =
  `${TField}:${FilterType}:${string}`;

export type KeywordFilter<TField extends string = string> = {
  field: TField;
  type: 'keyword';
  value: string;
};

export type BooleanFilter<TField extends string = string> = {
  field: TField;
  type: 'boolean';
  value: boolean;
};

export type RangeFilter<TField extends string = string> = {
  field: TField;
  type: 'range';
  value: {
    min?: number;
    max?: number;
  };
};

export type DateRangeFilter<TField extends string = string> = {
  field: TField;
  type: 'daterange';
  value: {
    min?: Date;
    max?: Date;
  };
};

export type NumberFilter<TField extends string = string> = {
  field: TField;
  type: 'number';
  value: number;
};

export type Filter<TField extends string = string> =
  | KeywordFilter<TField>
  | NumberFilter<TField>
  | RangeFilter<TField>
  | DateRangeFilter<TField>
  | BooleanFilter<TField>;

export type ParsedFilter<TField extends string = string> = Filter<TField>;

export enum FilterType {
  Number = 'number',
  Range = 'range',
  DateRange = 'daterange',
  Keyword = 'keyword',
  Boolean = 'boolean',
}

class RawFiltersDto {
  @IsArray()
  @IsString({ each: true })
  filters: RawFilter[] = [];
}

// Helper to parse numeric range filters
function parseRangeFilter(field: string, data: string): RangeFilter<string> {
  // Accept formats: min-max, min:, :max
  const m = data.match(
    /^\s*([+-]?\d+(?:\.\d+)?)?\s*-\s*([+-]?\d+(?:\.\d+)?)?\s*$/,
  );
  if (!m) {
    throw new BadRequestException(
      `Range must be 'min-max' (numbers) for '${field}'`,
    );
  }

  const min = m[1] !== undefined ? Number(m[1]) : undefined;
  const max = m[2] !== undefined ? Number(m[2]) : undefined;

  if (min === undefined && max === undefined) {
    throw new BadRequestException(
      `Range must provide at least one bound for '${field}'`,
    );
  }
  if (min !== undefined && Number.isNaN(min)) {
    throw new BadRequestException(`Range min invalid for '${field}'`);
  }
  if (max !== undefined && Number.isNaN(max)) {
    throw new BadRequestException(`Range max invalid for '${field}'`);
  }
  if (min !== undefined && max !== undefined && min > max) {
    throw new BadRequestException(`Range min must be <= max for '${field}'`);
  }

  return { field, type: 'range', value: { min, max } };
}

// Helper to parse date range filters
function parseDateRangeFilter(
  field: string,
  data: string,
): DateRangeFilter<string> {
  // Accept formats: 'YYYY-MM-DD_YYYY-MM-DD' or 'YYYY-MM-DD-YYYY-MM-DD'
  const trimmed = data.trim();
  let fromRaw: string | undefined;
  let toRaw: string | undefined;

  if (trimmed.includes('_')) {
    const parts = trimmed.split('_');
    fromRaw = parts[0] || undefined;
    toRaw = parts[1] || undefined;
  } else {
    const m = trimmed.match(
      /^\s*(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})\s*$/,
    );
    if (m) {
      fromRaw = m[1];
      toRaw = m[2];
    } else {
      throw new BadRequestException(
        `Date range must be 'YYYY-MM-DD_YYYY-MM-DD' or 'YYYY-MM-DD-YYYY-MM-DD' for '${field}'`,
      );
    }
  }

  const from = fromRaw ? new Date(fromRaw) : undefined;
  const to = toRaw ? new Date(toRaw) : undefined;

  if (!fromRaw && !toRaw) {
    throw new BadRequestException(
      `Date range must provide at least one date for '${field}'`,
    );
  }
  if (fromRaw && Number.isNaN(from!.getTime())) {
    throw new BadRequestException(`Date range 'from' invalid for '${field}'`);
  }
  if (toRaw && Number.isNaN(to!.getTime())) {
    throw new BadRequestException(`Date range 'to' invalid for '${field}'`);
  }
  if (from && to && from > to) {
    throw new BadRequestException(
      `Date range 'from' must be <= 'to' for '${field}'`,
    );
  }

  return { field, type: 'daterange', value: { min: from, max: to } };
}

function parseSingle(raw: string): ParsedFilter<string> {
  const parts = raw.split(':');
  if (parts.length < 3) {
    throw new BadRequestException(
      `Invalid filter format '${raw}'. Expected field:type:data`,
    );
  }

  const [field, type, ...dataParts] = parts;
  const data = dataParts.join(':');

  const allowed: FilterType[] = [
    FilterType.Number,
    FilterType.Range,
    FilterType.DateRange,
    FilterType.Keyword,
    FilterType.Boolean,
  ];
  if (!allowed.includes(type as FilterType)) {
    throw new BadRequestException(`Unsupported filter type '${type}'`);
  }

  switch (type as FilterType) {
    case FilterType.Keyword: {
      if (!data.length) {
        throw new BadRequestException(`Keyword value required for '${field}'`);
      }
      return { field, type: FilterType.Keyword, value: data };
    }
    case FilterType.Boolean: {
      const lowered = data.toLowerCase();
      if (!['true', 'false', '1', '0'].includes(lowered)) {
        throw new BadRequestException(
          `Boolean must be true|false|1|0 for '${field}'`,
        );
      }
      const value = ['true', '1'].includes(lowered);
      return { field, type: FilterType.Boolean, value };
    }
    case FilterType.Number: {
      if (data.trim() === '' || Number.isNaN(Number(data))) {
        throw new BadRequestException(`Number value invalid for '${field}'`);
      }
      return { field, type: FilterType.Number, value: Number(data) };
    }
    case FilterType.Range: {
      return parseRangeFilter(field, data);
    }
    case FilterType.DateRange: {
      return parseDateRangeFilter(field, data);
    }
  }
}

export function ParseFilters() {
  return applyDecorators(
    IsOptional(),
    Transform(({ value }) => {
      // Normalize input to array of strings
      let rawValues: RawFilter[] = [];
      if (value == null) {
        rawValues = [];
      } else if (typeof value === 'string') {
        rawValues = value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean) as RawFilter[];
      } else if (Array.isArray(value)) {
        rawValues = (value as string[])
          .flatMap((v) => String(v).split(','))
          .map((v) => v.trim())
          .filter(Boolean) as RawFilter[];
      } else {
        throw new BadRequestException('filters must be string or string[]');
      }

      // Validate raw container shape first
      const dto = new RawFiltersDto();
      dto.filters = rawValues;
      const errors = validateSync(dto, { whitelist: true });
      if (errors.length) {
        throw new BadRequestException('Invalid filters payload');
      }

      // Parse each item strictly
      const parsed: ParsedFilter<string>[] = rawValues.map(parseSingle);
      return parsed;
    }),
  );
}

export function ApiFiltersQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'filters',
      required: false,
      description:
        'List of filters in the format `field:type:value`. Supports both a single string and list format.\n' +
        '- Supported types: `keyword`, `number`, `range`, `daterange`, `boolean`.\n' +
        '- Syntax: `filters=field:type:value` (comma-separated in a single string) or repeat as `filters=...&filters=...`.\n' +
        '- `range`: `min-max` (open-ended allowed, e.g. `10-` or `-20`).\n' +
        '- `daterange`: `YYYY-MM-DD_YYYY-MM-DD` or `YYYY-MM-DD-YYYY-MM-DD`.\n' +
        '- Whitespace is trimmed; empty items are ignored.',
      // Prefer list format: filters=a&filters=b
      // Use style=form and explode=true to document repeated query parameters
      style: 'form',
      explode: true,
      isArray: true,
      schema: {
        type: 'array',
        items: { type: 'string' },
        example: [
          'q:keyword:nestjs',
          'rating:number:5',
          'status:boolean:false',
        ],
      },
      examples: {
        keyword: { summary: 'Keyword search', value: ['q:keyword:react'] },
        number: { summary: 'Exact number', value: ['rating:number:5'] },
        range: { summary: 'Numeric range', value: ['price:range:10-20'] },
        rangeOpen: { summary: 'Open-ended range', value: ['price:range:10-'] },
        daterange: {
          summary: 'Date range with `_`',
          value: ['created:daterange:2024-01-01_2024-01-31'],
        },
        daterangeHyphen: {
          summary: 'Date range with `-`',
          value: ['created:daterange:2024-01-01-2024-01-31'],
        },
        boolean: { summary: 'Boolean', value: ['published:boolean:true'] },
        listFormat: {
          summary: 'List format (repeat filters)',
          value: ['q:keyword:react', 'status:boolean:true'],
        },
      },
    }),
  );
}
