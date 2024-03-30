import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { UserEntity } from '@common/entities';
import { Errors } from '@common/errors';
import { UNIT_OF_WORK, UnitOfWork } from '@common/repositories';
import { UpdateRefreshTokenCommand } from './update-refresh-token.command';

@CommandHandler(UpdateRefreshTokenCommand)
export class UpdateRefreshTokenHandler
  implements ICommandHandler<UpdateRefreshTokenCommand>
{
  constructor(
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork,
    private readonly _eventPublisher: EventPublisher,
  ) {}
  async execute(command: UpdateRefreshTokenCommand): Promise<UserEntity> {
    const user = await this._unitOfWork.user.findById(command.userId);

    if (!user) {
      throw Errors.User.UserNotExist;
    }

    user.refreshToken = command.refreshTokenHash;
    await this._unitOfWork.save();
    return user;
  }
}
