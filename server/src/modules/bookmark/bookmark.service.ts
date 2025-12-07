import { BookmarkEntity } from '@app/entities';
import { Errors } from '@app/errors';
import { QueryDto } from '@app/models';
import {
  FindBookmarkOptions,
  FindOneBookmarkOptions,
  UNIT_OF_WORK,
  type UnitOfWork,
} from '@app/repositories';
import { TagService } from '@app/tag';
import { isNil } from '@app/utils';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { BookmarkSearchDto } from './models';

export type BookmarkCreateInput = {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  faviconUrl?: string;
  siteName?: string;
  contentType?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  notes?: string;
  collectionId?: string;
};

export type BookmarkUpdateInput = {
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  tags?: string[];
  notes?: string;
  collectionId?: string;
  isFavorite?: boolean;
};

@Injectable()
export class BookmarkService {
  private readonly logger = new Logger(BookmarkService.name);

  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly _unitOfWork: UnitOfWork,
    private readonly _tagService: TagService,
  ) {}

  /**
   * Find bookmarks with search and pagination
   */
  async search(
    query: BookmarkSearchDto,
  ): Promise<{ bookmarks: BookmarkEntity[]; total: number }> {
    const newOptions = QueryDto.setConditionSort<BookmarkEntity>(
      {},
      query.sorts,
    ) as FindBookmarkOptions;
    const newFilters = QueryDto.setConditionFilter<BookmarkEntity>(
      {},
      query.filters,
    );

    const { entities, count } = await this._unitOfWork.bookmark.findAll(
      newFilters,
      {
        ...newOptions,
        isHasCount: true,
        populate: ['collection', 'bookmarkTags'],
      },
    );
    return { bookmarks: entities, total: count };
  }

  async findById(id: string, options?: FindOneBookmarkOptions) {
    const bookmark = await this._unitOfWork.bookmark.findOneById(id, options);

    return bookmark;
  }

  async findByIdOrFail(
    id: string,
    options?: FindOneBookmarkOptions,
  ): Promise<BookmarkEntity> {
    const bookmark = await this.findById(id, options);

    if (isNil(bookmark)) {
      throw Errors.Bookmark.NotFound;
    }

    return bookmark;
  }

  async createBookmark(data: BookmarkCreateInput): Promise<BookmarkEntity> {
    // Get user and tenant entities

    // T041: Check if bookmark with same URL already exists for this user
    const existingBookmark = await this._unitOfWork.bookmark.findOne({
      url: data.url,
    });

    if (existingBookmark) {
      this.logger.warn(`Bookmark with URL ${data.url} already exists`);
      // Note: We don't throw an error here - the frontend will handle duplicate confirmation
      // The duplicate check endpoint (T138) will be used to warn users before saving
    }

    // Get collection if specified
    let collection;
    if (data.collectionId) {
      collection = await this._unitOfWork.collection.findOne({
        id: data.collectionId,
      });

      if (!collection) {
        throw new Error('Collection not found');
      }
    }

    // Create bookmark with all fields including faviconUrl
    const bookmark = new BookmarkEntity({
      url: data.url,
      title: data.title,
      collection,
      description: data.description,
      imageUrl: data.imageUrl,
      faviconUrl: data.faviconUrl,
      siteName: data.siteName,
      contentType: data.contentType,
      metadata: data.metadata,
      tags: data.tags,
      notes: data.notes,
    });

    const createdBookmark = this._unitOfWork.bookmark.create(bookmark);

    // if (data.tags && data.tags.length > 0) {
    //   const tags = await this._tagService.findOrCreateTags(data.tags);

    //   for (const tagName of data.tags) {
    //   }
    // }

    // Handle tags if present
    // if (data.tags && data.tags.length > 0) {
    //   for (const tagName of data.tags) {
    //     // Find or create tag
    //     let tag = await this._unitOfWork.tag.findByName(tagName);

    //     if (!tag) {
    //       tag = new TagEntity({
    //         name: tagName,
    //         isSystem: false,
    //       });
    //       this._unitOfWork.tag.create(tag);
    //     }

    //     // Create bookmark tag relation
    //     const bookmarkTag = new BookmarkTagEntity({
    //       bookmark: createdBookmark,
    //       tag,
    //       addedBy: user,
    //     });

    //     this._unitOfWork.bookmarkTag.create(bookmarkTag);
    //   }
    // }

    await this._unitOfWork.save();

    this.logger.log(`Created bookmark ${createdBookmark.id}`);
    return createdBookmark;
  }

  // /**
  //  * Update bookmark within tenant context
  //  */
  // async updateBookmark(
  //   bookmarkId: string,
  //   data: BookmarkUpdateInput,
  // ): Promise<BookmarkEntity> {
  //   const user = this._requestContextService.user;
  //   const tenant = this._requestContextService.tenant;
  //   const bookmark = await this.findOneByIdOrFail(bookmarkId);

  //   // Update basic fields
  //   if (data.title !== undefined) bookmark.title = data.title;
  //   if (data.description !== undefined) bookmark.description = data.description;
  //   if (data.imageUrl !== undefined) bookmark.imageUrl = data.imageUrl;
  //   if (data.siteName !== undefined) bookmark.siteName = data.siteName;
  //   if (data.notes !== undefined) bookmark.notes = data.notes;
  //   if (data.isFavorite !== undefined) {
  //     bookmark.isFavorite = data.isFavorite;
  //   }

  //   // Update tags
  //   if (data.tags !== undefined) {
  //     bookmark.tags = data.tags;
  //   }

  //   // Update collection
  //   if (data.collectionId !== undefined) {
  //     if (data.collectionId === null) {
  //       bookmark.collection = undefined;
  //     } else {
  //       const collection = await this._unitOfWork.collection.findOne({
  //         id: data.collectionId,
  //         deleteFlag: false,
  //       });

  //       if (!collection) {
  //         throw Errors.Collection.NotFound;
  //       }

  //       bookmark.collection = collection;
  //     }
  //   }

  //   await this._unitOfWork.save();
  //   this.logger.log(
  //     `Updated bookmark ${bookmarkId} for user ${user.id} in tenant ${tenant.id}`,
  //   );
  //   return bookmark;
  // }

  // /**
  //  * Delete bookmark
  //  */
  // async deleteBookmark(bookmarkId: string): Promise<void> {
  //   const bookmark = await this.findOneByIdOrFail(bookmarkId);

  //   bookmark.deleteFlag = true;
  //   bookmark.deletedAt = new Date();

  //   await this._unitOfWork.save();
  //   this.logger.log(`Deleted bookmark ${bookmarkId}`);
  // }

  // /**
  //  * Find bookmark by ID
  //  */
  // async findOneById(bookmarkId: string): Promise<BookmarkEntity | null> {
  //   return this._unitOfWork.bookmark.findOne({
  //     id: bookmarkId,
  //     deleteFlag: false,
  //   });
  // }

  // /**
  //  * Find bookmark by ID or fail
  //  */
  // async findOneByIdOrFail(bookmarkId: string): Promise<BookmarkEntity> {
  //   const bookmark = await this.findOneById(bookmarkId);

  //   if (isNil(bookmark)) {
  //     throw Errors.Bookmark.NotFound;
  //   }

  //   return bookmark;
  // }

  /**
   * T138: Check if bookmark URL already exists for current user
   * Returns duplicate status and existing bookmark details if found
   */
  async checkDuplicate(url: string): Promise<BookmarkEntity | null> {
    const existingBookmark = await this._unitOfWork.bookmark.findOneByUrl(url, {
      populate: ['collection', 'bookmarkTags'],
    });

    return existingBookmark;
  }

  // /**
  //  * Get bookmark statistics
  //  */
  // async getBookmarkStats(userId: string) {
  //   return this._unitOfWork.bookmark.getBookmarkStats(userId);
  // }

  // /**
  //  * Get user tags
  //  */
  // async getUserTags(): Promise<string[]> {
  //   const user = this._requestContextService.user;
  //   return this._unitOfWork.bookmark.getUserTags(user.id);
  // }

  // /**
  //  * Get recent bookmarks
  //  */
  // async getRecentBookmarks(limit: number = 10): Promise<BookmarkEntity[]> {
  //   const user = this._requestContextService.user;
  //   return this._unitOfWork.bookmark.findRecent(user.id, limit);
  // }

  // /**
  //  * Get favorite bookmarks
  //  */
  // async getFavoriteBookmarks(): Promise<BookmarkEntity[]> {
  //   const user = this._requestContextService.user;
  //   return this._unitOfWork.bookmark.findFavorites(user.id);
  // }

  // /**
  //  * Get most visited bookmarks
  //  */
  // async getMostVisitedBookmarks(limit: number = 10): Promise<BookmarkEntity[]> {
  //   const user = this._requestContextService.user;
  //   return this._unitOfWork.bookmark.findMostVisited(user.id, limit);
  // }

  // /**
  //  * Visit bookmark (increment visit count)
  //  */
  // async visitBookmark(bookmarkId: string): Promise<BookmarkEntity> {
  //   const bookmark = await this.findOneByIdOrFail(bookmarkId);
  //   bookmark.incrementVisitCount();
  //   await this._unitOfWork.save();
  //   return bookmark;
  // }

  // /**
  //  * Toggle bookmark favorite status
  //  */
  // async toggleFavorite(bookmarkId: string): Promise<BookmarkEntity> {
  //   const bookmark = await this.findOneByIdOrFail(bookmarkId);

  //   if (bookmark.isFavorite) {
  //     bookmark.unmarkAsFavorite();
  //   } else {
  //     bookmark.markAsFavorite();
  //   }

  //   await this._unitOfWork.save();
  //   this.logger.log(
  //     `Toggled favorite status for bookmark ${bookmarkId} to ${bookmark.isFavorite}`,
  //   );
  //   return bookmark;
  // }

  // /**
  //  * Bulk move bookmarks to collection
  //  */
  // async bulkMoveBookmarks(
  //   data: BulkMoveBookmarksDto,
  // ): Promise<BulkBookmarkOperationResponseDto> {
  //   const { bookmarkIds, collectionId } = data;
  //   const results = {
  //     successCount: 0,
  //     failureCount: 0,
  //     totalProcessed: bookmarkIds.length,
  //     failures: [] as string[],
  //   };

  //   // Get collection if specified
  //   let collection: CollectionEntity | undefined;
  //   if (collectionId) {
  //     collection =
  //       (await this._unitOfWork.collection.findOne({
  //         id: collectionId,
  //         deleteFlag: false,
  //       })) ?? undefined;

  //     if (!collection) {
  //       throw Errors.Collection.NotFound;
  //     }
  //   }

  //   // Process each bookmark
  //   for (const bookmarkId of bookmarkIds) {
  //     try {
  //       const bookmark = await this.findOneById(bookmarkId);
  //       if (bookmark) {
  //         bookmark.collection = collection;
  //         results.successCount++;
  //       } else {
  //         results.failures.push(bookmarkId);
  //         results.failureCount++;
  //       }
  //     } catch (error) {
  //       this.logger.error(
  //         `Error processing bookmark ${bookmarkId}: ${error.message}`,
  //       );
  //       results.failures.push(bookmarkId);
  //       results.failureCount++;
  //     }
  //   }

  //   await this._unitOfWork.save();
  //   this.logger.log(
  //     `Bulk moved ${results.successCount} bookmarks to collection ${collectionId}`,
  //   );
  //   return results;
  // }

  // /**
  //  * Bulk update favorite status
  //  */
  // async bulkUpdateFavorites(
  //   data: BulkFavoriteBookmarksDto,
  // ): Promise<BulkBookmarkOperationResponseDto> {
  //   const { bookmarkIds, isFavorite } = data;
  //   const results = {
  //     successCount: 0,
  //     failureCount: 0,
  //     totalProcessed: bookmarkIds.length,
  //     failures: [] as string[],
  //   };

  //   // Process each bookmark
  //   for (const bookmarkId of bookmarkIds) {
  //     try {
  //       const bookmark = await this.findOneById(bookmarkId);
  //       if (bookmark) {
  //         bookmark.isFavorite = isFavorite;
  //         results.successCount++;
  //       } else {
  //         results.failures.push(bookmarkId);
  //         results.failureCount++;
  //       }
  //     } catch (error) {
  //       this.logger.error(
  //         `Error processing bookmark ${bookmarkId}: ${error.message}`,
  //       );
  //       results.failures.push(bookmarkId);
  //       results.failureCount++;
  //     }
  //   }

  //   await this._unitOfWork.save();
  //   this.logger.log(
  //     `Bulk updated favorite status for ${results.successCount} bookmarks`,
  //   );
  //   return results;
  // }

  // /**
  //  * Bulk delete bookmarks
  //  */
  // async bulkDeleteBookmarks(
  //   bookmarkIds: string[],
  // ): Promise<BulkBookmarkOperationResponseDto> {
  //   const results = {
  //     successCount: 0,
  //     failureCount: 0,
  //     totalProcessed: bookmarkIds.length,
  //     failures: [] as string[],
  //   };

  //   // Process each bookmark
  //   for (const bookmarkId of bookmarkIds) {
  //     try {
  //       const bookmark = await this.findOneById(bookmarkId);
  //       if (bookmark) {
  //         bookmark.deleteFlag = true;
  //         bookmark.deletedAt = new Date();
  //         results.successCount++;
  //       } else {
  //         results.failures.push(bookmarkId);
  //         results.failureCount++;
  //       }
  //     } catch (error) {
  //       this.logger.error(
  //         `Error processing bookmark ${bookmarkId}: ${error.message}`,
  //       );
  //       results.failures.push(bookmarkId);
  //       results.failureCount++;
  //     }
  //   }

  //   await this._unitOfWork.save();
  //   this.logger.log(`Bulk deleted ${results.successCount} bookmarks`);
  //   return results;
  // }

  // /**
  //  * Search bookmarks by term
  //  */
  // async searchBookmarks(
  //   searchTerm: string,
  //   limit: number = 20,
  // ): Promise<BookmarkEntity[]> {
  //   const user = this._requestContextService.user;
  //   return this._unitOfWork.bookmark.searchBookmarks(user.id, searchTerm, {
  //     limit,
  //   });
  // }

  // /**
  //  * Find bookmarks by tags
  //  */
  // async findBookmarksByTags(
  //   tags: string[],
  //   limit: number = 20,
  // ): Promise<BookmarkEntity[]> {
  //   const user = this._requestContextService.user;
  //   return this._unitOfWork.bookmark.findByTags(user.id, tags, { limit });
  // }

  // /**
  //  * Get bookmarks by collection
  //  */
  // async getBookmarksByCollection(
  //   collectionId: string,
  // ): Promise<BookmarkEntity[]> {
  //   const user = this._requestContextService.user;
  //   return this._unitOfWork.bookmark.findByCollection(collectionId, user.id);
  // }
}
