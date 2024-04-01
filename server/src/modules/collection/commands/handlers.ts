import { CreateCollectionHandler } from './create-collection/create-collection.handler';
import { DeleteCollectionHandler } from './delete-collection/delete-collection.handler';
import { UpdateCollectionHandler } from './update-collection/update-collection.handler';

export const CommandHandlers = [
  CreateCollectionHandler,
  UpdateCollectionHandler,
  DeleteCollectionHandler,
];
