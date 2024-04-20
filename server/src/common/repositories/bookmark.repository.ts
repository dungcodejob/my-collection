import { BookmarkEntity } from "@common/entities";
import { EntityManager, FilterQuery, Ref } from "@mikro-orm/postgresql";

export interface BookmarkRepository {
  findAll(userId: string, tagIds: string[]): Promise<BookmarkEntity[]>;
  findById(id: string): Promise<BookmarkEntity>;
  findByCollectionId(collectionId: string, tagIds: string[]): Promise<BookmarkEntity[]>;
  add(entity: BookmarkEntity): BookmarkEntity;
  delete(entity: BookmarkEntity | Ref<BookmarkEntity>): void;
}

export class BookmarkRepositoryImpl implements BookmarkRepository {
  constructor(private readonly _em: EntityManager) {}

  findById(id: string): Promise<BookmarkEntity> {
    return this._em.findOne(BookmarkEntity, id);
  }

  findByCollectionId(collectionId: string, tagIds: string[]): Promise<BookmarkEntity[]> {
    const filter: FilterQuery<BookmarkEntity> = {};

    if (collectionId) {
      filter.collection = { id: collectionId };
    }

    if (tagIds && tagIds.length > 0) {
      filter.tags = tagIds;
    }

    return this._em.find(BookmarkEntity, filter, {
      populate: ["tags"],
    });
  }

  async findAll(userId: string, tagIds: string[] = []): Promise<BookmarkEntity[]> {
    const filter: FilterQuery<BookmarkEntity> = {
      collection: { user: { id: userId } },
    };

    // if (tagIds.length > 0) {
    //   filter.tags = tagIds;
    // }

    return this._em.find(BookmarkEntity, filter, {
      // populate: ["tags"],
      // groupBy: 'id',
      // having: { 'count(b1.tag_entity_id)': { $gte: tagIds.length } },
    });
  }
  add(entity: BookmarkEntity): BookmarkEntity {
    this._em.persist(entity);
    return entity;
  }

  delete(entity: BookmarkEntity | Ref<BookmarkEntity>): void {
    this._em.remove(entity);
  }
  // findById(id: IdentityType): Promise<BookmarkEntity> {
  //   return this._em.findOne(BookmarkEntity, id);
  // }
}
