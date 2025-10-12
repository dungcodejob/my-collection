import { TenantEntity, UserEntity } from '@app/entities';
import { RequestContextService } from '@app/request';
import {
  EntityData,
  FilterQuery,
  FindOptions,
  RequiredEntityData,
} from '@mikro-orm/postgresql';

export type PaginationOptions = {
  offset?: number;
  limit?: number;
};

export abstract class TenantAwareService {
  protected readonly ctx: RequestContextService;

  constructor(ctx: RequestContextService) {
    this.ctx = ctx;
  }

  protected addTenantIdToQuery(): undefined;
  protected addTenantIdToQuery<T extends { tenant: TenantEntity }>(
    query: FilterQuery<T>,
  ): FilterQuery<T>;
  protected addTenantIdToQuery<T extends { tenant: TenantEntity }>(
    query?: FilterQuery<T>,
  ): FilterQuery<T> | undefined {
    const tenantId = this.ctx.tenant?.id;

    if (!tenantId) {
      return query;
    }

    if (Array.isArray(query)) {
      return query.map((item) => this.addTenantIdToQuery(item));
    }

    if (typeof query === 'object') {
      if (query) {
        return {
          ...(query || {}),
          tenant: tenantId,
        };
      } else {
        return {
          tenant: tenantId,
        } as FilterQuery<T>;
      }
    }

    if (!query) {
      return {};
    }

    return query;
  }

  protected addUserIdToQuery(): undefined;
  protected addUserIdToQuery<T extends { user: UserEntity }>(
    query: FilterQuery<T>,
  ): FilterQuery<T>;
  protected addUserIdToQuery<T extends { user: UserEntity }>(
    query?: FilterQuery<T>,
  ): FilterQuery<T> | undefined {
    const userId = this.ctx.user?.id;

    if (!userId) {
      return query;
    }

    if (Array.isArray(query)) {
      return query.map((item) => this.addUserIdToQuery(item));
    }

    if (typeof query === 'object') {
      if (query) {
        return {
          ...(query || {}),
          user: userId,
        };
      } else {
        return {
          user: userId,
        } as FilterQuery<T>;
      }
    }

    if (!query) {
      return {};
    }

    return query;
  }

  protected addTenantIdToEntity<
    T extends { tenant: TenantEntity },
    Convert extends boolean = false,
  >(
    data: EntityData<T, never> | RequiredEntityData<T, never, Convert>,
  ): EntityData<T, never> | RequiredEntityData<T, never, Convert> {
    const tenant = this.ctx.tenant;

    data['tenant'] = tenant;

    return data;
  }

  protected setConditionFilter<T>(
    query: FilterQuery<T>,
    filter?: FilterQuery<T>,
  ) {
    if (filter) {
      query = {
        ...query,
        ...filter,
      };
    }

    return query;
  }

  protected setConditionPagination<T>(
    options: FindOptions<T>,
    pagination?: PaginationOptions,
  ) {
    if (pagination) {
      options = {
        ...options,
        limit: pagination.limit,
        offset: pagination.offset,
      };
    }

    return options;
  }
}
