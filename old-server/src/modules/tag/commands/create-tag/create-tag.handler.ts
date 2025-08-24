import { Reference } from "@mikro-orm/core";
import { Inject } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";

import { CollectionEntity, TagEntity } from "@common/entities";

import { UNIT_OF_WORK, UnitOfWork } from "@common/repositories";
import { CreateTagCommand } from "./create-tag.command";

@CommandHandler(CreateTagCommand)
export class CreateTagHandler implements ICommandHandler<CreateTagCommand> {
  constructor(
    private readonly eventPublisher: EventPublisher,
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork
  ) {}
  async execute(command: CreateTagCommand): Promise<TagEntity> {
    const tag = new TagEntity();
    tag.title = command.title;
    tag.collection = Reference.createFromPK(CollectionEntity, command.collectionId);
    this._unitOfWork.tag.create(tag);
    await this._unitOfWork.save();
    return tag;
  }
}
