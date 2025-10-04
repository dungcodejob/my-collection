import { FilterQuery, FindOptions } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { CollectionEntity } from '../entities/collection.entity';

type FindCollectionOptions = FindOptions<
  CollectionEntity,
  'parent' | 'children',
  '*',
  never
>;

export class CollectionRepository extends EntityRepository<CollectionEntity> {
  /**
   * Find collections by user ID
   */
  async findByUserId(
    userId: string,
    options?: FindCollectionOptions,
  ): Promise<CollectionEntity[]> {
    return this.find(
      {
        user: { id: userId },
        deleteFlag: false,
      },
      {
        orderBy: { sortOrder: 'ASC', createAt: 'ASC' },
        ...options,
      },
    );
  }

  /**
   * Find root collections (collections without parent) for a user
   */
  async findRootCollections(
    options?: FindCollectionOptions,
  ): Promise<CollectionEntity[]> {
    return this.find(
      {
        parent: null,
        deleteFlag: false,
      },
      {
        orderBy: { sortOrder: 'ASC', createAt: 'ASC' },
        ...options,
      },
    );
  }

  /**
   * Find children collections of a parent collection
   */
  async findChildren(
    parentId: string,
    options?: FindCollectionOptions,
  ): Promise<CollectionEntity[]> {
    return this.find(
      {
        parent: { id: parentId },
        deleteFlag: false,
      },
      {
        orderBy: { sortOrder: 'ASC', createAt: 'ASC' },
        ...options,
      },
    );
  }

  /**
   * Find collection tree structure for a user
   */
  async findCollectionTree(maxDepth: number = 5): Promise<CollectionEntity[]> {
    const rootCollections = await this.findRootCollections({
      populate: ['children'],
    });

    // Recursively populate children up to maxDepth
    for (const root of rootCollections) {
      await this.populateChildrenRecursively(root, maxDepth - 1);
    }

    return rootCollections;
  }

  /**
   * Recursively populate children for a collection
   */
  private async populateChildrenRecursively(
    collection: CollectionEntity,
    remainingDepth: number,
  ): Promise<void> {
    if (remainingDepth <= 0) return;

    const children = await this.findChildren(collection.id);
    collection.children.set(children);
    collection.updateHasChildFlag();

    // Recursively populate children's children
    for (const child of children) {
      await this.populateChildrenRecursively(child, remainingDepth - 1);
    }
  }

  /**
   * Find collections by path pattern
   */
  async findByPathPattern(
    userId: string,
    pathPattern: string,
    options?: FindCollectionOptions,
  ): Promise<CollectionEntity[]> {
    return this.find(
      {
        user: { id: userId },
        path: { $like: `%${pathPattern}%` },
        deleteFlag: false,
      },
      {
        orderBy: { path: 'ASC' },
        ...options,
      },
    );
  }

  /**
   * Find collections by name (case-insensitive search)
   */
  async findByName(
    userId: string,
    name: string,
    options?: FindCollectionOptions,
  ): Promise<CollectionEntity[]> {
    return this.find(
      {
        user: { id: userId },
        name: { $ilike: `%${name}%` },
        deleteFlag: false,
      },
      {
        orderBy: { name: 'ASC' },
        ...options,
      },
    );
  }

  /**
   * Count collections by user
   */
  async countByUser(userId: string): Promise<number> {
    return this.count({
      user: { id: userId },
      deleteFlag: false,
    });
  }

  /**
   * Find collections with pagination
   */
  async findWithPagination(
    userId: string,
    offset: number = 0,
    limit: number = 20,
    filters: FilterQuery<CollectionEntity> = {},
  ): Promise<{ collections: CollectionEntity[]; total: number }> {
    const where: FilterQuery<CollectionEntity> = {
      user: { id: userId },
      deleteFlag: false,
      ...(filters as object),
    };

    const [collections, total] = await this.findAndCount(where, {
      offset,
      limit,
      orderBy: { sortOrder: 'ASC', createAt: 'ASC' },
    });

    return { collections, total };
  }

  /**
   * Update sort order for collections
   */
  async updateSortOrder(
    collectionIds: string[],
    userId: string,
  ): Promise<void> {
    for (let i = 0; i < collectionIds.length; i++) {
      await this.nativeUpdate(
        {
          id: collectionIds[i],
          user: { id: userId },
        },
        {
          sortOrder: i,
        },
      );
    }
  }

  /**
   * Soft delete collection and all its children
   */
  async softDeleteWithChildren(
    collectionId: string,
    userId: string,
  ): Promise<void> {
    // Find all children recursively
    const childrenIds = await this.findAllChildrenIds(collectionId, userId);
    const allIds = [collectionId, ...childrenIds];

    // Soft delete all collections
    await this.nativeUpdate(
      {
        id: { $in: allIds },
        user: { id: userId },
      },
      {
        deleteFlag: true,
        deletedAt: new Date(),
      },
    );
  }

  /**
   * Find all children IDs recursively
   */
  private async findAllChildrenIds(
    parentId: string,
    userId: string,
  ): Promise<string[]> {
    const children = await this.find(
      {
        parent: { id: parentId },
        user: { id: userId },
        deleteFlag: false,
      },
      {
        fields: ['id'],
      },
    );

    let allChildrenIds: string[] = children.map((child) => child.id);

    // Recursively find children of children
    for (const child of children) {
      const grandChildren = await this.findAllChildrenIds(child.id, userId);
      allChildrenIds = allChildrenIds.concat(grandChildren);
    }

    return allChildrenIds;
  }

  /**
   * Move collection to new parent
   */
  async moveToParent(
    collectionId: string,
    newParentId: string | null,
  ): Promise<void> {
    const collection = await this.findOneOrFail({
      id: collectionId,
    });

    let parent: CollectionEntity | undefined = undefined;
    if (newParentId) {
      parent = await this.findOneOrFail({
        id: newParentId,
      });
    }

    collection.parent = parent;
    collection.generatePath();

    // Update all children paths recursively
    await this.updateChildrenPaths(collection);
  }

  /**
   * Update paths for all children recursively
   */
  private async updateChildrenPaths(parent: CollectionEntity): Promise<void> {
    const children = await this.findChildren(parent.id);

    for (const child of children) {
      child.parent = parent;
      child.generatePath();
      await this.em.persistAndFlush(child);

      // Recursively update children's children
      await this.updateChildrenPaths(child);
    }
  }
}
