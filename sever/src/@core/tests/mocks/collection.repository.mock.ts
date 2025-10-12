import { CollectionEntity } from '@app/entities';
import {
  BaseRepositoryFactory,
  MockRepository,
} from '../../database/factories';

export const createCollectionRepositoryMock =
  (): MockRepository<CollectionEntity> => {
    return new BaseRepositoryFactory<CollectionEntity>(CollectionEntity)
      .addCustomMethod('findByUserId', jest.fn())
      .addCustomMethod('findRootCollections', jest.fn())
      .addCustomMethod('findChildren', jest.fn())
      .addCustomMethod('findCollectionTree', jest.fn())
      .addCustomMethod('findByPathPattern', jest.fn())
      .addCustomMethod('findByName', jest.fn())
      .addCustomMethod('countByUser', jest.fn())
      .addCustomMethod('findWithPagination', jest.fn())
      .addCustomMethod('updateSortOrder', jest.fn())
      .addCustomMethod('softDeleteWithChildren', jest.fn())
      .addCustomMethod('moveToParent', jest.fn())
      .createMockRepository();
  };
