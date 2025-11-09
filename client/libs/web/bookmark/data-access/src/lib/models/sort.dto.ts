/**
 * Frontend Sort Models
 * Maps to backend sort format: field:direction
 */

export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export type Sort<TField extends string = string> = {
  field: TField;
  direction: SortDirection;
};

/**
 * Convert sort object to backend query string format
 * Example: { field: "title", direction: "asc" } => "title:asc"
 */
export function sortToQueryString(sort: Sort): string {
  return `${sort.field}:${sort.direction}`;
}

/**
 * Convert array of sorts to backend query parameter format
 */
export function sortsToQueryParams(sorts: Sort[]): string[] {
  return sorts.map(sortToQueryString);
}

/**
 * Parse backend sort string to sort object
 * Example: "title:asc" => { field: "title", direction: "asc" }
 */
export function parseSortString(sortStr: string): Sort | null {
  const parts = sortStr.split(":");
  if (parts.length !== 2) return null;

  const [field, direction] = parts;

  if (direction !== SortDirection.ASC && direction !== SortDirection.DESC) {
    return null;
  }

  return {
    field,
    direction: direction as SortDirection,
  };
}

/**
 * Parse array of sort strings from query params
 */
export function parseSortParams(sortParams: string | string[]): Sort[] {
  const sortStrings = Array.isArray(sortParams) ? sortParams : [sortParams];
  return sortStrings.map(parseSortString).filter((sort): sort is Sort => sort !== null);
}

/**
 * Sort builder helpers
 */
export const SortBuilder = {
  asc: <TField extends string>(field: TField): Sort<TField> => ({
    field,
    direction: SortDirection.ASC,
  }),

  desc: <TField extends string>(field: TField): Sort<TField> => ({
    field,
    direction: SortDirection.DESC,
  }),

  /**
   * Create sort from field and direction
   */
  create: <TField extends string>(
    field: TField,
    direction: SortDirection = SortDirection.ASC
  ): Sort<TField> => ({
    field,
    direction,
  }),

  /**
   * Toggle sort direction
   */
  toggle: <TField extends string>(sort: Sort<TField>): Sort<TField> => ({
    ...sort,
    direction:
      sort.direction === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC,
  }),
};
