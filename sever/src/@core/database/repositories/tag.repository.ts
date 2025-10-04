import { TenantEntity, UserEntity } from '@app/entities';
import { FilterQuery, FindOptions } from '@mikro-orm/core';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { TagEntity } from '../entities/tag.entity';

type FindTagOptions = FindOptions<TagEntity, 'author', '*', never>;
type CreateTagInput = Omit<TagEntity, 'id' | 'author'> & {
  author?: UserEntity;
};

export class TagRepository extends EntityRepository<TagEntity> {
  constructor(em: EntityManager) {
    super(em, TagEntity);
  }

  /**
   * Find tags by user ID
   */
  async findByUserId(
    userId: string,
    options?: FindTagOptions,
  ): Promise<TagEntity[]> {
    return this.find(
      {
        author: { id: userId },
        deleteFlag: false,
        ...options,
      },
      {
        orderBy: { usageCount: 'DESC', name: 'ASC' },
      },
    );
  }

  /**
   * Find tag by name and user
   */
  async findByName(
    name: string,
    userId?: string,
    options?: FindTagOptions,
  ): Promise<TagEntity | null> {
    const where: FilterQuery<TagEntity> = {
      deleteFlag: false,
      name: name.toLowerCase().trim(),
    };

    if (userId) {
      where.author = { id: userId };
    } else {
      where.author = { id: null };
    }

    return this.findOne(
      {
        name: name.toLowerCase().trim(),

        deleteFlag: false,
      },
      options,
    );
  }

  /**
   * Find or create tag by name
   */
  async findOrCreate(
    name: string,
    author: UserEntity,
    tenant: TenantEntity,
    options?: {
      description?: string;
      color?: string;
      category?: string;
    },
  ): Promise<TagEntity> {
    const normalizedName = name.toLowerCase().trim();

    let tag = await this.findByName(normalizedName, author?.id);

    if (!tag) {
      tag = new TagEntity({
        name: normalizedName,
        author: author,
        tenant: tenant,
        description: options?.description,
        color: options?.color,
        category: options?.category,
      });

      await this.em.persistAndFlush(tag);
    }

    return tag;
  }

  /**
   * Search tags by name pattern
   */
  async searchByName(
    searchTerm: string,
    userId: string,
    limit: number = 20,
    options?: FindTagOptions,
  ): Promise<TagEntity[]> {
    const searchPattern = `%${searchTerm.toLowerCase()}%`;

    return this.find(
      {
        name: { $ilike: searchPattern },
        author: { id: userId },
        deleteFlag: false,
        isActive: true,
        ...options,
      },
      {
        orderBy: { usageCount: 'DESC', name: 'ASC' },
        limit,
      },
    );
  }

  /**
   * Search tags by name pattern with tenant context
   */
  async searchByNameAndTenant(
    searchTerm: string,
    userId: string,
    tenantId: string,
    limit: number = 20,
    options?: FindTagOptions,
  ): Promise<TagEntity[]> {
    const searchPattern = `%${searchTerm.toLowerCase()}%`;

    return this.find(
      {
        name: { $ilike: searchPattern },
        author: { id: userId },
        tenant: { id: tenantId },
        deleteFlag: false,
        isActive: true,
        ...options,
      },
      {
        orderBy: { usageCount: 'DESC', name: 'ASC' },
        limit,
      },
    );
  }

  /**
   * Find popular tags
   */
  async findPopular(
    userId: string,
    limit: number = 20,
    options?: FindTagOptions,
  ): Promise<TagEntity[]> {
    return this.find(
      {
        author: { id: userId },
        deleteFlag: false,
        isActive: true,
        usageCount: { $gt: 0 },
        ...options,
      },
      {
        orderBy: { usageCount: 'DESC', name: 'ASC' },
        limit,
      },
    );
  }

  /**
   * Find tags by category
   */
  async findByCategory(
    category: string,
    userId: string,
    options?: FindTagOptions,
  ): Promise<TagEntity[]> {
    return this.find(
      {
        category,
        author: { id: userId },
        deleteFlag: false,
        isActive: true,
        ...options,
      },
      {
        orderBy: { usageCount: 'DESC', name: 'ASC' },
      },
    );
  }

  /**
   * Find unused tags
   */
  async findUnused(
    userId: string,
    options?: FindTagOptions,
  ): Promise<TagEntity[]> {
    return this.find(
      {
        author: { id: userId },
        deleteFlag: false,
        usageCount: 0,
        isSystem: false,
        ...options,
      },
      {
        orderBy: { createAt: 'DESC' },
      },
    );
  }

  /**
   * Get tag statistics for user
   */
  async getTagStats(userId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    unused: number;
    categories: { category: string; count: number }[];
    totalUsage: number;
  }> {
    const [total, active, inactive, unused] = await Promise.all([
      this.count({
        author: { id: userId },
        deleteFlag: false,
      }),
      this.count({
        author: { id: userId },
        deleteFlag: false,
        isActive: true,
      }),
      this.count({
        author: { id: userId },
        deleteFlag: false,
        isActive: false,
      }),
      this.count({
        author: { id: userId },
        deleteFlag: false,
        usageCount: 0,
      }),
    ]);

    // Get categories with counts
    const categoryResults = await this.getEntityManager()
      .getConnection()
      .execute(
        `SELECT category, COUNT(*) as count 
         FROM tag_entity 
         WHERE created_by_id = ? AND delete_flag = false AND category IS NOT NULL
         GROUP BY category 
         ORDER BY count DESC`,
        [userId],
      );

    const categories = categoryResults.map((row: any) => ({
      category: row.category,
      count: parseInt(row.count, 10),
    }));

    // Get total usage
    const usageResult = await this.getEntityManager()
      .getConnection()
      .execute(
        'SELECT SUM(usage_count) as total_usage FROM tag_entity WHERE created_by_id = ? AND delete_flag = false',
        [userId],
      );
    const totalUsage = parseInt(usageResult[0]?.total_usage || '0', 10);

    return {
      total,
      active,
      inactive,
      unused,
      categories,
      totalUsage,
    };
  }

  /**
   * Find tags with pagination and filters
   */
  async findWithPagination(
    userId: string,
    offset: number = 0,
    limit: number = 20,
    filters?: {
      search?: string;
      category?: string;
      isActive?: boolean;
      minUsage?: number;
      maxUsage?: number;
    },
  ): Promise<{ tags: TagEntity[]; total: number }> {
    const where: FilterQuery<TagEntity> = {
      author: { id: userId },
      deleteFlag: false,
    };

    if (filters?.search) {
      const searchPattern = `%${filters.search.toLowerCase()}%`;
      where.$or = [
        { name: { $ilike: searchPattern } },
        { description: { $ilike: searchPattern } },
      ];
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.minUsage !== undefined) {
      where.usageCount = { $gte: filters.minUsage };
    }

    if (filters?.maxUsage !== undefined) {
      where.usageCount = { $lte: filters.maxUsage };
    }

    const [tags, total] = await this.findAndCount(where, {
      orderBy: { usageCount: 'DESC', name: 'ASC' },
      offset,
      limit,
    });

    return { tags, total };
  }

  /**
   * Get all categories for user
   */
  async getCategories(userId: string): Promise<string[]> {
    const results = await this.getEntityManager()
      .getConnection()
      .execute(
        `SELECT DISTINCT category 
         FROM tag_entity 
         WHERE created_by_id = ? AND delete_flag = false AND category IS NOT NULL
         ORDER BY category`,
        [userId],
      );

    return results.map((row: any) => row.category);
  }

  /**
   * Bulk update usage counts
   */
  async updateUsageCounts(
    tagIds: string[],
    increment: boolean = true,
  ): Promise<void> {
    if (tagIds.length === 0) return;

    const operator = increment ? '+' : '-';
    await this.getEntityManager()
      .getConnection()
      .execute(
        `UPDATE tag_entity 
         SET usage_count = GREATEST(0, usage_count ${operator} 1) 
         WHERE id = ANY(?)`,
        [tagIds],
      );
  }

  /**
   * Find similar tags by name
   */
  async findSimilar(
    name: string,
    userId: string,
    limit: number = 5,
  ): Promise<TagEntity[]> {
    const searchTerm = name.toLowerCase().trim();

    return this.find(
      {
        author: { id: userId },
        deleteFlag: false,
        isActive: true,
        name: { $ne: searchTerm }, // Exclude exact match
      },
      {
        orderBy: [
          // PostgreSQL similarity function (requires pg_trgm extension)
          // raw(`similarity(name, ?) DESC`, [searchTerm]),
          // raw(`"usage_count" DESC`),
        ],
        limit,
      },
    );
  }
}
