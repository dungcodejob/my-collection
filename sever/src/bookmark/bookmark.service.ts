import { BookmarkEntity, CollectionEntity } from '@app/entities';
import { Errors } from '@app/errors';
import { UNIT_OF_WORK, type UnitOfWork } from '@app/repositories';
import { RequestContextService } from '@app/request';
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
    private readonly _requestContextService: RequestContextService,
  ) {}

  /**
   * Create a new bookmark for a specific tenant
   */
  async createBookmark(data: BookmarkCreateInput): Promise<BookmarkEntity> {
    // Get user and tenant entities
    const user = this._requestContextService.user;

    // Check if bookmark with same URL already exists for this user and tenant
    const existingBookmark = await this._unitOfWork.bookmark.findByUrl(
      data.url,
      user.id,
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
          user: { id: user.id },
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
      tenant: this._requestContextService.tenant,
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
      `Created bookmark ${createdBookmark.id} for user ${user.id} in tenant ${this._requestContextService.tenant.id}`,
    );
    return createdBookmark;
  }

  /**
   * Update bookmark within tenant context
   */
  async updateBookmark(
    bookmarkId: string,
    data: BookmarkUpdateInput,
  ): Promise<BookmarkEntity> {
    const user = this._requestContextService.user;
    const tenant = this._requestContextService.tenant;
    const bookmark = await this.findOneByIdOrFail(bookmarkId);

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
          deleteFlag: false,
        });

        if (!collection) {
          throw Errors.Collection.NotFound;
        }

        bookmark.collection = collection;
      }
    }

    await this._unitOfWork.save();
    this.logger.log(
      `Updated bookmark ${bookmarkId} for user ${user.id} in tenant ${tenant.id}`,
    );
    return bookmark;
  }

  /**
   * Delete bookmark
   */
  async deleteBookmark(bookmarkId: string): Promise<void> {
    const bookmark = await this.findOneByIdOrFail(bookmarkId);

    bookmark.deleteFlag = true;
    bookmark.deletedAt = new Date();

    await this._unitOfWork.save();
    this.logger.log(`Deleted bookmark ${bookmarkId}`);
  }

  /**
   * Find bookmark by ID
   */
  async findOneById(bookmarkId: string): Promise<BookmarkEntity | null> {
    return this._unitOfWork.bookmark.findOne({
      id: bookmarkId,
      deleteFlag: false,
    });
  }

  /**
   * Find bookmark by ID or fail
   */
  async findOneByIdOrFail(bookmarkId: string): Promise<BookmarkEntity> {
    const bookmark = await this.findOneById(bookmarkId);

    if (isNil(bookmark)) {
      throw Errors.Bookmark.NotFound;
    }

    return bookmark;
  }

  /**
   * Find bookmarks with search and pagination
   */
  async findBookmarks(
    searchDto: BookmarkSearchDto,
  ): Promise<{ bookmarks: BookmarkEntity[]; total: number }> {
    const user = this._requestContextService.user;
    const { offset = 0, limit = 20, ...filters } = searchDto;

    return this._unitOfWork.bookmark.findWithPagination(
      user.id,
      offset,
      limit,
      {
        search: filters.search,
        collectionId: filters.collectionId,
        isFavorite: filters.isFavorite,
        tags: filters.tags,
      },
    );
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
  async getUserTags(): Promise<string[]> {
    const user = this._requestContextService.user;
    return this._unitOfWork.bookmark.getUserTags(user.id);
  }

  /**
   * Get recent bookmarks
   */
  async getRecentBookmarks(limit: number = 10): Promise<BookmarkEntity[]> {
    const user = this._requestContextService.user;
    return this._unitOfWork.bookmark.findRecent(user.id, limit);
  }

  /**
   * Get favorite bookmarks
   */
  async getFavoriteBookmarks(): Promise<BookmarkEntity[]> {
    const user = this._requestContextService.user;
    return this._unitOfWork.bookmark.findFavorites(user.id);
  }

  /**
   * Get most visited bookmarks
   */
  async getMostVisitedBookmarks(limit: number = 10): Promise<BookmarkEntity[]> {
    const user = this._requestContextService.user;
    return this._unitOfWork.bookmark.findMostVisited(user.id, limit);
  }

  /**
   * Visit bookmark (increment visit count)
   */
  async visitBookmark(bookmarkId: string): Promise<BookmarkEntity> {
    const bookmark = await this.findOneByIdOrFail(bookmarkId);
    bookmark.incrementVisitCount();
    await this._unitOfWork.save();
    return bookmark;
  }

  /**
   * Toggle bookmark favorite status
   */
  async toggleFavorite(bookmarkId: string): Promise<BookmarkEntity> {
    const bookmark = await this.findOneByIdOrFail(bookmarkId);

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
          deleteFlag: false,
        })) ?? undefined;

      if (!collection) {
        throw Errors.Collection.NotFound;
      }
    }

    // Process each bookmark
    for (const bookmarkId of bookmarkIds) {
      try {
        const bookmark = await this.findOneById(bookmarkId);
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
        const bookmark = await this.findOneById(bookmarkId);
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
        const bookmark = await this.findOneById(bookmarkId);
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
    searchTerm: string,
    limit: number = 20,
  ): Promise<BookmarkEntity[]> {
    const user = this._requestContextService.user;
    return this._unitOfWork.bookmark.searchBookmarks(user.id, searchTerm, {
      limit,
    });
  }

  /**
   * Find bookmarks by tags
   */
  async findBookmarksByTags(
    tags: string[],
    limit: number = 20,
  ): Promise<BookmarkEntity[]> {
    const user = this._requestContextService.user;
    return this._unitOfWork.bookmark.findByTags(user.id, tags, { limit });
  }

  /**
   * Get bookmarks by collection
   */
  async getBookmarksByCollection(
    collectionId: string,
  ): Promise<BookmarkEntity[]> {
    const user = this._requestContextService.user;
    return this._unitOfWork.bookmark.findByCollection(collectionId, user.id);
  }
}
