import { TenantEntity, UserEntity } from '@app/entities';
import { RequestContextService } from '@app/request';
import {
  EntityData,
  EntityManager,
  FilterQuery,
  FindOptions,
  RequiredEntityData,
} from '@mikro-orm/postgresql';

export type PaginationOptions = {
  offset?: number;
  limit?: number;
};

export type EntityWithCount<T> = {
  entities: T[];
  count: number;
};

export class BaseRepository {
  protected readonly ctx: RequestContextService;
  protected readonly em: EntityManager;
  constructor(em: EntityManager, ctx: RequestContextService) {
    this.ctx = ctx;
    this.em = em;
  }
  // find<
  //   Hint extends string = never,
  //   Fields extends string = '*',
  //   Excludes extends string = never,
  // >(
  //   where: FilterQuery<T>,
  //   options?: FindOptions<T, Hint, Fields, Excludes>,
  // ): Promise<Loaded<T, Hint, Fields, Excludes>[]> {
  //   return super.find(where, {
  //     ...(options ?? {}),
  //     filters: this.addTenantIdToFilterOptions(options?.filters),
  //   });
  // }
  // findOne<
  //   Hint extends string = never,
  //   Fields extends string = '*',
  //   Excludes extends string = never,
  // >(
  //   where: FilterQuery<T>,
  //   options?: FindOneOptions<T, Hint, Fields, Excludes>,
  // ): Promise<Loaded<T, Hint, Fields, Excludes> | null> {
  //   return super.findOne(where, {
  //     ...(options ?? {}),
  //     filters: this.addTenantIdToFilterOptions(options?.filters),
  //   });
  // }
  // create<Convert extends boolean = false>(
  //   data: RequiredEntityData<T, never, Convert>,
  //   options?: CreateOptions<Convert>,
  // ): T;
  // create<Convert extends boolean = false>(
  //   data: EntityData<T, Convert>,
  //   options: CreateOptions<Convert> & {
  //     partial: true;
  //   },
  // ): T;
  // create<Convert extends boolean = false>(
  //   data: EntityData<T, Convert> | RequiredEntityData<T, never, Convert>,
  //   options?:
  //     | CreateOptions<Convert>
  //     | (CreateOptions<Convert> & {
  //         partial: true;
  //       }),
  // ): T {
  //   return super.create(
  //     this.addTenantIdToEntityData(data) as RequiredEntityData<
  //       T,
  //       never,
  //       Convert
  //     >,
  //     options,
  //   );
  // }
  // remove(entity: T) {
  //   entity.deleteFlag = false;
  // }
  // protected addTenantIdToFilterOptions(
  //   filters: FilterOptions | undefined,
  // ): FilterOptions | undefined {
  //   const tenantId = this.getTenantId();
  //   if (!tenantId) {
  //     return filters;
  //   }
  //   if (!filters) {
  //     return { tenant: { tenantId } };
  //   } else if (Array.isArray(filters)) {
  //     return [...filters, { tenant: { tenantId } }] as FilterOptions;
  //   } else if (typeof filters === 'object') {
  //     return {
  //       ...filters,
  //       tenant: { tenantId },
  //     } as FilterOptions;
  //   }
  // }
  // protected addTenantIdToEntityData<Convert extends boolean = false>(
  //   data: EntityData<T, never> | RequiredEntityData<T, never, Convert>,
  // ): EntityData<T, never> | RequiredEntityData<T, never, Convert> {
  //   const tenant = this.em
  //     .getRepository(TenantEntity)
  //     .getReference(this.getTenantId());
  //   return {
  //     ...data,
  //     tenant,
  //   };
  // }
  // private getTenantId(): string {
  //   return '';
  // }

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

  protected addUserIdAndTenantIdToQuery(): undefined;
  protected addUserIdAndTenantIdToQuery<
    T extends { user: UserEntity; tenant: TenantEntity },
  >(query: FilterQuery<T>): FilterQuery<T>;
  protected addUserIdAndTenantIdToQuery<
    T extends { user: UserEntity; tenant: TenantEntity },
  >(query?: FilterQuery<T>): FilterQuery<T> | undefined {
    const userId = this.ctx.user?.id;

    const tenantId = this.ctx.tenant?.id;

    if (!userId) {
      return query;
    }

    if (!tenantId) {
      return query;
    }

    if (Array.isArray(query)) {
      return query.map((item) => this.addUserIdAndTenantIdToQuery(item));
    }

    if (typeof query === 'object') {
      if (query) {
        return {
          ...(query || {}),
          user: userId,
          tenant: tenantId,
        };
      } else {
        return {
          user: userId,
          tenant: tenantId,
        } as FilterQuery<T>;
      }
    }

    if (!query) {
      return {};
    }

    return query;
  }

  protected addTenantToEntity<T extends { tenant: TenantEntity }>(
    data: EntityData<T, never>,
  ): EntityData<T, never>;
  protected addTenantToEntity<
    T extends { tenant: TenantEntity },
    Convert extends boolean = false,
  >(
    data: RequiredEntityData<T, never, Convert>,
  ): RequiredEntityData<T, never, Convert>;
  protected addTenantToEntity<
    T extends { tenant: TenantEntity },
    Convert extends boolean = false,
  >(
    data: EntityData<T, never> | RequiredEntityData<T, never, Convert>,
  ): EntityData<T, never> | RequiredEntityData<T, never, Convert> {
    const tenant = this.ctx.tenant;

    data['tenant'] = tenant;

    return data;
  }

  protected addUserToEntity<T extends { user: UserEntity }>(
    data: EntityData<T, never>,
  ): EntityData<T, never>;
  protected addUserToEntity<
    T extends { user: UserEntity },
    Convert extends boolean = false,
  >(
    data: RequiredEntityData<T, never, Convert>,
  ): RequiredEntityData<T, never, Convert>;
  protected addUserToEntity<
    T extends { user: UserEntity },
    Convert extends boolean = false,
  >(
    data: EntityData<T, never> | RequiredEntityData<T, never, Convert>,
  ): EntityData<T, never> | RequiredEntityData<T, never, Convert> {
    const user = this.ctx.user;

    data['user'] = user;

    return data;
  }

  protected addUserAndTenantToEntity<
    T extends { user: UserEntity; tenant: TenantEntity },
  >(data: EntityData<T, never>): EntityData<T, never>;
  protected addUserAndTenantToEntity<
    T extends { user: UserEntity; tenant: TenantEntity },
    Convert extends boolean = false,
  >(
    data: RequiredEntityData<T, never, Convert>,
  ): RequiredEntityData<T, never, Convert>;
  protected addUserAndTenantToEntity<
    T extends { user: UserEntity; tenant: TenantEntity },
    Convert extends boolean = false,
  >(
    data: EntityData<T, never> | RequiredEntityData<T, never, Convert>,
  ): EntityData<T, never> | RequiredEntityData<T, never, Convert> {
    const user = this.ctx.user;

    const tenant = this.ctx.tenant;

    data['user'] = user;

    data['tenant'] = tenant;

    return data;
  }

  setConditionFilter<T>(query: FilterQuery<T>, filter?: FilterQuery<T>) {
    if (filter) {
      query = {
        ...query,
        ...filter,
      };
    }

    return query;
  }

  setConditionPagination<T>(
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
