import { FilterQuery, FindOptions } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { CrawlEntity, CrawlStatus, CrawlType } from '../entities/crawl.entity';

type FindCrawlOptions = FindOptions<CrawlEntity, 'user', '*', never>;

export class CrawlRepository extends EntityRepository<CrawlEntity> {
  /**
   * Find crawls by user ID
   */
  async findByUserId(
    userId: string,
    options?: FindCrawlOptions,
  ): Promise<CrawlEntity[]> {
    return this.find(
      {
        user: { id: userId },
        deleteFlag: false,
      },
      {
        orderBy: { createAt: 'DESC' },
        ...options,
      },
    );
  }

  /**
   * Find crawl by URL and user
   */
  async findByUrl(
    url: string,
    userId: string,
    options?: FindCrawlOptions,
  ): Promise<CrawlEntity | null> {
    return this.findOne(
      {
        url,
        user: { id: userId },
        deleteFlag: false,
      },
      options,
    );
  }

  /**
   * Find crawls by status
   */
  async findByStatus(
    status: CrawlStatus,
    userId?: string,
    options?: FindCrawlOptions,
  ): Promise<CrawlEntity[]> {
    const where: FilterQuery<CrawlEntity> = {
      status,
      deleteFlag: false,
    };

    if (userId) {
      where.user = { id: userId };
    }

    return this.find(where, {
      orderBy: { createAt: 'DESC' },
      ...options,
    });
  }

  /**
   * Find pending crawls for processing
   */
  async findPendingCrawls(
    limit: number = 10,
    options?: FindCrawlOptions,
  ): Promise<CrawlEntity[]> {
    return this.find(
      {
        status: CrawlStatus.PENDING,
        deleteFlag: false,
        isActive: true,
      },
      {
        orderBy: { createAt: 'ASC' },
        limit,
        ...options,
      },
    );
  }

  /**
   * Find crawls by type
   */
  async findByCrawlType(
    crawlType: CrawlType,
    userId: string,
    options?: FindCrawlOptions,
  ): Promise<CrawlEntity[]> {
    return this.find(
      {
        crawlType,
        user: { id: userId },
        deleteFlag: false,
      },
      {
        orderBy: { createAt: 'DESC' },
        ...options,
      },
    );
  }

  /**
   * Find successful crawls by user
   */
  async findSuccessfulCrawls(
    userId: string,
    options?: FindCrawlOptions,
  ): Promise<CrawlEntity[]> {
    return this.find(
      {
        status: CrawlStatus.COMPLETED,
        user: { id: userId },
        deleteFlag: false,
      },
      {
        orderBy: { lastCrawledAt: 'DESC' },
        ...options,
      },
    );
  }

  /**
   * Find failed crawls that can be retried
   */
  async findRetryableCrawls(
    maxRetries: number = 3,
    options?: FindCrawlOptions,
  ): Promise<CrawlEntity[]> {
    return this.find(
      {
        $or: [{ status: CrawlStatus.FAILED }, { status: CrawlStatus.TIMEOUT }],
        retryCount: { $lt: maxRetries },
        deleteFlag: false,
        isActive: true,
      },
      {
        orderBy: { lastCrawledAt: 'ASC' },
        ...options,
      },
    );
  }

  /**
   * Find expired crawls
   */
  async findExpiredCrawls(options?: FindCrawlOptions): Promise<CrawlEntity[]> {
    return this.find(
      {
        expiresAt: { $lt: new Date() },
        deleteFlag: false,
      },
      {
        orderBy: { expiresAt: 'ASC' },
        ...options,
      },
    );
  }

  /**
   * Find crawls with pagination
   */
  async findWithPagination(
    userId: string,
    offset: number = 0,
    limit: number = 20,
    filters?: {
      status?: CrawlStatus;
      crawlType?: CrawlType;
      search?: string;
    },
  ): Promise<{ crawls: CrawlEntity[]; total: number }> {
    const where: FilterQuery<CrawlEntity> = {
      user: { id: userId },
      deleteFlag: false,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.crawlType) {
      where.crawlType = filters.crawlType;
    }

    if (filters?.search) {
      where.$or = [
        { url: { $ilike: `%${filters.search}%` } },
        { title: { $ilike: `%${filters.search}%` } },
        { description: { $ilike: `%${filters.search}%` } },
        { siteName: { $ilike: `%${filters.search}%` } },
      ];
    }

    const [crawls, total] = await this.findAndCount(where, {
      offset,
      limit,
      orderBy: { createAt: 'DESC' },
    });

    return { crawls, total };
  }

  /**
   * Count crawls by status for user
   */
  async countByStatus(userId: string, status?: CrawlStatus): Promise<number> {
    const where: FilterQuery<CrawlEntity> = {
      user: { id: userId },
      deleteFlag: false,
    };

    if (status) {
      where.status = status;
    }

    return this.count(where);
  }

  /**
   * Get crawl statistics for user
   */
  async getCrawlStats(userId: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    timeout: number;
  }> {
    const [total, pending, processing, completed, failed, timeout] =
      await Promise.all([
        this.countByStatus(userId),
        this.countByStatus(userId, CrawlStatus.PENDING),
        this.countByStatus(userId, CrawlStatus.PROCESSING),
        this.countByStatus(userId, CrawlStatus.COMPLETED),
        this.countByStatus(userId, CrawlStatus.FAILED),
        this.countByStatus(userId, CrawlStatus.TIMEOUT),
      ]);

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      timeout,
    };
  }

  /**
   * Find recent crawls by user
   */
  async findRecentCrawls(
    userId: string,
    limit: number = 10,
    options?: FindCrawlOptions,
  ): Promise<CrawlEntity[]> {
    return this.find(
      {
        user: { id: userId },
        deleteFlag: false,
      },
      {
        orderBy: { createAt: 'DESC' },
        limit,
        ...options,
      },
    );
  }

  /**
   * Clean up old crawls
   */
  async cleanupOldCrawls(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.nativeUpdate(
      {
        createAt: { $lt: cutoffDate },
        status: { $in: [CrawlStatus.COMPLETED, CrawlStatus.FAILED] },
      },
      {
        deleteFlag: true,
        deletedAt: new Date(),
      },
    );

    return result;
  }

  /**
   * Update crawl status in batch
   */
  async updateStatusBatch(
    crawlIds: string[],
    status: CrawlStatus,
    errorMessage?: string,
  ): Promise<void> {
    const updateData: any = { status };

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    await this.nativeUpdate(
      {
        id: { $in: crawlIds },
      },
      updateData,
    );
  }

  /**
   * Find duplicate URLs for user
   */
  async findDuplicateUrls(userId: string, url: string): Promise<CrawlEntity[]> {
    return this.find(
      {
        url,
        user: { id: userId },
        deleteFlag: false,
      },
      {
        orderBy: { createAt: 'DESC' },
      },
    );
  }

  /**
   * Get average crawl duration
   */
  async getAverageCrawlDuration(userId?: string): Promise<number> {
    const where: FilterQuery<CrawlEntity> = {
      status: CrawlStatus.COMPLETED,
      crawlDuration: { $ne: null },
      deleteFlag: false,
    };

    if (userId) {
      where.user = { id: userId };
    }

    const result = await this.getEntityManager()
      .createQueryBuilder(CrawlEntity)
      .where(where)
      .select('AVG(crawl_duration) as avg_duration')
      .execute('run');

    return Number(result[0]?.avg_duration) || 0;
  }
}
