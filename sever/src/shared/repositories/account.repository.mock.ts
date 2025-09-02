import { createCompleteRepositoryMock } from './base-repository.mock';

export const mockAccountRepository = {
  ...createCompleteRepositoryMock(),
  findOneByUserId: jest.fn(),
  validatePassword: jest.fn(),
  updatePassword: jest.fn(),
};
