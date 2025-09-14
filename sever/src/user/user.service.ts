import { UserEntity } from '@app/entities';
import { Errors } from '@app/errors';
import { UNIT_OF_WORK, type UnitOfWork } from '@app/repositories';
import { BcryptService } from '@app/services';
import { Inject, Injectable } from '@nestjs/common';

type UserCreateInput = ConstructorParameters<typeof UserEntity>[0];

@Injectable()
export class UserService {
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly _unitOfWork: UnitOfWork,
    private readonly _bcryptService: BcryptService,
  ) {}

  async findOneByAccountId(accountId: string) {
    return this._unitOfWork.user.findOne({
      accounts: {
        id: accountId,
      },
    });
  }

  create(data: UserCreateInput): UserEntity {
    if (!data) {
      throw Errors.User.InvalidData;
    }

    const user = new UserEntity(data);
    return this._unitOfWork.user.create(user);
  }

  save(): Promise<void> {
    return this._unitOfWork.save();
  }
}
