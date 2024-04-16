import { TagEntity } from "@common/entities";
import { IdentityType } from "@database/identifiable.entity";
import { EntityManager, FilterQuery } from "@mikro-orm/postgresql";

export interface TagRepository {
  create(entity: TagEntity): TagEntity;
  findByIds(ids: IdentityType[]): Promise<TagEntity[]>;
  findAll(userId: string, collectionId?: string): Promise<TagEntity[]>;
  findByCollectionId(collectionId: string): Promise<TagEntity[]>;
}

export class TagRepositoryImpl implements TagRepository {
  constructor(private readonly _em: EntityManager) {}
  findByCollectionId(collectionId: string): Promise<TagEntity[]> {
    return this._em.find(TagEntity, { collection: { id: collectionId } });
  }
  findAll(userId: string, collectionId?: string): Promise<TagEntity[]> {
    const sqlQuery: FilterQuery<TagEntity> = {
      $and: [{ collection: { user: { id: userId } } }],
    };

    if (collectionId) {
      sqlQuery.$and.push({ collection: { id: collectionId } });
    }

    return this._em.find(TagEntity, sqlQuery);
  }
  findByIds(ids: string[]): Promise<TagEntity[]> {
    return this._em.find(TagEntity, ids);
  }

  create(entity: TagEntity): TagEntity {
    this._em.persist(entity);
    return entity;
  }
}
