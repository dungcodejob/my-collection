import { COLLECTION_ROOT_PATH } from '@app/constants';
import { QueryDto } from '@app/models';
import {
  FindOneOptions,
  FindOptions,
  RequiredEntityData,
} from '@mikro-orm/core';
import { CollectionEntity } from '../entities/collection.entity';
import { BaseRepository } from './base.repository';

export type FindCollectionOptions = FindOptions<
  CollectionEntity,
  'parent' | 'children',
  '*',
  never
>;

export type FindOneCollectionOptions = FindOneOptions<
  CollectionEntity,
  'parent' | 'children',
  '*',
  never
>;

export type CollectionQuery = QueryDto & {
  path?: string;
};

export class CollectionRepository extends BaseRepository {
  async findAll(query: CollectionQuery, options?: FindCollectionOptions) {
    const { path } = query;
    let where = this.addUserIdAndTenantIdToQuery<CollectionEntity>({
      deleteFlag: false,
    });

    where = QueryDto.setConditionFilter(where, query?.filters);
    const newOptions = QueryDto.setConditionSort(options || {}, query?.sorts);

    if (path) {
      if (path === COLLECTION_ROOT_PATH) {
        where = this.setConditionFilter(where, {
          parent: null,
        });
      } else {
        where = this.setConditionFilter(where, {
          parent: {
            path,
          },
        });
      }
    }

    return this.em.find(CollectionEntity, where, {
      ...newOptions,
      orderBy: { sortOrder: 'ASC', createAt: 'ASC' },
    });
  }

  async findOneById(
    id: string,
    options?: FindOneCollectionOptions,
  ): Promise<CollectionEntity | null> {
    return this.findOne({ id }, options);
  }

  async findOneBySlug(
    slug: string,
    options?: FindOneCollectionOptions,
  ): Promise<CollectionEntity | null> {
    return this.findOne({ slug }, options);
  }

  async findOne(
    query: {
      id?: string;
      path?: string;
      slug?: string;
    },
    options?: FindOneCollectionOptions,
  ): Promise<CollectionEntity | null> {
    let where = this.addUserIdAndTenantIdToQuery<CollectionEntity>({
      deleteFlag: false,
    });

    if (query.id) {
      where = this.setConditionFilter(where, { id: query.id });
    }

    if (query.path) {
      where = this.setConditionFilter(where, { path: query.path });
    }

    if (query.slug) {
      where = this.setConditionFilter(where, { slug: query.slug });
    }

    return this.em.findOne(CollectionEntity, where, options);
  }

  // async findByUserId(
  //   query?: BaseCollectionQuery,
  //   options?: FindCollectionOptions,
  // ) {
  //   let where = this.addUserIdAndTenantIdToQuery<CollectionEntity>({
  //     deleteFlag: false,
  //   });

  //   if (query?.keyword) {
  //     where = this.setConditionFilter(where, {
  //       name: { $like: `%${query.keyword}%` },
  //     });
  //   }

  //   return this.em.find(CollectionEntity, where, {
  //     ...options,
  //     orderBy: { sortOrder: 'ASC', createAt: 'ASC' },
  //   });
  // }

  async findLatestOrder(parentId?: string): Promise<CollectionEntity | null> {
    return this.em.findOne(
      CollectionEntity,
      this.addUserIdAndTenantIdToQuery<CollectionEntity>({
        deleteFlag: false,
        parent: parentId,
      }),
      {
        orderBy: { sortOrder: 'DESC' },
      },
    );
  }

  // async findByParentId(
  //   query: ParentCollectionQuery,
  //   options?: FindCollectionOptions,
  // ) {
  //   let where = this.addUserIdAndTenantIdToQuery<CollectionEntity>({
  //     deleteFlag: false,
  //   });

  //   if (query?.keyword) {
  //     where = this.setConditionFilter(where, {
  //       name: { $like: `%${query.keyword}%` },
  //     });
  //   }

  //   return this.em.find(CollectionEntity, where, {
  //     ...options,
  //     orderBy: { sortOrder: 'ASC', createAt: 'ASC' },
  //   });
  // }

  async findDescendants(
    rootId: string,
    options?: FindCollectionOptions,
  ): Promise<CollectionEntity[]> {
    const root = await this.em.findOneOrFail(CollectionEntity, {
      id: rootId,
    });

    const where = this.addUserIdAndTenantIdToQuery<CollectionEntity>({
      parent: rootId,
      path: { $like: `${root.path}%` },
      deleteFlag: false,
    });

    return this.em.find(CollectionEntity, where, {
      ...options,
      orderBy: { sortOrder: 'ASC', createAt: 'ASC' },
    });
  }

  async create(
    data: RequiredEntityData<CollectionEntity>,
  ): Promise<CollectionEntity> {
    const collection = this.em.create(
      CollectionEntity,
      this.addUserAndTenantToEntity(data),
    );
    collection.generatePath();

    if (collection.parent) {
      collection.updateHasChildFlag();
    }

    return collection;
  }

  async delete(collection: CollectionEntity): Promise<void> {
    collection.deleteFlag = true;
    collection.deletedAt = new Date();
  }

  async deleteById(collectionId: string): Promise<void> {
    const collection = await this.em.findOneOrFail(CollectionEntity, {
      id: collectionId,
    });

    await this.delete(collection);
  }

  /**
   * Find root collections (collections without parent) for a user
   */
  // async findRootCollections(
  //   options?: FindCollectionOptions,
  // ): Promise<CollectionEntity[]> {
  //   return this.find(
  //     {
  //       parent: null,
  //       deleteFlag: false,
  //     },
  //     {
  //       orderBy: { sortOrder: 'ASC', createAt: 'ASC' },
  //       ...options,
  //     },
  //   );
  // }

  /**
   * Find collection tree structure for a user
   */
  // async findCollectionTree(maxDepth: number = 5): Promise<CollectionEntity[]> {
  //   const rootCollections = await this.findRootCollections({
  //     populate: ['children'],
  //   });

  //   // Recursively populate children up to maxDepth
  //   for (const root of rootCollections) {
  //     await this.populateChildrenRecursively(root, maxDepth - 1);
  //   }

  //   return rootCollections;
  // }

  /**
   * Recursively populate children for a collection
   */
  // private async populateChildrenRecursively(
  //   collection: CollectionEntity,
  //   remainingDepth: number,
  // ): Promise<void> {
  //   if (remainingDepth <= 0) return;

  //   const children = await this.findChildren(collection.id);
  //   collection.children.set(children);
  //   collection.updateHasChildFlag();

  //   // Recursively populate children's children
  //   for (const child of children) {
  //     await this.populateChildrenRecursively(child, remainingDepth - 1);
  //   }
  // }

  /**
   * Update sort order for collections
   */
  async updateSortOrder(
    collectionIds: string[],
    userId: string,
  ): Promise<void> {
    for (let i = 0; i < collectionIds.length; i++) {
      await this.em.nativeUpdate(
        CollectionEntity,
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
   * Move collection to new parent
   */
  // async moveToParent(
  //   collectionId: string,
  //   newParentId: string | null,
  // ): Promise<void> {
  //   const collection = await this.em.findOneOrFail(CollectionEntity, {
  //     id: collectionId,
  //   });

  //   let parent: CollectionEntity | undefined = undefined;
  //   if (newParentId) {
  //     parent = await this.em.findOneOrFail(CollectionEntity, {
  //       id: newParentId,
  //     });
  //   }

  //   collection.parent = parent;
  //   collection.generatePath();

  //   // Update all children paths recursively
  //   await this.updateChildrenPaths(collection);
  // }

  /**
   * Update paths for all children recursively
   */
  // private async updateChildrenPaths(parent: CollectionEntity): Promise<void> {
  //   const children = await this.findDescendants(parent.id);

  //   for (const child of children) {
  //     child.parent = parent;
  //     child.generatePath();
  //     await this.em.persistAndFlush(child);

  //     // Recursively update children's children
  //     await this.updateChildrenPaths(child);
  //   }
  // }
}
