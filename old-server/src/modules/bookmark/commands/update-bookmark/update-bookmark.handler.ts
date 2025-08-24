import { Inject } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";

import { BookmarkEntity, CollectionEntity } from "@common/entities";
import { Errors } from "@common/errors";
import { UNIT_OF_WORK, UnitOfWork } from "@common/repositories";
import { Reference } from "@mikro-orm/core";
import { UpdateBookmarkCommand } from "./update-bookmark.command";

@CommandHandler(UpdateBookmarkCommand)
export class UpdateBookmarkHandler implements ICommandHandler<UpdateBookmarkCommand> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork,
    private readonly eventPublisher: EventPublisher
  ) {}
  async execute(command: UpdateBookmarkCommand): Promise<BookmarkEntity> {
    const tags = await this._unitOfWork.tag.findByIds(command.tagIds);
    const bookmark = await this._unitOfWork.bookmark.findById(command.id);

    if (!bookmark) {
      throw Errors.Bookmark.NotExist;
    }

    bookmark.title = command.title;
    bookmark.description = command.description;
    bookmark.image = command.image;
    bookmark.favicon = command.favicon;
    bookmark.note = command.note;
    bookmark.tags.set(tags);
    bookmark.collection = Reference.createFromPK(CollectionEntity, command.collectionId);
    await this._unitOfWork.save();

    return bookmark;
  }
}
