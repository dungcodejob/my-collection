import { AccountEntity } from '@app/entities';
import { BaseRepositoryFactory } from '../../database/factories';

export const createAccountRepositoryMock = () => {
  return new BaseRepositoryFactory<AccountEntity>(AccountEntity)
    .addCustomMethod('validatePassword', jest.fn())
    .addCustomMethod('updatePassword', jest.fn())
    .createMockRepository();
};
