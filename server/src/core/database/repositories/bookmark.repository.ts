import { PaginationQueryDto, QueryDto } from '@app/models';
import { FindOptions } from '@mikro-orm/core';
import { BookmarkEntity } from '../entities/bookmark.entity';
import { BaseRepository, EntityWithCount } from './base.repository';

type FindBookmarkOptions = FindOptions<
  BookmarkEntity,
  'user' | 'collection',
  '*',
  never
>;

export type BookmarkQuery = PaginationQueryDto & {
  collectionId?: string;
};

export class BookmarkRepository extends BaseRepository {
  // /**
  //  * Find bookmarks by user ID
  //  */
  async findAll(
    query: BookmarkQuery,
    options?: FindBookmarkOptions,
  ): Promise<BookmarkEntity[]>;
  async findAll(
    query: BookmarkQuery,
    options?: FindBookmarkOptions & { isHasCount: true },
  ): Promise<EntityWithCount<BookmarkEntity>>;
  async findAll(
    query: BookmarkQuery,
    options?: FindBookmarkOptions & { isHasCount?: true },
  ): Promise<BookmarkEntity[] | EntityWithCount<BookmarkEntity>> {
    const { collectionId } = query;
    let where = this.addUserIdAndTenantIdToQuery<BookmarkEntity>({
      deleteFlag: false,
    });

    if (collectionId) {
      where = this.setConditionFilter(where, {
        collection: { id: collectionId },
      });
    }

    where = QueryDto.setConditionFilter(where, query?.filters);
    const newOptions = QueryDto.setConditionSort(options || {}, query?.sorts);

    if (options?.isHasCount) {
      const [entities, count] = await this.em.findAndCount(
        BookmarkEntity,
        where,
        newOptions,
      );
      return {
        entities,
        count,
      };
    }
    return this.em.find(BookmarkEntity, where, newOptions);
  }

  // /**
  //  * Find bookmarks by user ID and tenant ID
  //  */
  // async findByUserAndTenant(
  //   userId: string,
  //   tenantId: string,
  //   options?: FindBookmarkOptions,
  // ): Promise<BookmarkEntity[]> {
  //   return this.find(
  //     {
  //       user: { id: userId },
  //       tenant: { id: tenantId },
  //       deleteFlag: false,
  //     },
  //     {
  //       orderBy: { createAt: 'DESC' },
  //       populate: ['collection'],
  //       ...options,
  //     },
  //   );
  // }

  // /**
  //  * Find bookmark by URL and user
  //  */
  // async findByUrl(
  //   url: string,
  //   userId: string,
  //   options?: FindBookmarkOptions,
  // ): Promise<BookmarkEntity | null> {
  //   return this.findOne(
  //     {
  //       url,
  //       user: { id: userId },
  //       deleteFlag: false,
  //     },
  //     {
  //       populate: ['collection'],
  //       ...options,
  //     },
  //   );
  // }

  // /**
  //  * Find bookmark by URL, user and tenant
  //  */
  // async findByUrlAndTenant(
  //   url: string,
  //   userId: string,
  //   tenantId: string,
  //   options?: FindBookmarkOptions,
  // ): Promise<BookmarkEntity | null> {
  //   return this.findOne(
  //     {
  //       url,
  //       user: { id: userId },
  //       tenant: { id: tenantId },
  //       deleteFlag: false,
  //     },
  //     {
  //       populate: ['collection'],
  //       ...options,
  //     },
  //   );
  // }

  // /**
  //  * Find bookmarks by collection
  //  */
  // async findByCollection(
  //   collectionId: string,
  //   userId: string,
  //   options?: FindBookmarkOptions,
  // ): Promise<BookmarkEntity[]> {
  //   return this.find(
  //     {
  //       collection: { id: collectionId },
  //       user: { id: userId },
  //       deleteFlag: false,
  //     },
  //     {
  //       orderBy: { createAt: 'DESC' },
  //       populate: ['collection'],
  //       ...options,
  //     },
  //   );
  // }

  // /**
  //  * Find bookmarks by collection with tenant context
  //  */
  // async findByCollectionAndTenant(
  //   collectionId: string,
  //   userId: string,
  //   tenantId: string,
  //   options?: FindBookmarkOptions,
  // ): Promise<BookmarkEntity[]> {
  //   return this.find(
  //     {
  //       collection: { id: collectionId },
  //       user: { id: userId },
  //       tenant: { id: tenantId },
  //       deleteFlag: false,
  //     },
  //     {
  //       orderBy: { createAt: 'DESC' },
  //       populate: ['collection'],
  //       ...options,
  //     },
  //   );
  // }

  // /**
  //  * Find favorite bookmarks
  //  */
  // async findFavorites(
  //   userId: string,
  //   options?: FindBookmarkOptions,
  // ): Promise<BookmarkEntity[]> {
  //   return this.find(
  //     {
  //       user: { id: userId },
  //       isFavorite: true,
  //       deleteFlag: false,
  //     },
  //     {
  //       orderBy: { createAt: 'DESC' },
  //       populate: ['collection'],
  //       ...options,
  //     },
  //   );
  // }

  // /**
  //  * Search bookmarks by title, description, or tags
  //  */
  // async searchBookmarks(
  //   userId: string,
  //   searchTerm: string,
  //   options?: FindBookmarkOptions,
  // ): Promise<BookmarkEntity[]> {
  //   const searchPattern = `%${searchTerm.toLowerCase()}%`;

  //   return this.find(
  //     {
  //       user: { id: userId },
  //       deleteFlag: false,
  //       $or: [
  //         { title: { $ilike: searchPattern } },
  //         { description: { $ilike: searchPattern } },
  //         { tags: { $contains: [searchTerm.toLowerCase()] } },
  //         { url: { $ilike: searchPattern } },
  //       ],
  //     },
  //     {
  //       orderBy: { createAt: 'DESC' },
  //       populate: ['collection'],
  //       ...options,
  //     },
  //   );
  // }

  // /**
  //  * Find bookmarks by tags
  //  */
  // async findByTags(
  //   userId: string,
  //   tags: string[],
  //   options?: FindBookmarkOptions,
  // ): Promise<BookmarkEntity[]> {
  //   const normalizedTags = tags.map((tag) => tag.toLowerCase().trim());

  //   return this.find(
  //     {
  //       user: { id: userId },
  //       deleteFlag: false,
  //       tags: { $overlap: normalizedTags },
  //     },
  //     {
  //       orderBy: { createAt: 'DESC' },
  //       populate: ['collection'],
  //       ...options,
  //     },
  //   );
  // }

  // /**
  //  * Find recent bookmarks
  //  */
  // async findRecent(
  //   userId: string,
  //   limit: number = 10,
  //   options?: FindBookmarkOptions,
  // ): Promise<BookmarkEntity[]> {
  //   return this.find(
  //     {
  //       user: { id: userId },
  //       deleteFlag: false,
  //     },
  //     {
  //       orderBy: { createAt: 'DESC' },
  //       limit,
  //       populate: ['collection'],
  //       ...options,
  //     },
  //   );
  // }

  // /**
  //  * Find most visited bookmarks
  //  */
  // async findMostVisited(
  //   userId: string,
  //   limit: number = 10,
  //   options?: FindBookmarkOptions,
  // ): Promise<BookmarkEntity[]> {
  //   return this.find(
  //     {
  //       user: { id: userId },
  //       deleteFlag: false,
  //       visitCount: { $gt: 0 },
  //     },
  //     {
  //       orderBy: { visitCount: 'DESC' },
  //       limit,
  //       populate: ['collection'],
  //       ...options,
  //     },
  //   );
  // }

  // /**
  //  * Count bookmarks by user
  //  */
  // async countByUserId(userId: string): Promise<number> {
  //   return this.count({
  //     user: { id: userId },
  //     deleteFlag: false,
  //   });
  // }

  // /**
  //  * Count bookmarks by collection
  //  */
  // async countByCollection(
  //   collectionId: string,
  //   userId: string,
  // ): Promise<number> {
  //   return this.count({
  //     collection: { id: collectionId },
  //     user: { id: userId },
  //     deleteFlag: false,
  //   });
  // }

  // /**
  //  * Count favorite bookmarks
  //  */
  // async countFavorites(userId: string): Promise<number> {
  //   return this.count({
  //     user: { id: userId },
  //     isFavorite: true,
  //     deleteFlag: false,
  //   });
  // }

  // /**
  //  * Get bookmark statistics for user
  //  */
  // async getBookmarkStats(userId: string): Promise<{
  //   total: number;
  //   favorites: number;
  //   withCollection: number;
  //   withoutCollection: number;
  //   totalVisits: number;
  // }> {
  //   const [total, favorites, withCollection, withoutCollection] =
  //     await Promise.all([
  //       this.countByUserId(userId),
  //       this.countFavorites(userId),
  //       this.count({
  //         user: { id: userId },
  //         collection: { $ne: null },
  //         deleteFlag: false,
  //       }),
  //       this.count({
  //         user: { id: userId },
  //         collection: null,
  //         deleteFlag: false,
  //       }),
  //     ]);

  //   // Get total visits
  //   const result = await this.getEntityManager()
  //     .getConnection()
  //     .execute(
  //       'SELECT SUM(visit_count) as total_visits FROM bookmark_entity WHERE user_id = ? AND delete_flag = false',
  //       [userId],
  //     );
  //   const totalVisits = parseInt(result[0]?.total_visits || '0', 10);

  //   return {
  //     total,
  //     favorites,
  //     withCollection,
  //     withoutCollection,
  //     totalVisits,
  //   };
  // }

  // /**
  //  * Get all unique tags for user
  //  */
  // async getUserTags(userId: string): Promise<string[]> {
  //   const bookmarks = await this.find(
  //     {
  //       user: { id: userId },
  //       deleteFlag: false,
  //       tags: { $ne: null },
  //     },
  //     {
  //       fields: ['tags'],
  //     },
  //   );

  //   const allTags = new Set<string>();
  //   bookmarks.forEach((bookmark) => {
  //     if (bookmark.tags && Array.isArray(bookmark.tags)) {
  //       bookmark.tags.forEach((tag) => {
  //         if (tag && tag.trim()) {
  //           allTags.add(tag.trim());
  //         }
  //       });
  //     }
  //   });

  //   return Array.from(allTags).sort();
  // }

  // /**
  //  * Find bookmarks with pagination
  //  */
  // async findWithPagination(
  //   userId: string,
  //   offset: number = 0,
  //   limit: number = 20,
  //   filters?: {
  //     search?: string;
  //     collectionId?: string;
  //     isFavorite?: boolean;
  //     tags?: string[];
  //   },
  // ): Promise<{ bookmarks: BookmarkEntity[]; total: number }> {
  //   const where: FilterQuery<BookmarkEntity> = {
  //     user: { id: userId },
  //     deleteFlag: false,
  //   };

  //   if (filters?.search) {
  //     const searchPattern = `%${filters.search.toLowerCase()}%`;
  //     where.$or = [
  //       { title: { $ilike: searchPattern } },
  //       { description: { $ilike: searchPattern } },
  //       { tags: { $contains: [filters.search.toLowerCase()] } },
  //       { url: { $ilike: searchPattern } },
  //     ];
  //   }

  //   if (filters?.collectionId) {
  //     where.collection = { id: filters.collectionId };
  //   }

  //   if (filters?.isFavorite !== undefined) {
  //     where.isFavorite = filters.isFavorite;
  //   }

  //   if (filters?.tags && filters.tags.length > 0) {
  //     const normalizedTags = filters.tags.map((tag) =>
  //       tag.toLowerCase().trim(),
  //     );
  //     where.tags = { $overlap: normalizedTags };
  //   }

  //   const [bookmarks, total] = await this.findAndCount(where, {
  //     orderBy: { createAt: 'DESC' },
  //     offset,
  //     limit,
  //     populate: ['collection'],
  //   });

  //   return { bookmarks, total };
  // }
}
