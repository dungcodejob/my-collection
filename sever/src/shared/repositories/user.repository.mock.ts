import { createCompleteRepositoryMock } from './base-repository.mock';

export const mockUserRepository = {
  ...createCompleteRepositoryMock(),
  // Add user-specific methods if any
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  findByEmailOrUsername: jest.fn(),
  findActiveUsers: jest.fn(),
};
