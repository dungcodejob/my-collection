import { BookmarkEntity } from "@common/entities";
import { Errors } from "@common/errors";
import { UNIT_OF_WORK, UnitOfWork } from "@common/repositories";
import { Reference } from "@mikro-orm/core";
import { Inject } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { DeleteBookmarkCommand } from "./delete-bookmark.command";

@CommandHandler(DeleteBookmarkCommand)
export class DeleteBookmarkHandler implements ICommandHandler<DeleteBookmarkCommand> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork,
    private readonly eventPublisher: EventPublisher
  ) {}
  async execute(command: DeleteBookmarkCommand): Promise<void> {
    const entity = Reference.createFromPK(BookmarkEntity, command.id);

    if (!entity) {
      throw Errors.Bookmark.NotExist;
    }

    this._unitOfWork.bookmark.delete(entity);
    await this._unitOfWork.save();
  }
}
