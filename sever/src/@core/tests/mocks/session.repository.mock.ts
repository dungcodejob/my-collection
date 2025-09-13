import { SessionEntity } from '@app/entities';
import {
  BaseRepositoryFactory,
  MockRepository,
} from '../../database/factories';

export const createSessionRepositoryMock =
  (): MockRepository<SessionEntity> => {
    return new BaseRepositoryFactory<SessionEntity>(SessionEntity)
      .addCustomMethod('findByRefreshToken', jest.fn())
      .addCustomMethod('findByUserId', jest.fn())
      .addCustomMethod('findActiveSessions', jest.fn())
      .addCustomMethod('expireSession', jest.fn())
      .addCustomMethod('expireAllUserSessions', jest.fn())
      .createMockRepository();
  };
