import { CollectionEntity } from "@common/entities";
import { EntityManager } from "@mikro-orm/postgresql";

export interface CollectionRepository {
  getChangeNodes(value: number, treeId: string): Promise<CollectionEntity[]>;
  getDepthNodes(left: number, right: number, treeId: string): Promise<CollectionEntity[]>;
  findAll(userId: string): Promise<CollectionEntity[]>;
  findById(id: string): Promise<CollectionEntity>;
  add(entity: CollectionEntity): CollectionEntity;
  remove(entity: CollectionEntity | CollectionEntity[]): void;
}

export class CollectionRepositoryImpl implements CollectionRepository {
  constructor(private readonly _em: EntityManager) {}

  findAll(userId: string): Promise<CollectionEntity[]> {
    return this._em.find(
      CollectionEntity,
      {
        user: { id: userId },
        depth: 0,
      },
      { orderBy: { createAt: "DESC" } }
    );
  }

  getChangeNodes(value: number, treeId: string): Promise<CollectionEntity[]> {
    return this._em.find(CollectionEntity, {
      $or: [
        { $and: [{ left: { $gt: value } }, { treeId: treeId }] },
        { $and: [{ right: { $gt: value } }, { treeId: treeId }] },
      ],
    });
  }

  getDepthNodes(
    left: number,
    right: number,
    treeId: string
  ): Promise<CollectionEntity[]> {
    return this._em.find(CollectionEntity, {
      $and: [{ left: { $gt: left } }, { right: { $lt: right } }, { treeId: treeId }],
    });
  }

  findById(id: string): Promise<CollectionEntity> {
    return this._em.findOne(CollectionEntity, id);
  }

  add(entity: CollectionEntity): CollectionEntity {
    this._em.persist(entity);
    return entity;
  }

  remove(entity: CollectionEntity | CollectionEntity[]): void {
    this._em.remove(entity);
  }
}
