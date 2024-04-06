import { Inject } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";

import { CollectionEntity, UserEntity } from "@common/entities";
import { UNIT_OF_WORK, UnitOfWork } from "@common/repositories";
import { Reference } from "@mikro-orm/core";
import { CollectionPositionService } from "@modules/collection/services";
import { v4 } from "uuid";
import { CreateCollectionCommand } from "./create-collection.command";
@CommandHandler(CreateCollectionCommand)
export class CreateCollectionHandler implements ICommandHandler<CreateCollectionCommand> {
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly _unitOfWork: UnitOfWork,
    private readonly _eventPublisher: EventPublisher,
    private readonly _positionService: CollectionPositionService
  ) {}
  async execute(command: CreateCollectionCommand): Promise<CollectionEntity> {
    // update all of the right values of the nodes where the right is bigger than the parent’s left  by 2
    // update all of the left values of the nodes where the left is bigger than the parent’s left  by 2
    // the new node left value will be the parent’s left + 1
    // the new node right value will be the parent’s right + 2

    const collection = new CollectionEntity();
    collection.title = command.title;
    collection.user = Reference.createFromPK(UserEntity, command.userId);
    collection.left = 1;
    collection.right = 2;
    collection.depth = 0;
    collection.treeId = v4();

    const hightestCollection =
      await this._unitOfWork.collection.getPositionHighestInLevel(0);

    if (command.parentId) {
      const parent = await this._unitOfWork.collection.findById(command.parentId);
      collection.left = parent.left + 1;
      collection.right = parent.left + 2;
      collection.depth = parent.depth + 1;
      collection.treeId = parent.treeId;
      collection.parent = Reference.create(parent);

      const leftNodes = await this._unitOfWork.collection.getChangeNodes(
        parent.left,
        parent.treeId
      );

      leftNodes.forEach(node => {
        if (node.right > parent.left) {
          node.right += 2;
        }

        if (node.left > parent.left) {
          node.left += 2;
        }
      });
    }

    const nextPosition = hightestCollection ? hightestCollection.position : "";
    collection.position = this._positionService.generateBetweenPosition("", nextPosition);

    this._unitOfWork.collection.add(collection);
    await this._unitOfWork.save();

    return collection;
  }
}
