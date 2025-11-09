/**
 * Frontend Query DTO
 * Combines filters and sorts for API requests
 */

import { Filter, filtersToQueryParams } from "./filter.dto";
import { Sort, sortsToQueryParams } from "./sort.dto";

export type QueryParams<TField extends string = string> = {
  filters?: Filter<TField>[];
  sorts?: Sort<TField>[];
  page?: number;
  limit?: number;
};

export type QueryHttpParams = {
  filters?: string[];
  sorts?: string[];
  page?: string;
  limit?: string;
  [key: string]: string | string[] | number | undefined;
};

/**
 * Convert query params to backend format
 * Returns object suitable for HttpParams
 */
export function queryParamsToHttpParams<TField extends string>(
  params: QueryParams<TField>
): QueryHttpParams {
  const { filters, sorts, page, limit, ...rest } = params;
  const httpParams: QueryHttpParams = { ...rest };

  if (filters && filters.length > 0) {
    httpParams.filters = filtersToQueryParams(filters);
  }

  if (sorts && sorts.length > 0) {
    httpParams.sorts = sortsToQueryParams(sorts);
  }

  if (page !== undefined) {
    httpParams.page = page.toString();
  }

  if (limit !== undefined) {
    httpParams.limit = limit.toString();
  }

  return httpParams;
}

/**
 * Query builder for fluent API
 */
export class QueryBuilder<TField extends string = string> {
  private _filters: Filter<TField>[] = [];
  private _sorts: Sort<TField>[] = [];
  private _page?: number;
  private _limit?: number;

  /**
   * Add a filter
   */
  filter(filter: Filter<TField>): this {
    this._filters.push(filter);
    return this;
  }

  /**
   * Add multiple filters
   */
  filters(filters: Filter<TField>[]): this {
    this._filters.push(...filters);
    return this;
  }

  /**
   * Add a sort
   */
  sort(sort: Sort<TField>): this {
    this._sorts.push(sort);
    return this;
  }

  /**
   * Add multiple sorts
   */
  sorts(sorts: Sort<TField>[]): this {
    this._sorts.push(...sorts);
    return this;
  }

  /**
   * Set page number
   */
  page(page: number): this {
    this._page = page;
    return this;
  }

  /**
   * Set page size
   */
  limit(limit: number): this {
    this._limit = limit;
    return this;
  }

  /**
   * Clear all filters
   */
  clearFilters(): this {
    this._filters = [];
    return this;
  }

  /**
   * Clear all sorts
   */
  clearSorts(): this {
    this._sorts = [];
    return this;
  }

  /**
   * Clear everything
   */
  clear(): this {
    this._filters = [];
    this._sorts = [];
    this._page = undefined;
    this._limit = undefined;
    return this;
  }

  /**
   * Build query params object
   */
  build(): QueryParams<TField> {
    return {
      filters: this._filters.length > 0 ? this._filters : undefined,
      sorts: this._sorts.length > 0 ? this._sorts : undefined,
      page: this._page,
      limit: this._limit,
    };
  }

  /**
   * Build HTTP params object
   */
  toHttpParams(): QueryHttpParams {
    return queryParamsToHttpParams(this.build());
  }
}

/**
 * Create a new query builder
 */
export function createQueryBuilder<
  TField extends string = string,
>(): QueryBuilder<TField> {
  return new QueryBuilder<TField>();
}
