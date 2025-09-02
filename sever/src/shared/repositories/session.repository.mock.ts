import { createCompleteRepositoryMock } from './base-repository.mock';

export const mockSessionRepository = {
  ...createCompleteRepositoryMock(),
  findByRefreshToken: jest.fn(),
  findByUserId: jest.fn(),
  findActiveSessions: jest.fn(),
  expireSession: jest.fn(),
  expireAllUserSessions: jest.fn(),
};
