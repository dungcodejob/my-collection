import { BookmarkEntity } from "@common/entities";
import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

import {
  CreateBookmarkCommand,
  DeleteBookmarkCommand,
  UpdateBookmarkCommand,
} from "../commands";
import { BookmarkFilterDto, CreateBookmarkBodyDto } from "../models";
import { UpdateBookmarkBodyDto } from "../models/update-bookmark-body.dto";
import { GetAllBookmarkQuery, GetBookmarkInCollectionQuery } from "../queries";

@Injectable()
export class BookmarkService {
  constructor(
    private readonly _commandBus: CommandBus,
    private readonly _queryBus: QueryBus
  ) {}

  async findAll(userId: string, dto?: BookmarkFilterDto): Promise<BookmarkEntity[]> {
    return this._queryBus.execute(new GetAllBookmarkQuery(userId));
  }

  async findByCollectionId(
    collectionId: string,
    dto?: BookmarkFilterDto
  ): Promise<BookmarkEntity[]> {
    return this._queryBus.execute(new GetBookmarkInCollectionQuery(collectionId));
  }

  async create(dto: CreateBookmarkBodyDto): Promise<BookmarkEntity> {
    const command = new CreateBookmarkCommand(
      dto.url,
      dto.domain,
      dto.title,
      dto.image,
      dto.description,
      dto.favicon,
      dto.note,
      dto.collectionId
      // dto.tagIds
    );

    return this._commandBus.execute(command);
  }

  async update(id: string, dto: UpdateBookmarkBodyDto): Promise<BookmarkEntity> {
    const command = new UpdateBookmarkCommand(
      id,
      dto.title,
      dto.image,
      dto.description,
      dto.favicon,
      dto.note,
      dto.collectionId
      // dto.tagIds
    );

    return this._commandBus.execute(command);
  }

  async delete(id: string): Promise<void> {
    return this._commandBus.execute(new DeleteBookmarkCommand(id));
  }
}
