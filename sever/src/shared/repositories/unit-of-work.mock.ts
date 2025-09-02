import { Provider } from '@nestjs/common';
import { mockAccountRepository } from './account.repository.mock';
import { mockSessionRepository } from './session.repository.mock';
import { UNIT_OF_WORK } from './unit-of-work';
import { mockUserRepository } from './user.repository.mock';

export const mockUnitOfWork = {
  user: mockUserRepository,
  account: mockAccountRepository,
  session: mockSessionRepository,

  // Transaction methods
  save: jest.fn(),
  start: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),

  // EntityManager
  getEntityManager: jest.fn(),
};

export const provideMockUnitOfWork = (): Provider[] => [
  {
    provide: UNIT_OF_WORK,
    useValue: mockUnitOfWork,
  },
];
