import { CollectionEntity } from '@app/entities';
import { Errors } from '@app/errors';
import { UNIT_OF_WORK, type UnitOfWork } from '@app/repositories';
import { RequestContextService } from '@app/request';
import { isNil } from '@app/utils';
import { FilterQuery, Populate } from '@mikro-orm/core';
import { Inject, Injectable } from '@nestjs/common';

export type CollectionCreateInput = {
  name: string;
  icon?: string;
  parentId?: string;
  description?: string;
  sortOrder?: number;
};

export type CollectionUpdateInput = Partial<{
  name: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
}>;

export type CollectionMoveInput = {
  newParentId?: string;
};

export type CollectionQueryOptions = {
  includeChildren?: boolean;
  maxDepth?: number;
  search?: string;
  parentId?: string;
};

export type PaginationOptions = {
  offset?: number;
  limit?: number;
};

// TODO Collection: using user from context
@Injectable()
export class CollectionService {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork,
    private readonly _ctx: RequestContextService,
  ) {}

  /**
   * Find collection by ID for a specific user and tenant
   */
  async findOneById(
    id: string,
    options?: CollectionQueryOptions,
  ): Promise<CollectionEntity | null> {
    const populateFields: string[] = ['user', 'tenant'];
    if (options?.includeChildren) {
      populateFields.push('children');
    }

    const collection = await this._unitOfWork.collection.findOne(
      {
        id,
        deleteFlag: false,
      },
      {
        populate: populateFields as Populate<CollectionEntity, 'children'>,
      },
    );

    return collection;
  }

  /**
   * Find collection by ID or fail
   */
  async findOneByIdOrFail(
    id: string,
    options?: CollectionQueryOptions,
  ): Promise<CollectionEntity> {
    const collection = await this.findOneById(id, options);

    if (isNil(collection)) {
      throw Errors.Collection.NotFound;
    }

    return collection;
  }

  /**
   * Find all collections for a user within a tenant
   */
  async findByUserId(
    options?: CollectionQueryOptions & PaginationOptions,
  ): Promise<CollectionEntity[]> {
    const tenant = this._ctx.tenant;
    const user = this._ctx.user;
    if (options?.search) {
      return this._unitOfWork.collection.findByName(user.id, options.search, {
        offset: options.offset,
        limit: options.limit,
      });
    }

    if (options?.parentId) {
      return this._unitOfWork.collection.findChildren(options.parentId, {
        offset: options.offset,
        limit: options.limit,
      });
    }

    return this._unitOfWork.collection.findByUserId(user.id, {
      offset: options?.offset,
      limit: options?.limit,
    });
  }

  /**
   * Find root collections (collections without parent) for a tenant
   */
  async findRootCollections(
    options?: PaginationOptions,
  ): Promise<CollectionEntity[]> {
    return this._unitOfWork.collection.findRootCollections({
      offset: options?.offset,
      limit: options?.limit,
    });
  }

  /**
   * Find collection tree structure for a tenant
   */
  async findCollectionTree(maxDepth: number = 5): Promise<CollectionEntity[]> {
    return this._unitOfWork.collection.findCollectionTree(maxDepth);
  }

  /**
   * Find children of a collection within a tenant
   */
  async findChildren(
    parentId: string,
    options?: PaginationOptions,
  ): Promise<CollectionEntity[]> {
    return this._unitOfWork.collection.findChildren(parentId, {
      offset: options?.offset,
      limit: options?.limit,
    });
  }

  /**
   * Find collections with pagination for a tenant
   */
  async findWithPagination(
    userId: string,
    options?: PaginationOptions & {
      filters?: FilterQuery<CollectionEntity>;
    },
  ): Promise<{ collections: CollectionEntity[]; total: number }> {
    return this._unitOfWork.collection.findWithPagination(
      userId,
      options?.offset,
      options?.limit,
      options?.filters,
    );
  }

  /**
   * Count collections by user and tenant
   */
  async countByUser(userId: string): Promise<number> {
    return this._unitOfWork.collection.countByUser(userId);
  }

  /**
   * Create a new collection
   */
  async create(data: CollectionCreateInput): Promise<CollectionEntity> {
    // Start transaction
    await this._unitOfWork.start();

    const user = this._ctx.user;
    const tenant = this._ctx.tenant;
    try {
      // Validate parent if provided
      let parent: CollectionEntity | undefined;

      if (data.parentId) {
        parent = await this.findOneByIdOrFail(data.parentId);
      }

      // Create collection with temporary path (will be updated after ID is generated)
      const collection = new CollectionEntity({
        name: data.name,
        icon: data.icon,
        path: 'temp', // Temporary path
        description: data.description,
        sortOrder: data.sortOrder,
        user,
        tenant,
        parent,
      });

      const createdCollection = this._unitOfWork.collection.create(collection);

      // Flush to get the generated ID
      await this._unitOfWork.getEntityManager().flush();

      // Now generate the proper path using the ID
      createdCollection.generatePath();

      // Update parent's hasChild flag if parent exists
      if (parent) {
        parent.updateHasChildFlag();
      }

      // Commit transaction
      await this._unitOfWork.commit();

      return createdCollection;
    } catch (error) {
      // Rollback transaction on error
      await this._unitOfWork.rollback();
      throw error;
    }
  }

  /**
   * Update a collection
   */
  async update(
    id: string,
    data: CollectionUpdateInput,
    userId: string,
  ): Promise<CollectionEntity> {
    const collection = await this.findOneByIdOrFail(id);

    // Update fields
    if (data.name !== undefined) {
      collection.name = data.name;
      // Regenerate path if name changed
      collection.generatePath();
      // Update children paths recursively
      await this._updateChildrenPathsRecursively(collection, userId);
    }

    if (data.icon !== undefined) {
      collection.icon = data.icon;
    }

    if (data.description !== undefined) {
      collection.description = data.description;
    }

    if (data.sortOrder !== undefined) {
      collection.sortOrder = data.sortOrder;
    }

    return collection;
  }

  /**
   * Move collection to new parent
   */
  async move(
    id: string,
    data: CollectionMoveInput,
    userId: string,
  ): Promise<CollectionEntity> {
    await this._unitOfWork.start();

    try {
      const collection = await this.findOneByIdOrFail(id);
      const oldParent = collection.parent;

      // Validate new parent if provided
      let newParent: CollectionEntity | undefined;
      if (data.newParentId) {
        // Check if new parent exists and belongs to user
        newParent = await this.findOneByIdOrFail(data.newParentId);

        // Prevent moving to itself or its children
        if (data.newParentId === id) {
          throw Errors.Collection.CannotMoveToSelf;
        }

        const isDescendant = await this._isDescendant(id, data.newParentId);
        if (isDescendant) {
          throw Errors.Collection.CannotMoveToDescendant;
        }
      }

      // Update collection's parent
      collection.parent = newParent;

      // Regenerate path for this collection and all its children
      collection.generatePath();
      await this._updateChildrenPathsRecursively(collection, userId);

      // Update old parent's hasChild flag
      if (oldParent) {
        const siblings = await this.findChildren(oldParent.id);
        oldParent.isHasChild = siblings.length > 0;
      }

      // Update new parent's hasChild flag
      if (newParent) {
        newParent.isHasChild = true;
      }

      await this._unitOfWork.commit();
      return collection;
    } catch (error) {
      await this._unitOfWork.rollback();
      throw error;
    }
  }

  /**
   * Update sort order for multiple collections
   */
  async updateSortOrder(
    collectionIds: string[],
    userId: string,
  ): Promise<void> {
    // Validate all collections belong to user
    for (const collectionId of collectionIds) {
      await this.findOneByIdOrFail(collectionId);
    }

    await this._unitOfWork.collection.updateSortOrder(collectionIds, userId);
  }

  /**
   * Soft delete a collection and all its children
   */
  async delete(id: string, userId: string): Promise<void> {
    await this._unitOfWork.start();

    try {
      const collection = await this.findOneByIdOrFail(id);
      const parent = collection.parent;

      await this._unitOfWork.collection.softDeleteWithChildren(id, userId);

      // Update parent's hasChild flag if parent exists
      if (parent) {
        const siblings = await this.findChildren(parent.id);
        parent.isHasChild = siblings.length > 0;
      }

      await this._unitOfWork.commit();
    } catch (error) {
      await this._unitOfWork.rollback();
      throw error;
    }
  }

  /**
   * Restore a soft-deleted collection
   */
  async restore(id: string, userId: string): Promise<CollectionEntity> {
    await this._unitOfWork.start();

    try {
      const collection = await this._unitOfWork.collection.findOne({
        id,
        user: { id: userId },
        deleteFlag: true,
      });

      if (isNil(collection)) {
        throw Errors.Collection.NotFound;
      }

      collection.deleteFlag = false;
      collection.deletedAt = undefined;

      // Update parent's hasChild flag if parent exists
      if (collection.parent) {
        collection.parent.isHasChild = true;
      }

      await this._unitOfWork.commit();
      return collection;
    } catch (error) {
      await this._unitOfWork.rollback();
      throw error;
    }
  }

  /**
   * Permanently delete a collection
   */
  async permanentDelete(id: string, userId: string): Promise<void> {
    const collection = await this._unitOfWork.collection.findOne({
      id,
      user: { id: userId },
    });

    if (isNil(collection)) {
      throw Errors.Collection.NotFound;
    }

    await this._unitOfWork.collection.softDeleteWithChildren(id, userId);
  }

  /**
   * Save changes to database
   */
  async save(): Promise<void> {
    return this._unitOfWork.save();
  }

  /**
   * Check if a collection is descendant of another
   */
  private async _isDescendant(
    ancestorId: string,
    descendantId: string,
  ): Promise<boolean> {
    const descendant = await this.findOneById(descendantId);
    if (!descendant) {
      return false;
    }

    // Check if ancestor ID is in the descendant's path
    return descendant.path.includes(ancestorId);
  }

  /**
   * Update children paths recursively when parent changes
   */
  private async _updateChildrenPathsRecursively(
    parent: CollectionEntity,
    userId: string,
  ): Promise<void> {
    const children = await this.findChildren(parent.id);

    for (const child of children) {
      child.generatePath();

      // Recursively update children's children
      await this._updateChildrenPathsRecursively(child, userId);
    }
  }
}
