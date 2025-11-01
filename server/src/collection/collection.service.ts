import { CollectionEntity } from '@app/entities';
import { Errors } from '@app/errors';
import {
  FindCollectionOptions,
  FindOneCollectionOptions,
  UNIT_OF_WORK,
  type UnitOfWork,
} from '@app/repositories';
import { generateBaseSlug, isNil } from '@app/utils';
import { Inject, Injectable } from '@nestjs/common';
import { CollectionQueryDto } from './models';

export type CollectionCreateInput = {
  name: string;
  icon?: string;
  parentId?: string;
  description?: string;
  sortOrder?: number;
};

export type CollectionUpdateInput = {
  name: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
};

export type CollectionMoveInput = {
  newParentId?: string;
};

export type CollectionSearch = {
  search?: string;
  parentId?: string;
};

export type CollectionChildrenFilter = {
  parentId: string;
  keyword?: string;
};

// TODO Collection: using user from context
@Injectable()
export class CollectionService {
  constructor(@Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork) {}

  /**
   * Find collection by ID for a specific user and tenant
   */
  async findById(id: string, options?: FindOneCollectionOptions) {
    const collection = await this._unitOfWork.collection.findById(id, options);

    return collection;
  }

  /**
   * Find collection by ID or fail
   */
  async findByIdOrFail(
    id: string,
    options?: FindOneCollectionOptions,
  ): Promise<CollectionEntity> {
    const collection = await this.findById(id, options);

    if (isNil(collection)) {
      throw Errors.Collection.NotFound;
    }

    return collection;
  }

  /**
   * Find all collections for a user within a tenant
   */
  async findByUserId(
    query: CollectionQueryDto,
    options?: FindCollectionOptions,
  ) {
    const collection = await this._unitOfWork.collection.find(query, options);

    if (isNil(collection)) {
      throw Errors.Collection.NotFound;
    }

    return collection;
  }

  /**
   * Find root collections (collections without parent) for a tenant
   */
  // async findRootCollections(
  //   options?: PaginationOptions,
  // ): Promise<CollectionEntity[]> {
  //   return this._unitOfWork.collection.findRootCollections({
  //     offset: options?.offset,
  //     limit: options?.limit,
  //   });
  // }

  /**
   * Find collection tree structure for a tenant
   */
  // async findCollectionTree(maxDepth: number = 5): Promise<CollectionEntity[]> {
  //   return this._unitOfWork.collection.findCollectionTree(maxDepth);
  // }

  /**
   * Find children of a collection within a tenant
   */
  // async findChildren(
  //   filter: CollectionChildrenFilter,
  //   options?: PaginationOptions,
  // ): Promise<CollectionEntity[]> {
  //   let where = this.addTenantIdToQuery<CollectionEntity>({
  //     parent: filter.parentId,
  //     deleteFlag: false,
  //   });

  //   if (filter.keyword) {
  //     where = this.setConditionFilter<CollectionEntity>(where, {
  //       name: {
  //         $like: `%${filter.keyword}%`,
  //       },
  //     });
  //   }

  //   return this._unitOfWork.collection.findChildren(where, {
  //     offset: options?.offset,
  //     limit: options?.limit,
  //   });
  // }

  /**
   * Create a new collection
   */
  async create(data: CollectionCreateInput): Promise<CollectionEntity> {
    try {
      let parent: CollectionEntity | null = null;

      if (data.parentId) {
        parent = await this.findById(data.parentId);
      }

      let sortOrder = data.sortOrder;
      if (isNil(sortOrder)) {
        const latestOrder = await this._unitOfWork.collection.findLatestOrder(
          parent?.id,
        );
        sortOrder = latestOrder?.sortOrder || 0;
      }

      const collection = new CollectionEntity({
        name: data.name,
        icon: data.icon,
        description: data.description,
        sortOrder: sortOrder,
        parent: parent || undefined,
        slug: await this.generatePathSlug(data.name),
      });

      const createdCollection = this._unitOfWork.collection.create(collection);

      if (parent) {
        parent.updateHasChildFlag();
      }

      return createdCollection;
    } catch (error) {
      // Rollback transaction on error
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  /**
   * Update a collection
   */
  async update(
    id: string,
    data: CollectionUpdateInput,
  ): Promise<CollectionEntity> {
    try {
      const collection = await this.findByIdOrFail(id);

      collection.name = data.name;
      collection.icon = data.icon;
      collection.description = data.description;

      return collection;
    } catch (error) {
      // Rollback transaction on error
      console.error('Error updating collection:', error);
      throw error;
    }
  }

  /**
   * Save collection changes
   */
  async save(): Promise<void> {
    await this._unitOfWork.save();
  }

  /**
   * Move collection to new parent
   */
  // async move(
  //   id: string,
  //   data: CollectionMoveInput,
  //   userId: string,
  // ): Promise<CollectionEntity> {
  //   await this._unitOfWork.start();

  //   try {
  //     const collection = await this.findOneByIdOrFail(id);
  //     const oldParent = collection.parent;

  //     // Validate new parent if provided
  //     let newParent: CollectionEntity | undefined;
  //     if (data.newParentId) {
  //       // Check if new parent exists and belongs to user
  //       newParent = await this.findOneByIdOrFail(data.newParentId);

  //       // Prevent moving to itself or its children
  //       if (data.newParentId === id) {
  //         throw Errors.Collection.CannotMoveToSelf;
  //       }

  //       const isDescendant = await this._isDescendant(id, data.newParentId);
  //       if (isDescendant) {
  //         throw Errors.Collection.CannotMoveToDescendant;
  //       }
  //     }

  //     // Update collection's parent
  //     collection.parent = newParent;

  //     // Regenerate path for this collection and all its children
  //     collection.generatePath();
  //     await this._updateChildrenPathsRecursively(collection, userId);

  //     // Update old parent's hasChild flag
  //     if (oldParent) {
  //       const siblings = await this.findChildren(oldParent.id);
  //       oldParent.isHasChild = siblings.length > 0;
  //     }

  //     // Update new parent's hasChild flag
  //     if (newParent) {
  //       newParent.isHasChild = true;
  //     }

  //     await this._unitOfWork.commit();
  //     return collection;
  //   } catch (error) {
  //     await this._unitOfWork.rollback();
  //     throw error;
  //   }
  // }

  /**
   * Update sort order for multiple collections
   */
  // async updateSortOrder(
  //   collectionIds: string[],
  //   userId: string,
  // ): Promise<void> {
  //   // Validate all collections belong to user
  //   for (const collectionId of collectionIds) {
  //     await this.findOneByIdOrFail(collectionId);
  //   }

  //   await this._unitOfWork.collection.updateSortOrder(collectionIds, userId);
  // }

  /**
   * Soft delete a collection and all its children
   */
  // async delete(id: string, userId: string): Promise<void> {
  //   await this._unitOfWork.start();

  //   try {
  //     const collection = await this.findOneByIdOrFail(id);
  //     const parent = collection.parent;

  //     await this._unitOfWork.collection.softDeleteWithChildren(id, userId);

  //     // Update parent's hasChild flag if parent exists
  //     if (parent) {
  //       const siblings = await this.findChildren(parent.id);
  //       parent.isHasChild = siblings.length > 0;
  //     }

  //     await this._unitOfWork.commit();
  //   } catch (error) {
  //     await this._unitOfWork.rollback();
  //     throw error;
  //   }
  // }

  /**
   * Restore a soft-deleted collection
   */
  // async restore(id: string, userId: string): Promise<CollectionEntity> {
  //   await this._unitOfWork.start();

  //   try {
  //     const collection = await this._unitOfWork.collection.findOne({
  //       id,
  //       user: { id: userId },
  //       deleteFlag: true,
  //     });

  //     if (isNil(collection)) {
  //       throw Errors.Collection.NotFound;
  //     }

  //     collection.deleteFlag = false;
  //     collection.deletedAt = undefined;

  //     // Update parent's hasChild flag if parent exists
  //     if (collection.parent) {
  //       collection.parent.isHasChild = true;
  //     }

  //     await this._unitOfWork.commit();
  //     return collection;
  //   } catch (error) {
  //     await this._unitOfWork.rollback();
  //     throw error;
  //   }
  // }

  /**
   * Permanently delete a collection
   */
  // async permanentDelete(id: string, userId: string): Promise<void> {
  //   const collection = await this._unitOfWork.collection.findOne({
  //     id,
  //     user: { id: userId },
  //   });

  //   if (isNil(collection)) {
  //     throw Errors.Collection.NotFound;
  //   }

  //   await this._unitOfWork.collection.softDeleteWithChildren(id, userId);
  // }

  /**
   * Save changes to database
   */
  // async save(): Promise<void> {
  //   return this._unitOfWork.save();
  // }

  /**
   * Check if a collection is descendant of another
   */
  // private async _isDescendant(
  //   ancestorId: string,
  //   descendantId: string,
  // ): Promise<boolean> {
  //   const descendant = await this.findOneById(descendantId);
  //   if (!descendant) {
  //     return false;
  //   }

  //   // Check if ancestor ID is in the descendant's path
  //   return descendant.path.includes(ancestorId);
  // }

  /**
   * Update children paths recursively when parent changes
   */
  // private async _updateChildrenPathsRecursively(
  //   parent: CollectionEntity,
  //   userId: string,
  // ): Promise<void> {
  //   const children = await this.findChildren(parent.id);

  //   for (const child of children) {
  //     child.generatePath();

  //     // Recursively update children's children
  //     await this._updateChildrenPathsRecursively(child, userId);
  //   }
  // }

  async delete(id: string): Promise<void> {
    const collection = await this.findById(id);
    if (!collection) {
      throw Errors.Collection.NotFound;
    }

    const children = await this._unitOfWork.collection.findDescendants(
      collection.id,
    );

    for (const child of children) {
      await this._unitOfWork.collection.delete(child);
    }

    await this._unitOfWork.collection.delete(collection);
  }

  private async generatePathSlug(name: string): Promise<string> {
    const baseSlug = generateBaseSlug(name);
    let slug = baseSlug;
    let counter = 0;

    while (await this.isSlugTaken(slug)) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
    return slug;
  }

  private async isSlugTaken(slug: string): Promise<boolean> {
    const exists = await this._unitOfWork.collection.findBySlug(slug);
    return !!exists;
  }
}
