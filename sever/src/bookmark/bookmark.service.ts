import { BookmarkEntity, CollectionEntity } from '@app/entities';
import { Errors } from '@app/errors';
import { UNIT_OF_WORK, type UnitOfWork } from '@app/repositories';
import { isNil } from '@app/utils';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  BookmarkSearchDto,
  BulkBookmarkOperationResponseDto,
  BulkFavoriteBookmarksDto,
  BulkMoveBookmarksDto,
} from './models';

export type BookmarkCreateInput = {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
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
  ) {}

  /**
   * Create a new bookmark
   */
  async createBookmark(
    data: BookmarkCreateInput,
    userId: string,
  ): Promise<BookmarkEntity> {
    // Get user entity
    const user = await this._unitOfWork.user.findOneOrFail({ id: userId });

    // Check if bookmark with same URL already exists for this user
    const existingBookmark = await this._unitOfWork.bookmark.findByUrl(
      data.url,
      userId,
    );

    if (existingBookmark) {
      throw Errors.Bookmark.AlreadyExists;
    }

    // Get collection if specified
    let collection: CollectionEntity | undefined;
    if (data.collectionId) {
      collection =
        (await this._unitOfWork.collection.findOne({
          id: data.collectionId,
          user: { id: userId },
          deleteFlag: false,
        })) ?? undefined;

      if (!collection) {
        throw Errors.Collection.NotFound;
      }
    }

    // Create bookmark
    const bookmark = new BookmarkEntity({
      url: data.url,
      title: data.title,
      user,
      collection,
      description: data.description,
      imageUrl: data.imageUrl,
      siteName: data.siteName,
      contentType: data.contentType,
      metadata: data.metadata,
      tags: data.tags,
      notes: data.notes,
    });

    const createdBookmark = this._unitOfWork.bookmark.create(bookmark);
    await this._unitOfWork.save();

    this.logger.log(
      `Created bookmark ${createdBookmark.id} for user ${userId}`,
    );
    return createdBookmark;
  }

  /**
   * Update bookmark
   */
  async updateBookmark(
    bookmarkId: string,
    data: BookmarkUpdateInput,
    userId: string,
  ): Promise<BookmarkEntity> {
    const bookmark = await this.findOneByIdOrFail(bookmarkId, userId);

    // Update basic fields
    if (data.title !== undefined) bookmark.title = data.title;
    if (data.description !== undefined) bookmark.description = data.description;
    if (data.imageUrl !== undefined) bookmark.imageUrl = data.imageUrl;
    if (data.siteName !== undefined) bookmark.siteName = data.siteName;
    if (data.notes !== undefined) bookmark.notes = data.notes;
    if (data.isFavorite !== undefined) {
      bookmark.isFavorite = data.isFavorite;
    }

    // Update tags
    if (data.tags !== undefined) {
      bookmark.tags = data.tags;
    }

    // Update collection
    if (data.collectionId !== undefined) {
      if (data.collectionId === null) {
        bookmark.collection = undefined;
      } else {
        const collection = await this._unitOfWork.collection.findOne({
          id: data.collectionId,
          user: { id: userId },
          deleteFlag: false,
        });

        if (!collection) {
          throw Errors.Collection.NotFound;
        }

        bookmark.collection = collection;
      }
    }

    await this._unitOfWork.save();
    this.logger.log(`Updated bookmark ${bookmarkId} for user ${userId}`);
    return bookmark;
  }

  /**
   * Delete bookmark
   */
  async deleteBookmark(bookmarkId: string, userId: string): Promise<void> {
    const bookmark = await this.findOneByIdOrFail(bookmarkId, userId);

    bookmark.deleteFlag = true;
    bookmark.deletedAt = new Date();

    await this._unitOfWork.save();
    this.logger.log(`Deleted bookmark ${bookmarkId} for user ${userId}`);
  }

  /**
   * Find bookmark by ID
   */
  async findOneById(
    bookmarkId: string,
    userId: string,
  ): Promise<BookmarkEntity | null> {
    return this._unitOfWork.bookmark.findOne({
      id: bookmarkId,
      user: { id: userId },
      deleteFlag: false,
    });
  }

  /**
   * Find bookmark by ID or fail
   */
  async findOneByIdOrFail(
    bookmarkId: string,
    userId: string,
  ): Promise<BookmarkEntity> {
    const bookmark = await this.findOneById(bookmarkId, userId);

    if (isNil(bookmark)) {
      throw Errors.Bookmark.NotFound;
    }

    return bookmark;
  }

  /**
   * Find bookmarks with search and pagination
   */
  async findBookmarks(
    userId: string,
    searchDto: BookmarkSearchDto,
  ): Promise<{ bookmarks: BookmarkEntity[]; total: number }> {
    const { offset = 0, limit = 20, ...filters } = searchDto;

    return this._unitOfWork.bookmark.findWithPagination(userId, offset, limit, {
      search: filters.search,
      collectionId: filters.collectionId,
      isFavorite: filters.isFavorite,
      tags: filters.tags,
    });
  }

  /**
   * Get bookmark statistics
   */
  async getBookmarkStats(userId: string) {
    return this._unitOfWork.bookmark.getBookmarkStats(userId);
  }

  /**
   * Get user tags
   */
  async getUserTags(userId: string): Promise<string[]> {
    return this._unitOfWork.bookmark.getUserTags(userId);
  }

  /**
   * Get recent bookmarks
   */
  async getRecentBookmarks(
    userId: string,
    limit: number = 10,
  ): Promise<BookmarkEntity[]> {
    return this._unitOfWork.bookmark.findRecent(userId, limit);
  }

  /**
   * Get favorite bookmarks
   */
  async getFavoriteBookmarks(userId: string): Promise<BookmarkEntity[]> {
    return this._unitOfWork.bookmark.findFavorites(userId);
  }

  /**
   * Get most visited bookmarks
   */
  async getMostVisitedBookmarks(
    userId: string,
    limit: number = 10,
  ): Promise<BookmarkEntity[]> {
    return this._unitOfWork.bookmark.findMostVisited(userId, limit);
  }

  /**
   * Visit bookmark (increment visit count)
   */
  async visitBookmark(
    bookmarkId: string,
    userId: string,
  ): Promise<BookmarkEntity> {
    const bookmark = await this.findOneByIdOrFail(bookmarkId, userId);
    bookmark.incrementVisitCount();
    await this._unitOfWork.save();
    return bookmark;
  }

  /**
   * Toggle bookmark favorite status
   */
  async toggleFavorite(
    bookmarkId: string,
    userId: string,
  ): Promise<BookmarkEntity> {
    const bookmark = await this.findOneByIdOrFail(bookmarkId, userId);

    if (bookmark.isFavorite) {
      bookmark.unmarkAsFavorite();
    } else {
      bookmark.markAsFavorite();
    }

    await this._unitOfWork.save();
    this.logger.log(
      `Toggled favorite status for bookmark ${bookmarkId} to ${bookmark.isFavorite}`,
    );
    return bookmark;
  }

  /**
   * Bulk move bookmarks to collection
   */
  async bulkMoveBookmarks(
    data: BulkMoveBookmarksDto,
    userId: string,
  ): Promise<BulkBookmarkOperationResponseDto> {
    const { bookmarkIds, collectionId } = data;
    const results = {
      successCount: 0,
      failureCount: 0,
      totalProcessed: bookmarkIds.length,
      failures: [] as string[],
    };

    // Get collection if specified
    let collection: CollectionEntity | undefined;
    if (collectionId) {
      collection =
        (await this._unitOfWork.collection.findOne({
          id: collectionId,
          user: { id: userId },
          deleteFlag: false,
        })) ?? undefined;

      if (!collection) {
        throw Errors.Collection.NotFound;
      }
    }

    // Process each bookmark
    for (const bookmarkId of bookmarkIds) {
      try {
        const bookmark = await this.findOneById(bookmarkId, userId);
        if (bookmark) {
          bookmark.collection = collection;
          results.successCount++;
        } else {
          results.failures.push(bookmarkId);
          results.failureCount++;
        }
      } catch (error) {
        this.logger.error(
          `Error processing bookmark ${bookmarkId}: ${error.message}`,
        );
        results.failures.push(bookmarkId);
        results.failureCount++;
      }
    }

    await this._unitOfWork.save();
    this.logger.log(
      `Bulk moved ${results.successCount} bookmarks to collection ${collectionId}`,
    );
    return results;
  }

  /**
   * Bulk update favorite status
   */
  async bulkUpdateFavorites(
    data: BulkFavoriteBookmarksDto,
    userId: string,
  ): Promise<BulkBookmarkOperationResponseDto> {
    const { bookmarkIds, isFavorite } = data;
    const results = {
      successCount: 0,
      failureCount: 0,
      totalProcessed: bookmarkIds.length,
      failures: [] as string[],
    };

    // Process each bookmark
    for (const bookmarkId of bookmarkIds) {
      try {
        const bookmark = await this.findOneById(bookmarkId, userId);
        if (bookmark) {
          bookmark.isFavorite = isFavorite;
          results.successCount++;
        } else {
          results.failures.push(bookmarkId);
          results.failureCount++;
        }
      } catch (error) {
        this.logger.error(
          `Error processing bookmark ${bookmarkId}: ${error.message}`,
        );
        results.failures.push(bookmarkId);
        results.failureCount++;
      }
    }

    await this._unitOfWork.save();
    this.logger.log(
      `Bulk updated favorite status for ${results.successCount} bookmarks`,
    );
    return results;
  }

  /**
   * Bulk delete bookmarks
   */
  async bulkDeleteBookmarks(
    bookmarkIds: string[],
    userId: string,
  ): Promise<BulkBookmarkOperationResponseDto> {
    const results = {
      successCount: 0,
      failureCount: 0,
      totalProcessed: bookmarkIds.length,
      failures: [] as string[],
    };

    // Process each bookmark
    for (const bookmarkId of bookmarkIds) {
      try {
        const bookmark = await this.findOneById(bookmarkId, userId);
        if (bookmark) {
          bookmark.deleteFlag = true;
          bookmark.deletedAt = new Date();
          results.successCount++;
        } else {
          results.failures.push(bookmarkId);
          results.failureCount++;
        }
      } catch (error) {
        this.logger.error(
          `Error processing bookmark ${bookmarkId}: ${error.message}`,
        );
        results.failures.push(bookmarkId);
        results.failureCount++;
      }
    }

    await this._unitOfWork.save();
    this.logger.log(`Bulk deleted ${results.successCount} bookmarks`);
    return results;
  }

  /**
   * Search bookmarks by term
   */
  async searchBookmarks(
    userId: string,
    searchTerm: string,
    limit: number = 20,
  ): Promise<BookmarkEntity[]> {
    return this._unitOfWork.bookmark.searchBookmarks(userId, searchTerm, {
      limit,
    });
  }

  /**
   * Find bookmarks by tags
   */
  async findBookmarksByTags(
    userId: string,
    tags: string[],
    limit: number = 20,
  ): Promise<BookmarkEntity[]> {
    return this._unitOfWork.bookmark.findByTags(userId, tags, { limit });
  }

  /**
   * Get bookmarks by collection
   */
  async getBookmarksByCollection(
    collectionId: string,
    userId: string,
  ): Promise<BookmarkEntity[]> {
    return this._unitOfWork.bookmark.findByCollection(collectionId, userId);
  }
}
