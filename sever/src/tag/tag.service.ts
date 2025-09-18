import { BookmarkTagEntity, TagEntity } from '@app/entities';
import { Errors } from '@app/errors';
import { UNIT_OF_WORK, type UnitOfWork } from '@app/repositories';
import { isNil } from '@app/utils';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { TagSearchDto } from './models';

export type TagCreateInput = {
  name: string;
  description?: string;
  color?: string;
  category?: string;
  isSystem?: boolean;
};

export type TagUpdateInput = {
  name?: string;
  description?: string;
  color?: string;
  category?: string;
  isActive?: boolean;
};

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly _unitOfWork: UnitOfWork,
  ) {}

  /**
   * Create a new tag
   */
  async createTag(data: TagCreateInput, userId: string): Promise<TagEntity> {
    // Get user entity
    const user = await this._unitOfWork.user.findOneOrFail({ id: userId });

    // Check if tag with same name already exists for this user
    const existingTag = await this._unitOfWork.tag.findByName(
      data.name,
      userId,
    );

    if (existingTag) {
      throw Errors.Tag.AlreadyExists;
    }

    // Create tag
    const tag = new TagEntity({
      name: data.name,
      author: user,
      description: data.description,
      color: data.color,
      category: data.category,
      isSystem: data.isSystem || false,
    });

    const createdTag = this._unitOfWork.tag.create(tag);
    await this._unitOfWork.save();

    this.logger.log(`Created tag ${createdTag.id} for user ${userId}`);
    return createdTag;
  }

  /**
   * Update tag
   */
  async updateTag(
    tagId: string,
    data: TagUpdateInput,
    userId: string,
  ): Promise<TagEntity> {
    const tag = await this.findOneByIdOrFail(tagId, userId);

    // Check if new name conflicts with existing tag
    if (data.name && data.name !== tag.name) {
      const existingTag = await this._unitOfWork.tag.findByName(
        data.name,
        userId,
      );
      if (existingTag && existingTag.id !== tagId) {
        throw Errors.Tag.AlreadyExists;
      }
      tag.name = data.name.toLowerCase().trim();
    }

    // Update other fields
    if (data.description !== undefined) tag.description = data.description;
    if (data.color !== undefined) tag.color = data.color;
    if (data.category !== undefined) tag.category = data.category;
    if (data.isActive !== undefined) {
      if (data.isActive) {
        tag.activate();
      } else {
        tag.deactivate();
      }
    }

    await this._unitOfWork.save();
    this.logger.log(`Updated tag ${tagId} for user ${userId}`);
    return tag;
  }

  /**
   * Delete tag
   */
  async deleteTag(tagId: string, userId: string): Promise<void> {
    const tag = await this.findOneByIdOrFail(tagId, userId);

    // Check if tag can be deleted
    if (!tag.canBeDeleted()) {
      throw Errors.Tag.CannotDelete;
    }

    // Soft delete the tag
    tag.deleteFlag = true;
    tag.deletedAt = new Date();

    // Also delete all bookmark-tag relationships
    await this._unitOfWork.bookmarkTag.bulkDeleteByTagIds([tagId]);

    await this._unitOfWork.save();
    this.logger.log(`Deleted tag ${tagId} for user ${userId}`);
  }

  /**
   * Find tag by ID
   */
  async findOneById(tagId: string, userId: string): Promise<TagEntity | null> {
    return this._unitOfWork.tag.findOne({
      id: tagId,
      author: { id: userId },
      deleteFlag: false,
    });
  }

  /**
   * Find tag by ID or fail
   */
  async findOneByIdOrFail(tagId: string, userId: string): Promise<TagEntity> {
    const tag = await this.findOneById(tagId, userId);

    if (isNil(tag)) {
      throw Errors.Tag.NotFound;
    }

    return tag;
  }

  /**
   * Find or create tag by name
   */
  async findOrCreateTag(
    name: string,
    userId: string,
    options?: {
      description?: string;
      color?: string;
      category?: string;
    },
  ): Promise<TagEntity> {
    return this._unitOfWork.tag.findOrCreate(name, userId, options);
  }

  /**
   * Find tags with search and pagination
   */
  async findTags(
    userId: string,
    searchDto: TagSearchDto,
  ): Promise<{ tags: TagEntity[]; total: number }> {
    const { offset = 0, limit = 20, ...filters } = searchDto;

    return this._unitOfWork.tag.findWithPagination(userId, offset, limit, {
      search: filters.search,
      category: filters.category,
      isActive: filters.isActive,
      minUsage: filters.minUsage,
      maxUsage: filters.maxUsage,
    });
  }

  /**
   * Search tags by name
   */
  async searchTags(
    searchTerm: string,
    userId: string,
    limit: number = 20,
  ): Promise<TagEntity[]> {
    return this._unitOfWork.tag.searchByName(searchTerm, userId, limit);
  }

  /**
   * Get popular tags
   */
  async getPopularTags(
    userId: string,
    limit: number = 20,
  ): Promise<TagEntity[]> {
    return this._unitOfWork.tag.findPopular(userId, limit);
  }

  /**
   * Get tags by category
   */
  async getTagsByCategory(
    category: string,
    userId: string,
  ): Promise<TagEntity[]> {
    return this._unitOfWork.tag.findByCategory(category, userId);
  }

  /**
   * Get unused tags
   */
  async getUnusedTags(userId: string): Promise<TagEntity[]> {
    return this._unitOfWork.tag.findUnused(userId);
  }

  /**
   * Get all categories
   */
  async getCategories(userId: string): Promise<string[]> {
    return this._unitOfWork.tag.getCategories(userId);
  }

  /**
   * Get tag statistics
   */
  async getTagStats(userId: string) {
    return this._unitOfWork.tag.getTagStats(userId);
  }

  /**
   * Get tag usage statistics
   */
  async getTagUsageStats(userId: string) {
    return this._unitOfWork.bookmarkTag.getTagUsageStats(userId);
  }

  /**
   * Assign tag to bookmark
   */
  async assignTagToBookmark(
    bookmarkId: string,
    tagId: string,
    userId: string,
    options?: {
      notes?: string;
      isAutoGenerated?: boolean;
      confidence?: number;
    },
  ): Promise<BookmarkTagEntity> {
    // Verify bookmark and tag belong to user
    const [bookmark, tag] = await Promise.all([
      this._unitOfWork.bookmark.findOne({
        id: bookmarkId,
        user: { id: userId },
        deleteFlag: false,
      }),
      this._unitOfWork.tag.findOne({
        id: tagId,
        author: { id: userId },
        deleteFlag: false,
      }),
    ]);

    if (!bookmark) {
      throw Errors.Bookmark.NotFound;
    }

    if (!tag) {
      throw Errors.Tag.NotFound;
    }

    // Check if assignment already exists
    const existingAssignment =
      await this._unitOfWork.bookmarkTag.findByBookmarkAndTag(
        bookmarkId,
        tagId,
      );

    if (existingAssignment) {
      throw Errors.Tag.AlreadyAssigned;
    }

    // Get user entity
    const user = await this._unitOfWork.user.findOneOrFail({ id: userId });

    // Create assignment
    const assignment = new BookmarkTagEntity({
      bookmark,
      tag,
      addedBy: user,
      notes: options?.notes,
      isAutoGenerated: options?.isAutoGenerated || false,
      confidence: options?.confidence,
    });

    const createdAssignment = this._unitOfWork.bookmarkTag.create(assignment);

    // Increment tag usage count
    tag.incrementUsage();

    await this._unitOfWork.save();
    this.logger.log(`Assigned tag ${tagId} to bookmark ${bookmarkId}`);
    return createdAssignment;
  }

  /**
   * Remove tag from bookmark
   */
  async removeTagFromBookmark(
    bookmarkId: string,
    tagId: string,
    userId: string,
  ): Promise<void> {
    const assignment = await this._unitOfWork.bookmarkTag.findByBookmarkAndTag(
      bookmarkId,
      tagId,
    );

    if (!assignment) {
      throw Errors.Tag.NotAssigned;
    }

    // Check if user can remove this assignment
    if (!assignment.canBeRemoved(userId)) {
      throw Errors.Tag.CannotRemove;
    }

    // Soft delete the assignment
    assignment.deleteFlag = true;
    assignment.deletedAt = new Date();

    // Decrement tag usage count
    const tag = await this._unitOfWork.tag.findOneOrFail({ id: tagId });
    tag.decrementUsage();

    await this._unitOfWork.save();
    this.logger.log(`Removed tag ${tagId} from bookmark ${bookmarkId}`);
  }

  // /**
  //  * Bulk update tags
  //  */
  // async bulkUpdateTags(
  //   data: BulkTagUpdateDto[],
  //   userId: string,
  // ): Promise<BulkTagOperationResponseDto> {
  //   const tagIds = data.map((item) => item.tagId);
  //   const results = {
  //     successCount: 0,
  //     failureCount: 0,
  //     totalProcessed: tagIds.length,
  //     failures: [] as string[],
  //   };

  //   const tags = this._unitOfWork.tag.u

  //   for (const tagId of tagIds) {
  //     try {
  //       await this.updateTag(tagId, updateData, userId);
  //       results.successCount++;
  //     } catch (error) {
  //       this.logger.error(
  //         `Error updating tag ${tagId}: ${error.message}`,
  //         error.stack,
  //       );
  //       results.failures.push(tagId);
  //       results.failureCount++;
  //     }
  //   }

  //   this.logger.log(
  //     `Bulk updated ${results.successCount} tags for user ${userId}`,
  //   );
  //   return results;
  // }

  // /**
  //  * Bulk delete tags
  //  */
  // async bulkDeleteTags(
  //   data: BulkTagOperationDto,
  //   userId: string,
  // ): Promise<BulkTagOperationResponseDto> {
  //   const { tagIds } = data;
  //   const results = {
  //     successCount: 0,
  //     failureCount: 0,
  //     totalProcessed: tagIds.length,
  //     failures: [] as string[],
  //   };

  //   for (const tagId of tagIds) {
  //     try {
  //       await this.deleteTag(tagId, userId);
  //       results.successCount++;
  //     } catch (error) {
  //       this.logger.error(
  //         `Error deleting tag ${tagId}: ${error.message}`,
  //         error.stack,
  //       );
  //       results.failures.push(tagId);
  //       results.failureCount++;
  //     }
  //   }

  //   this.logger.log(
  //     `Bulk deleted ${results.successCount} tags for user ${userId}`,
  //   );
  //   return results;
  // }

  // /**
  //  * Bulk assign tags to bookmarks
  //  */
  // async bulkAssignTags(
  //   data: BulkTagAssignDto,
  //   userId: string,
  // ): Promise<BulkTagOperationResponseDto> {
  //   const { bookmarkIds, tagIds, notes } = data;
  //   let successCount = 0;
  //   let failureCount = 0;
  //   const failures: string[] = [];

  //   for (const bookmarkId of bookmarkIds) {
  //     for (const tagId of tagIds) {
  //       try {
  //         await this.assignTagToBookmark(bookmarkId, tagId, userId, { notes });
  //         successCount++;
  //       } catch (error) {
  //         this.logger.error(
  //           `Error assigning tag ${tagId} to bookmark ${bookmarkId}: ${error.message}`,
  //           error.stack,
  //         );
  //         failures.push(`${bookmarkId}-${tagId}`);
  //         failureCount++;
  //       }
  //     }
  //   }

  //   const totalProcessed = bookmarkIds.length * tagIds.length;
  //   this.logger.log(
  //     `Bulk assigned tags: ${successCount} successful, ${failureCount} failed`,
  //   );

  //   return {
  //     successCount,
  //     failureCount,
  //     totalProcessed,
  //     failures,
  //   };
  // }

  /**
   * Get related tags
   */
  async getRelatedTags(
    tagId: string,
    userId: string,
    limit: number = 10,
  ): Promise<{ tagId: string; tagName: string; coOccurrence: number }[]> {
    return this._unitOfWork.bookmarkTag.findRelatedTags(tagId, userId, limit);
  }

  /**
   * Get similar tags by name
   */
  async getSimilarTags(
    name: string,
    userId: string,
    limit: number = 5,
  ): Promise<TagEntity[]> {
    return this._unitOfWork.tag.findSimilar(name, userId, limit);
  }

  /**
   * Get tag timeline
   */
  async getTagTimeline(
    userId: string,
    days: number = 30,
  ): Promise<{ date: string; count: number }[]> {
    return this._unitOfWork.bookmarkTag.getTagTimeline(userId, days);
  }

  /**
   * Clean up unused tags
   */
  async cleanupUnusedTags(userId: string): Promise<number> {
    const unusedTags = await this.getUnusedTags(userId);
    const deletableTags = unusedTags.filter((tag) => tag.canBeDeleted());

    for (const tag of deletableTags) {
      tag.deleteFlag = true;
      tag.deletedAt = new Date();
    }

    await this._unitOfWork.save();
    this.logger.log(
      `Cleaned up ${deletableTags.length} unused tags for user ${userId}`,
    );
    return deletableTags.length;
  }
}
