import { UserEntity } from '@app/entities';
import {
  BaseRepositoryFactory,
  MockRepository,
} from '../../database/factories';

export const createUserRepositoryMock = (): MockRepository<UserEntity> => {
  return new BaseRepositoryFactory<UserEntity>(UserEntity)
    .addCustomMethod('findByEmail', jest.fn())
    .addCustomMethod('findByUsername', jest.fn())
    .addCustomMethod('findByEmailOrUsername', jest.fn())
    .addCustomMethod('findActiveUsers', jest.fn())
    .createMockRepository();
};
