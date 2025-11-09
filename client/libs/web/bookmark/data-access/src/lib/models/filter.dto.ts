/**
 * Frontend Filter Models
 * Maps to backend filter format: field:type:value
 */

export enum FilterType {
  Keyword = "keyword",
  Boolean = "boolean",
  Number = "number",
  Range = "range",
  DateRange = "daterange",
}

export type KeywordFilter<TField extends string = string> = {
  field: TField;
  type: FilterType.Keyword;
  value: string;
};

export type BooleanFilter<TField extends string = string> = {
  field: TField;
  type: FilterType.Boolean;
  value: boolean;
};

export type NumberFilter<TField extends string = string> = {
  field: TField;
  type: FilterType.Number;
  value: number;
};

export type RangeFilter<TField extends string = string> = {
  field: TField;
  type: FilterType.Range;
  value: {
    min?: number;
    max?: number;
  };
};

export type DateRangeFilter<TField extends string = string> = {
  field: TField;
  type: FilterType.DateRange;
  value: {
    min?: Date;
    max?: Date;
  };
};

export type Filter<TField extends string = string> =
  | KeywordFilter<TField>
  | BooleanFilter<TField>
  | NumberFilter<TField>
  | RangeFilter<TField>
  | DateRangeFilter<TField>;

/**
 * Convert filter object to backend query string format
 * Example: { field: "title", type: "keyword", value: "react" } => "title:keyword:react"
 */
export function filterToQueryString(filter: Filter): string {
  switch (filter.type) {
    case FilterType.Keyword:
      return `${filter.field}:keyword:${filter.value}`;

    case FilterType.Boolean:
      return `${filter.field}:boolean:${filter.value}`;

    case FilterType.Number:
      return `${filter.field}:number:${filter.value}`;

    case FilterType.Range: {
      const { min, max } = filter.value;
      const rangeValue = `${min ?? ""}-${max ?? ""}`;
      return `${filter.field}:range:${rangeValue}`;
    }

    case FilterType.DateRange: {
      const { min, max } = filter.value;
      const fromStr = min ? formatDate(min) : "";
      const toStr = max ? formatDate(max) : "";
      return `${filter.field}:daterange:${fromStr}_${toStr}`;
    }
  }
}

/**
 * Convert array of filters to backend query parameter format
 */
export function filtersToQueryParams(filters: Filter[]): string[] {
  return filters.map(filterToQueryString);
}

/**
 * Parse backend filter string to filter object
 * Example: "title:keyword:react" => { field: "title", type: "keyword", value: "react" }
 */
export function parseFilterString(filterStr: string): Filter | null {
  const parts = filterStr.split(":");
  if (parts.length < 3) return null;

  const [field, type, ...valueParts] = parts;
  const value = valueParts.join(":");

  switch (type as FilterType) {
    case FilterType.Keyword:
      return { field, type: FilterType.Keyword, value };

    case FilterType.Boolean:
      return {
        field,
        type: FilterType.Boolean,
        value: value === "true" || value === "1",
      };

    case FilterType.Number:
      return { field, type: FilterType.Number, value: Number(value) };

    case FilterType.Range: {
      const [minStr, maxStr] = value.split("-");
      return {
        field,
        type: FilterType.Range,
        value: {
          min: minStr ? Number(minStr) : undefined,
          max: maxStr ? Number(maxStr) : undefined,
        },
      };
    }

    case FilterType.DateRange: {
      const [fromStr, toStr] = value.split("_");
      return {
        field,
        type: FilterType.DateRange,
        value: {
          min: fromStr ? new Date(fromStr) : undefined,
          max: toStr ? new Date(toStr) : undefined,
        },
      };
    }

    default:
      return null;
  }
}

/**
 * Helper to format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Filter builder helpers for common use cases
 */
export const FilterBuilder = {
  keyword: <TField extends string>(
    field: TField,
    value: string
  ): KeywordFilter<TField> => ({
    field,
    type: FilterType.Keyword,
    value,
  }),

  boolean: <TField extends string>(
    field: TField,
    value: boolean
  ): BooleanFilter<TField> => ({
    field,
    type: FilterType.Boolean,
    value,
  }),

  number: <TField extends string>(
    field: TField,
    value: number
  ): NumberFilter<TField> => ({
    field,
    type: FilterType.Number,
    value,
  }),

  range: <TField extends string>(
    field: TField,
    min?: number,
    max?: number
  ): RangeFilter<TField> => ({
    field,
    type: FilterType.Range,
    value: { min, max },
  }),

  dateRange: <TField extends string>(
    field: TField,
    min?: Date,
    max?: Date
  ): DateRangeFilter<TField> => ({
    field,
    type: FilterType.DateRange,
    value: { min, max },
  }),
};
