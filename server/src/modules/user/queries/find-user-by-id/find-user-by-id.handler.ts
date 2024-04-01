import { UserEntity } from "@common/entities";
import { Errors } from "@common/errors";
import { UNIT_OF_WORK, UnitOfWork } from "@common/repositories";
import { Inject } from "@nestjs/common";
import { EventPublisher, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindUserByIdQuery } from "./find-user-by-id.query";

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler implements IQueryHandler<FindUserByIdQuery> {
  constructor(
    private readonly eventPublisher: EventPublisher,
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork
  ) {}
  async execute(query: FindUserByIdQuery): Promise<UserEntity> {
    const user = await this._unitOfWork.user.findById(query.id);
    if (!user) {
      throw Errors.User.UserNotExist;
    }

    return user;
  }
}
