import { Inject } from "@nestjs/common";
import { EventPublisher, IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { BookmarkEntity } from "@common/entities";

import { UNIT_OF_WORK, UnitOfWork } from "@common/repositories";
import { GetBookmarkInCollectionQuery } from "./get-bookmark-in-collection.query";

@QueryHandler(GetBookmarkInCollectionQuery)
export class GetBookmarkInCollectionBookHandler
  implements IQueryHandler<GetBookmarkInCollectionQuery>
{
  constructor(
    private readonly eventPublisher: EventPublisher,
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork
  ) {}
  async execute(query: GetBookmarkInCollectionQuery): Promise<BookmarkEntity[]> {
    return this._unitOfWork.bookmark.findByCollectionId(
      query.collectionId,
      query.keyword,
      query.tagIds
    );
  }
}
