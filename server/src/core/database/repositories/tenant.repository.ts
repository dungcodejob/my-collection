import { FilterQuery, FindOptions } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { TenantEntity, TenantStatus } from '../entities/tenant.entity';

type FindTenantOptions = FindOptions<TenantEntity, '*', '*', never>;

export class TenantRepository extends EntityRepository<TenantEntity> {
  /**
   * Find tenant by slug
   */
  async findBySlug(
    slug: string,
    options?: FindTenantOptions,
  ): Promise<TenantEntity | null> {
    return this.findOne(
      {
        slug,
        deleteFlag: false,
      },
      {
        ...options,
      },
    );
  }

  /**
   * Find active tenants
   */
  async findActiveTenants(
    options?: FindTenantOptions,
  ): Promise<TenantEntity[]> {
    return this.find(
      {
        status: TenantStatus.ACTIVE,
        isActive: true,
        deleteFlag: false,
      },
      {
        orderBy: { createAt: 'DESC' },
        ...options,
      },
    );
  }

  /**
   * Find tenants by status
   */
  async findByStatus(
    status: TenantStatus,
    options?: FindTenantOptions,
  ): Promise<TenantEntity[]> {
    return this.find(
      {
        status,
        deleteFlag: false,
      },
      {
        orderBy: { createAt: 'DESC' },
        ...options,
      },
    );
  }

  /**
   * Search tenants by name or slug
   */
  async searchTenants(
    query: string,
    options?: FindTenantOptions,
  ): Promise<TenantEntity[]> {
    const filter: FilterQuery<TenantEntity> = {
      $or: [
        { name: { $ilike: `%${query}%` } },
        { slug: { $ilike: `%${query}%` } },
      ],
      deleteFlag: false,
    };

    return this.find(filter, {
      orderBy: { createAt: 'DESC' },
      ...options,
    });
  }

  /**
   * Find tenants with expired subscriptions
   */
  async findExpiredSubscriptions(): Promise<TenantEntity[]> {
    return this.find({
      subscriptionExpiresAt: { $lt: new Date() },
      status: TenantStatus.ACTIVE,
      deleteFlag: false,
    });
  }

  /**
   * Count tenants by status
   */
  async countByStatus(status: TenantStatus): Promise<number> {
    return this.count({
      status,
      deleteFlag: false,
    });
  }

  /**
   * Get tenant statistics
   */
  async getTenantStats(): Promise<{
    total: number;
    active: number;
    suspended: number;
    inactive: number;
  }> {
    const [total, active, suspended, inactive] = await Promise.all([
      this.count({ deleteFlag: false }),
      this.countByStatus(TenantStatus.ACTIVE),
      this.countByStatus(TenantStatus.SUSPENDED),
      this.countByStatus(TenantStatus.INACTIVE),
    ]);

    return {
      total,
      active,
      suspended,
      inactive,
    };
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<TenantEntity> = {
      slug,
      deleteFlag: false,
    };

    if (excludeId) {
      filter.id = { $ne: excludeId };
    }

    const count = await this.count(filter);
    return count === 0;
  }

  /**
   * Update tenant usage statistics
   */
  async updateUsage(
    tenantId: string,
    usage: {
      bookmarkCount?: number;
      collectionCount?: number;
      tagCount?: number;
      storageUsed?: number;
    },
  ): Promise<void> {
    await this.nativeUpdate({ id: tenantId }, { usage });
  }

  /**
   * Suspend tenant
   */
  async suspendTenant(tenantId: string): Promise<void> {
    await this.nativeUpdate(
      { id: tenantId },
      { status: TenantStatus.SUSPENDED },
    );
  }

  /**
   * Activate tenant
   */
  async activateTenant(tenantId: string): Promise<void> {
    await this.nativeUpdate({ id: tenantId }, { status: TenantStatus.ACTIVE });
  }

  /**
   * Find tenants with pagination
   */
  async findWithPagination(
    offset: number = 0,
    limit: number = 20,
    filters?: {
      status?: TenantStatus;
      search?: string;
    },
  ): Promise<{
    tenants: TenantEntity[];
    total: number;
    hasMore: boolean;
  }> {
    const filter: FilterQuery<TenantEntity> = {
      deleteFlag: false,
    };

    if (filters?.status) {
      filter.status = filters.status;
    }

    if (filters?.search) {
      filter.$or = [
        { name: { $ilike: `%${filters.search}%` } },
        { slug: { $ilike: `%${filters.search}%` } },
      ];
    }

    const [tenants, total] = await this.findAndCount(filter, {
      offset,
      limit,
      orderBy: { createAt: 'DESC' },
    });

    return {
      tenants,
      total,
      hasMore: offset + limit < total,
    };
  }
}
