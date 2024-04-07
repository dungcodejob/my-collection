import { BookmarkEntity, CollectionEntity } from "@common/entities";
import { UNIT_OF_WORK, UnitOfWork } from "@common/repositories";
import { Reference } from "@mikro-orm/postgresql";
import { Inject } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { CreateBookmarkCommand } from "./create-bookmark.command";

@CommandHandler(CreateBookmarkCommand)
export class CreateBookmarkHandler implements ICommandHandler<CreateBookmarkCommand> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork,
    private readonly eventPublisher: EventPublisher
  ) {}
  async execute(command: CreateBookmarkCommand): Promise<BookmarkEntity> {
    // const tags = await this._unitOfWork.tag.findByIds(command.tagIds);
    const bookmark = new BookmarkEntity();
    bookmark.url = command.url;
    bookmark.title = command.title;
    bookmark.description = command.description;
    bookmark.image = command.image;
    bookmark.domain = command.domain;
    bookmark.favicon = command.favicon;
    bookmark.note = command.note;
    // bookmark.tags.set(tags);
    bookmark.collection = Reference.createFromPK(CollectionEntity, command.collectionId);

    this._unitOfWork.bookmark.add(bookmark);
    await this._unitOfWork.save();

    return bookmark;
  }
}
