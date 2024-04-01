import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { UserEntity } from '@common/entities';
import { UNIT_OF_WORK, UnitOfWork } from '@common/repositories';
import { CreateUserCommand } from './create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork,
    private readonly eventPublisher: EventPublisher,
  ) {}
  async execute(command: CreateUserCommand): Promise<UserEntity> {
    const user = new UserEntity();
    user.firstName = command.firstName;
    user.lastName = command.lastName;
    user.username = command.username;
    user.passwordHash = command.passwordHash;
    user.email = command.email;

    this._unitOfWork.user.add(user);
    await this._unitOfWork.save();

    return user;
  }
}
