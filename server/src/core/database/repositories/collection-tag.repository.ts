import { FindOptions } from '@mikro-orm/core';
import { CollectionTagEntity } from '../entities/collection-tag.entity';
import { BaseRepository } from './base.repository';

type FindCollectionTagOptions<TFields extends string = '*'> = FindOptions<
  CollectionTagEntity,
  'collection' | 'tag' | 'addedBy',
  TFields,
  never
>;

export class CollectionTagRepository extends BaseRepository {
  /**
   * Find collection tags by collection ID
   */
  async findByCollectionId(
    collectionId: string,
    options?: FindCollectionTagOptions,
  ): Promise<CollectionTagEntity[]> {
    const where = this.addTenantIdToQuery<CollectionTagEntity>({
      collection: { id: collectionId },
      deleteFlag: false,
    });

    return this.em.find(CollectionTagEntity, where, {
      populate: ['tag', 'addedBy'],
      orderBy: { createAt: 'ASC' },
      ...options,
    });
  }

  /**
   * Find all collection tags with filters
   */
  async findAll<TFields extends string = '*'>(
    filter: { tagIds?: string[]; collectionIds?: string[] },
    options?: FindCollectionTagOptions<TFields>,
  ) {
    let where = this.addTenantIdToQuery<CollectionTagEntity>({
      deleteFlag: false,
    });

    if (filter.collectionIds && filter.collectionIds.length > 0) {
      where = this.setConditionFilter<CollectionTagEntity>(where, {
        collection: { id: { $in: filter.collectionIds } },
      });
    }

    if (filter.tagIds && filter.tagIds.length > 0) {
      where = this.setConditionFilter<CollectionTagEntity>(where, {
        tag: { id: { $in: filter.tagIds } },
      });
    }

    return this.em.find(CollectionTagEntity, where, options);
  }

  /**
   * Find collection tag by collection and tag
   */
  async findByCollectionAndTag(
    collectionId: string,
    tagId: string,
  ): Promise<CollectionTagEntity | null> {
    const where = this.addTenantIdToQuery<CollectionTagEntity>({
      collection: { id: collectionId },
      tag: { id: tagId },
      deleteFlag: false,
    });

    return this.em.findOne(CollectionTagEntity, where, {
      populate: ['tag', 'collection', 'addedBy'],
    });
  }

  /**
   * Create a new collection tag assignment
   */
  create(collectionTag: CollectionTagEntity): CollectionTagEntity {
    this.addTenantToEntity(collectionTag);
    this.em.persist(collectionTag);
    return collectionTag;
  }

  /**
   * Delete a collection tag (soft delete)
   */
  delete(collectionTag: CollectionTagEntity): void {
    collectionTag.deleteFlag = true;
    collectionTag.deletedAt = new Date();
  }

  /**
   * Bulk delete collection tags by collection IDs
   */
  async bulkDeleteByCollectionIds(collectionIds: string[]): Promise<void> {
    if (collectionIds.length === 0) return;

    const collectionTags = await this.findAll({
      collectionIds,
    });

    const currentDate = new Date();
    for (const collectionTag of collectionTags) {
      collectionTag.deleteFlag = true;
      collectionTag.deletedAt = currentDate;
    }
  }

  /**
   * Bulk delete collection tags by tag IDs
   */
  async bulkDeleteByTagIds(tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) return;

    const collectionTags = await this.findAll({
      tagIds,
    });

    const currentDate = new Date();
    for (const collectionTag of collectionTags) {
      collectionTag.deleteFlag = true;
      collectionTag.deletedAt = currentDate;
    }
  }
}
