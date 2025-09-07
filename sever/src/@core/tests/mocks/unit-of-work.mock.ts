import { Provider } from '@nestjs/common';

import { UNIT_OF_WORK } from '@app/repositories';
import { createAccountRepositoryMock } from './account.repository.mock';
import { createSessionRepositoryMock } from './session.repository.mock';
import { createUserRepositoryMock } from './user.repository.mock';

export const mockUnitOfWork = {
  user: createUserRepositoryMock(),
  account: createAccountRepositoryMock(),
  session: createSessionRepositoryMock(),

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
