import { UserEntity } from '@common/entities';
import { UNIT_OF_WORK, UnitOfWork } from '@common/repositories';
import { Inject } from '@nestjs/common';
import { EventPublisher, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUserByUsernameQuery } from './find-user-by-username.query';

@QueryHandler(FindUserByUsernameQuery)
export class FindUserByUsernameHandler
  implements IQueryHandler<FindUserByUsernameQuery>
{
  constructor(
    private readonly eventPublisher: EventPublisher,
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork,
  ) {}
  async execute(query: FindUserByUsernameQuery): Promise<UserEntity> {
    return this._unitOfWork.user.findByUsername(query.username);
  }
}
