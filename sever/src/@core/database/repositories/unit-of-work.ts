import { Global, Inject, Injectable, Module, Provider } from '@nestjs/common';

import {
  AccountEntity,
  CollectionEntity,
  SessionEntity,
  UserEntity,
} from '@app/entities';
import { EntityManager } from '@mikro-orm/postgresql';
import { AccountRepository } from './account.repository';
import { CollectionRepository } from './collection.repository';
import { SessionRepository } from './session.repository';
import { UserRepository } from './user.repository';

export const UNIT_OF_WORK = Symbol('UnitOfWork');

export interface UnitOfWork {
  user: UserRepository;
  account: AccountRepository;
  session: SessionRepository;
  collection: CollectionRepository;
  save(): Promise<void>;
  start(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  getEntityManager(): EntityManager;
}

@Injectable()
export class UnitOfWorkImpl implements UnitOfWork {
  @Inject()
  private readonly _em: EntityManager;
  private _user?: UserRepository;
  private _account?: AccountRepository;
  private _session?: SessionRepository;
  private _collection?: CollectionRepository;

  constructor() {}
  getEntityManager(): EntityManager {
    return this._em;
  }

  get user(): UserRepository {
    if (!this._user) {
      this._user = this._em.getRepository(UserEntity);
    }

    return this._user;
  }

  get account(): AccountRepository {
    if (!this._account) {
      this._account = this._em.getRepository(AccountEntity);
    }

    return this._account;
  }

  get session(): SessionRepository {
    if (!this._session) {
      this._session = this._em.getRepository(SessionEntity);
    }

    return this._session;
  }

  get collection(): CollectionRepository {
    if (!this._collection) {
      this._collection = this._em.getRepository(CollectionEntity);
    }

    return this._collection;
  }

  save(): Promise<void> {
    return this._em.flush();
  }

  async start() {
    await this._em.begin();
  }

  async commit() {
    await this._em.flush();
    await this._em.commit();
  }

  async rollback() {
    await this._em.rollback();
  }
}

export const provideUnitOfWork = (): Provider => ({
  provide: UNIT_OF_WORK,
  useClass: UnitOfWorkImpl,
});

@Global()
@Module({
  providers: [
    {
      provide: UNIT_OF_WORK,
      useClass: UnitOfWorkImpl,
    },
  ],
  exports: [UNIT_OF_WORK],
})
export class UnitOfWorkModule {}
