import { Global, Injectable, Module, Provider } from '@nestjs/common';

import {
  AccountEntity,
  CrawlEntity,
  SessionEntity,
  TenantEntity,
  UserEntity,
} from '@app/entities';
import { RequestContextService } from '@app/request';
import { EntityManager } from '@mikro-orm/postgresql';
import { AccountRepository } from './account.repository';
import { BookmarkTagRepository } from './bookmark-tag.repository';
import { BookmarkRepository } from './bookmark.repository';
import { CollectionTagRepository } from './collection-tag.repository';
import { CollectionRepository } from './collection.repository';
import { CrawlRepository } from './crawl.repository';
import { SessionRepository } from './session.repository';
import { TagRepository } from './tag.repository';
import { TenantRepository } from './tenant.repository';
import { UserRepository } from './user.repository';

export const UNIT_OF_WORK = Symbol('UnitOfWork');

export interface UnitOfWork {
  user: UserRepository;
  account: AccountRepository;
  session: SessionRepository;
  collection: CollectionRepository;
  collectionTag: CollectionTagRepository;
  crawl: CrawlRepository;
  bookmark: BookmarkRepository;
  tag: TagRepository;
  bookmarkTag: BookmarkTagRepository;
  tenant: TenantRepository;
  save(): Promise<void>;
  start(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  transaction<T>(callback: () => Promise<T>): Promise<T>;
  getEntityManager(): EntityManager;
}

@Injectable()
export class UnitOfWorkImpl implements UnitOfWork {
  private _user?: UserRepository;
  private _account?: AccountRepository;
  private _session?: SessionRepository;
  private _collection?: CollectionRepository;
  private _collectionTag?: CollectionTagRepository;
  private _crawl?: CrawlRepository;
  private _bookmark?: BookmarkRepository;
  private _tag?: TagRepository;
  private _bookmarkTag?: BookmarkTagRepository;
  private _tenant?: TenantRepository;

  constructor(
    private readonly _em: EntityManager,
    private readonly _ctx: RequestContextService,
  ) {
    this._em.addFilter('deleteFlag', { deleteFlag: false });
  }

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
      this._collection = new CollectionRepository(this._em, this._ctx);
    }
    return this._collection;
  }

  get collectionTag(): CollectionTagRepository {
    if (!this._collectionTag) {
      this._collectionTag = new CollectionTagRepository(this._em, this._ctx);
    }
    return this._collectionTag;
  }

  get crawl(): CrawlRepository {
    if (!this._crawl) {
      this._crawl = this._em.getRepository(CrawlEntity);
    }
    return this._crawl;
  }

  get bookmark(): BookmarkRepository {
    if (!this._bookmark) {
      this._bookmark = new BookmarkRepository(this._em, this._ctx);
    }
    return this._bookmark;
  }

  get tag(): TagRepository {
    if (!this._tag) {
      this._tag = new TagRepository(this._em, this._ctx);
    }
    return this._tag;
  }

  get bookmarkTag(): BookmarkTagRepository {
    if (!this._bookmarkTag) {
      this._bookmarkTag = new BookmarkTagRepository(this._em, this._ctx);
    }
    return this._bookmarkTag;
  }

  get tenant(): TenantRepository {
    if (!this._tenant) {
      this._tenant = this._em.getRepository(TenantEntity);
    }
    return this._tenant;
  }

  save(): Promise<void> {
    return this._em.flush();
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    await this.start();
    try {
      const result = await callback();
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
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
    // {
    //   provide: UNIT_OF_WORK,
    //   scope: Scope.REQUEST,
    //   inject: [EntityManager],
    //   useFactory: (em: EntityManager) => {
    //     // em.setFilterParams('tenant', {
    //     //   tenantId: tenantProvider.getTenantId(),
    //     // });
    //     return new UnitOfWorkImpl(em);
    //   },
    // },
    provideUnitOfWork(),
  ],
  exports: [UNIT_OF_WORK],
})
export class UnitOfWorkModule {}
