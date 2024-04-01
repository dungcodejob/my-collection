import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { CollectionEntity } from '@common/entities';
import { UNIT_OF_WORK, UnitOfWork } from '@common/repositories';
import { UpdateCollectionCommand } from './update-collection.command';
@CommandHandler(UpdateCollectionCommand)
export class UpdateCollectionHandler
  implements ICommandHandler<UpdateCollectionCommand>
{
  constructor(
    @Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork,
    private readonly eventPublisher: EventPublisher,
  ) {}
  async execute(command: UpdateCollectionCommand): Promise<CollectionEntity> {
    const collection = await this._unitOfWork.collection.findById(
      command.collectionId,
    );
    collection.title = command.title;
    await this._unitOfWork.save();

    return collection;
  }
}
