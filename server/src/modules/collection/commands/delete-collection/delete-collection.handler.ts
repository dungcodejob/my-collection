import { Inject } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";

import { Errors } from "@common/errors";
import { UNIT_OF_WORK, UnitOfWork } from "@common/repositories";
import { DeleteCollectionCommand } from "./delete-collection.command";
@CommandHandler(DeleteCollectionCommand)
export class DeleteCollectionHandler implements ICommandHandler<DeleteCollectionCommand> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork,
    private readonly eventPublisher: EventPublisher
  ) {}
  async execute(command: DeleteCollectionCommand): Promise<void> {
    const entity = await this._unitOfWork.collection.findById(command.collectionId);

    if (!entity) {
      throw Errors.Collection.NotExist;
    }

    const depthNodes = await this._unitOfWork.collection.getDepthNodes(
      entity.left,
      entity.right,
      entity.treeId
    );

    this._unitOfWork.collection.remove(entity);
    this._unitOfWork.collection.remove(depthNodes);

    const width = entity.right - entity.left + 1;
    const changeNodes = await this._unitOfWork.collection.getChangeNodes(
      entity.right,
      entity.treeId
    );

    for (const node of changeNodes) {
      if (node.right > entity.right) {
        node.right = node.right - width;
      }
      if (node.left > entity.right) {
        node.left = node.left - width;
      }
    }

    await this._unitOfWork.save();
  }
}
