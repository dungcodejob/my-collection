import { BookmarkEntity } from "@common/entities";
import { UNIT_OF_WORK, UnitOfWork } from "@common/repositories";
import { Inject } from "@nestjs/common";
import { EventPublisher, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllBookmarkQuery } from "./get-all-bookmark.query";

@QueryHandler(GetAllBookmarkQuery)
export class GetAllBookHandler implements IQueryHandler<GetAllBookmarkQuery> {
  constructor(
    private readonly eventPublisher: EventPublisher,
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork
  ) {}
  async execute(query: GetAllBookmarkQuery): Promise<BookmarkEntity[]> {
    return this._unitOfWork.bookmark.findAll(query.userId, query.keyword, query.tagIds);
  }
}
