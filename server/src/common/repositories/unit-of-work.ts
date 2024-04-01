import { Inject, Injectable, Provider } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/postgresql';
import {
  CollectionRepository,
  CollectionRepositoryImpl,
} from './collection.repository';
import { UserRepository, UserRepositoryImpl } from './user.repository';

export const UNIT_OF_WORK = Symbol('UnitOfWork');

export interface UnitOfWork {
  user: UserRepository;
  collection: CollectionRepository;
  save(): Promise<void>;
}

@Injectable()
export class UnitOfWorkImpl implements UnitOfWork {
  @Inject()
  private readonly _em: EntityManager;
  private _user: UserRepository;
  private _collection: CollectionRepository;
  constructor() {}

  get user(): UserRepository {
    if (!this._user) {
      this._user = new UserRepositoryImpl(this._em);
    }

    return this._user;
  }

  get collection(): CollectionRepository {
    if (this._collection) {
      this._collection = new CollectionRepositoryImpl(this._em);
    }

    return this._collection;
  }

  save(): Promise<void> {
    return this._em.flush();
  }
}

export const provideUnitOfWork = (): Provider => ({
  provide: UNIT_OF_WORK,
  useClass: UnitOfWorkImpl,
});
