import {
  AccountEntity,
  SessionEntity,
  TenantEntity,
  UserEntity,
} from '@app/entities';
import { Errors } from '@app/errors';
import { UNIT_OF_WORK, type UnitOfWork } from '@app/repositories';
import { Inject, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private _tenant?: TenantEntity;
  private _user?: UserEntity;
  private _session?: SessionEntity;
  private _account?: AccountEntity;

  constructor(@Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork) {}

  setSession(session: SessionEntity) {
    this._session = session;
  }

  setUser(user: UserEntity) {
    this._user = user;
  }

  setTenant(tenant?: TenantEntity) {
    this._tenant = tenant;
    this._unitOfWork.setFilterParams('tenant', {
      tenantId: tenant?.id,
    });
    // this._unitOfWork.getEntityManager().addFilter('tenant', {
    //   tenantId: tenant.id,
    // });
  }

  setAccount(account: AccountEntity) {
    this._account = account;
  }

  get tenant(): TenantEntity {
    if (!this._tenant) {
      throw Errors.Authentication.Unauthorized;
    }

    return this._tenant;
  }

  get user(): UserEntity {
    if (!this._user) {
      throw Errors.Authentication.Unauthorized;
    }

    return this._user;
  }

  get session(): SessionEntity {
    if (!this._session) {
      throw Errors.Authentication.Unauthorized;
    }

    return this._session;
  }

  get account(): AccountEntity {
    if (!this._account) {
      throw Errors.Authentication.Unauthorized;
    }

    return this._account;
  }
}
