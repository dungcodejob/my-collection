import { Inject } from "@nestjs/common";
import { EventPublisher, IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { TagEntity } from "@common/entities";

import { UNIT_OF_WORK, UnitOfWork } from "@common/repositories";
import { GetAllTagQuery } from "./get-all-tag.query";

@QueryHandler(GetAllTagQuery)
export class GetAllTagHandler implements IQueryHandler<GetAllTagQuery> {
  constructor(
    private readonly eventPublisher: EventPublisher,
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork
  ) {}
  async execute(query: GetAllTagQuery): Promise<TagEntity[]> {
    return this._unitOfWork.tag.findAll(query.userId, query.collectionId);
  }
}
