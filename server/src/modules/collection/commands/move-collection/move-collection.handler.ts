import { Inject } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";

import { CollectionEntity } from "@common/entities";
import { Errors } from "@common/errors";
import { UNIT_OF_WORK, UnitOfWork } from "@common/repositories";
import { CollectionPositionService } from "@modules/collection/services";
import { MoveCollectionCommand } from "./move-collection.command";
@CommandHandler(MoveCollectionCommand)
export class MoveCollectionHandler implements ICommandHandler<MoveCollectionCommand> {
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly _unitOfWork: UnitOfWork,
    private readonly _eventPublisher: EventPublisher,
    private readonly _positionService: CollectionPositionService
  ) {}
  async execute(command: MoveCollectionCommand): Promise<CollectionEntity> {
    const collection = await this._unitOfWork.collection.findById(command.collectionId);

    if (!collection) {
      throw Errors.Collection.NotExist;
    }

    console.log(command);

    collection.position = this._positionService.generateBetweenPosition(
      command.prevPosition,
      command.nextPosition
    );
    await this._unitOfWork.save();

    return collection;
  }
}
