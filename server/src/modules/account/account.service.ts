import { AccountEntity } from '@app/entities';
import { Errors } from '@app/errors';
import { UNIT_OF_WORK, type UnitOfWork } from '@app/repositories';
import { isNil } from '@app/utils';
import { FilterQuery } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';

type AccountCreateInput = ConstructorParameters<typeof AccountEntity>[0];

@Injectable()
export class AccountService {
  constructor(@Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork) {}

  async findOneByCredentials(id: string, version: number) {
    const account = await this._unitOfWork.account.findOne(
      {
        id,
        version,
      },
      { populate: ['user'] },
    );

    if (isNil(account)) {
      throw Errors.Authentication.InvalidCredentials;
    }

    if (account.version !== version) {
      throw Errors.Authentication.InvalidCredentials;
    }

    return account;
  }

  async findOneById(id: string) {
    return this._unitOfWork.account.findOne(
      {
        id,
      },
      { populate: ['user'] },
    );
  }

  async findOneByUsername(username: string) {
    return this._unitOfWork.account.findOne(
      {
        username,
      },
      { populate: ['user'] },
    );
  }

  async findOneByEmail(email: string) {
    return this._unitOfWork.account.findOne(
      {
        email,
      },
      { populate: ['user'] },
    );
  }

  count(where: FilterQuery<AccountEntity>): Promise<number> {
    return this._unitOfWork.account.count(where);
  }

  create(data: AccountCreateInput): AccountEntity {
    const account = new AccountEntity(data);
    return this._unitOfWork.account.create(account);
  }

  save(): Promise<void> {
    return this._unitOfWork.save();
  }
}
