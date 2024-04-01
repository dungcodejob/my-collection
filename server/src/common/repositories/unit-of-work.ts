import { Inject, Injectable, Provider } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/postgresql';
import { UserRepository, UserRepositoryImpl } from './user.repository';

export const UNIT_OF_WORK = Symbol('UnitOfWork');

export interface UnitOfWork {
  user: UserRepository;
  save(): Promise<void>;
}

@Injectable()
export class UnitOfWorkImpl implements UnitOfWork {
  @Inject()
  private readonly _em: EntityManager;
  private readonly _user: UserRepository;
  constructor() {}

  get user(): UserRepository {
    if (this._user) {
      return this._user;
    }

    return new UserRepositoryImpl(this._em);
  }

  save(): Promise<void> {
    return this._em.flush();
  }
}

export const provideUnitOfWork = (): Provider => ({
  provide: UNIT_OF_WORK,
  useClass: UnitOfWorkImpl,
});
