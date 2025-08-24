import { Inject } from "@nestjs/common";
import { EventPublisher, IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { CollectionEntity } from "@common/entities";

import { UNIT_OF_WORK, UnitOfWork } from "@common/repositories";
import { GetAllCollectionQuery } from "./get-all-collection.query";

@QueryHandler(GetAllCollectionQuery)
export class GetAllCollectionHandler implements IQueryHandler<GetAllCollectionQuery> {
  constructor(
    private readonly eventPublisher: EventPublisher,
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork
  ) {}
  async execute(query: GetAllCollectionQuery): Promise<CollectionEntity[]> {
    return this._unitOfWork.collection.findAll(query.userId);
  }
}
