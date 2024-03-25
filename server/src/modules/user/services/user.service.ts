import { UserEntity } from '@common/entities';
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../commands';
import { CreateUserDto } from '../models';
import { FindUserByUsernameQuery } from '../queries';

@Injectable()
export class UserService {
  constructor(
    private readonly _commandBus: CommandBus,
    private readonly _queryBus: QueryBus,
  ) {}

  findByUsername(username: string): Promise<UserEntity> {
    return this._queryBus.execute(new FindUserByUsernameQuery(username));
  }

  create(dto: CreateUserDto): Promise<UserEntity> {
    return this._commandBus.execute(
      new CreateUserCommand(
        dto.firstName,
        dto.lastName,
        dto.username,
        dto.passwordHash,
        dto.email,
      ),
    );
  }
}
