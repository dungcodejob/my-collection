import {
  ApiFiltersQuery,
  ApiSortQuery,
  Filter,
  FilterType,
  ParseFilters,
  ParseSort,
  Sort,
} from '@app/decorators';
import {
  FilterQuery,
  FindOneOptions,
  FindOptions,
} from '@mikro-orm/postgresql';
import { applyDecorators } from '@nestjs/common';
import { ApiQuery, ApiQueryOptions } from '@nestjs/swagger';

export function ApiCustomQuery(options?: ApiQueryOptions) {
  const decorators = [ApiSortQuery(), ApiFiltersQuery()];

  if (options) {
    decorators.push(ApiQuery(options));
  }

  return applyDecorators(...decorators);
}

export class QueryDto<
  TFilterField extends string = string,
  TSortField extends string = TFilterField,
> {
  @ParseFilters()
  filters?: Filter<TFilterField>[];

  @ParseSort()
  sorts?: Sort<TSortField>[];

  static setConditionSort<
    T extends object,
    P extends string = any,
    F extends string = '*',
  >(options: FindOneOptions<T, P, F>, sorts?: Sort[]): FindOneOptions<T>;
  static setConditionSort<
    T extends object,
    P extends string = any,
    F extends string = '*',
  >(options: FindOptions<T, P, F>, sorts?: Sort[]): FindOptions<T, P, F>;
  static setConditionSort<
    T extends object,
    P extends string = any,
    F extends string = '*',
  >(
    options: FindOptions<T, P, F> | FindOneOptions<T, P, F>,
    sorts?: Sort[],
  ): any {
    if (!sorts || sorts.length === 0) {
      return options;
    }
    const newOptions = { ...options };

    for (const sort of sorts) {
      newOptions.orderBy = {
        ...newOptions.orderBy,
        [sort.field]: sort.direction,
      };
    }

    return newOptions;
  }

  static setConditionFilter<T extends object>(
    query: FilterQuery<T>,
    filters?: Filter[],
  ): FilterQuery<T> {
    if (!filters || filters.length === 0) {
      return query;
    }

    let newQuery = { ...query };

    for (const filter of filters) {
      switch (filter.type) {
        case FilterType.Keyword:
          newQuery = {
            ...newQuery,
            [filter.field]: { $ilike: `%${filter.value}%` },
          };
          break;

        case FilterType.Boolean:
          newQuery = {
            ...newQuery,
            [filter.field]: filter.value,
          };
          break;

        case FilterType.DateRange: {
          const { min, max } = filter.value;

          newQuery = {
            ...newQuery,
            [filter.field]: {
              $gte: min,
              $lte: max,
            },
          };
          break;
        }

        case FilterType.Range: {
          const { min, max } = filter.value;
          newQuery = {
            ...newQuery,
            [filter.field]: {
              $gte: min,
              $lte: max,
            },
          };
          break;
        }

        case FilterType.Number: {
          newQuery = {
            ...newQuery,
            [filter.field]: { $in: filter.value },
          };
          break;
        }
      }
    }

    return newQuery;
  }
}
