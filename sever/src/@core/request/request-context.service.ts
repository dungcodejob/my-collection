import {
  AccountEntity,
  SessionEntity,
  TenantEntity,
  UserEntity,
} from '@app/entities';
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

type RequestContext = {
  tenant?: TenantEntity;
  user?: UserEntity;
  session?: SessionEntity;
  account?: AccountEntity;
};

@Injectable()
export class RequestContextService {
  private readonly als = new AsyncLocalStorage<RequestContext>();

  constructor() {}

  run(context: RequestContext, callback: () => void) {
    const store = context;
    this.als.run(store, callback);
  }

  get tenant(): TenantEntity | undefined {
    return this.als.getStore()?.tenant;
  }

  get user(): UserEntity | undefined {
    return this.als.getStore()?.user;
  }

  get session(): SessionEntity | undefined {
    return this.als.getStore()?.session;
  }

  get account(): AccountEntity | undefined {
    return this.als.getStore()?.account;
  }
}
