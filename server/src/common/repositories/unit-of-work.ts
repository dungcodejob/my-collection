import { Inject, Injectable, Provider } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/postgresql";
import { BookmarkRepository, BookmarkRepositoryImpl } from "./bookmark.repository";
import { CollectionRepository, CollectionRepositoryImpl } from "./collection.repository";
import { UserRepository, UserRepositoryImpl } from "./user.repository";

export const UNIT_OF_WORK = Symbol("UnitOfWork");

export interface UnitOfWork {
  user: UserRepository;
  collection: CollectionRepository;
  bookmark: BookmarkRepository;
  save(): Promise<void>;
}

@Injectable()
export class UnitOfWorkImpl implements UnitOfWork {
  @Inject()
  private readonly _em: EntityManager;
  private _user?: UserRepository;
  private _collection?: CollectionRepository;
  private _bookmark?: BookmarkRepository;

  constructor() {}

  get user(): UserRepository {
    if (!this._user) {
      this._user = new UserRepositoryImpl(this._em);
    }

    return this._user;
  }

  get collection(): CollectionRepository {
    if (!this._collection) {
      this._collection = new CollectionRepositoryImpl(this._em);
    }

    return this._collection;
  }

  get bookmark(): BookmarkRepository {
    if (!this._bookmark) {
      this._bookmark = new BookmarkRepositoryImpl(this._em);
    }

    return this._bookmark;
  }

  save(): Promise<void> {
    return this._em.flush();
  }
}

export const provideUnitOfWork = (): Provider => ({
  provide: UNIT_OF_WORK,
  useClass: UnitOfWorkImpl,
});
