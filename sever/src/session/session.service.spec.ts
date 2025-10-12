import { SessionEntity } from '@app/entities';
import { UNIT_OF_WORK } from '@app/repositories';
import {
  createActiveSession,
  createMockAccount,
  createMockSession,
  createMockSessionByInput,
  createMockSessionInput,
  createMockUser,
  createTestingModule,
  mockUnitOfWork,
} from '@app/tests';
import * as crypto from 'crypto';
import { SessionCreateInput, SessionService } from './session.service';

// Mock crypto module
jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked-device-id'),
  }),
}));

const mockCrypto = crypto as jest.Mocked<typeof crypto>;

describe('SessionService', () => {
  let service: SessionService;
  let unitOfWork: typeof mockUnitOfWork;

  beforeEach(async () => {
    const module = await createTestingModule({
      providers: [SessionService],
    });

    service = module.get<SessionService>(SessionService);
    unitOfWork = module.get(UNIT_OF_WORK);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserSessions', () => {
    it('should get active sessions for user', async () => {
      // Arrange
      const userId = 'user-123';
      const mockSessions = [
        createActiveSession({
          id: 'session-1',
          account: { user: { id: userId } } as any,
        }),
        createActiveSession({
          id: 'session-2',
          account: { user: { id: userId } } as any,
        }),
      ];

      unitOfWork.session.find.mockResolvedValue(mockSessions);

      // Act
      const result = await service.getUserSessions(userId);

      // Assert
      expect(result).toEqual(mockSessions);
      expect(unitOfWork.session.find).toHaveBeenCalledWith({
        account: {
          user: {
            id: userId,
          },
        },
        deleteFlag: false,
        isActive: true,
        expiresAt: {
          $gt: expect.any(Date),
        },
      });
      expect(unitOfWork.session.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no active sessions found', async () => {
      // Arrange
      const userId = 'user-without-sessions';
      unitOfWork.session.find.mockResolvedValue([]);

      // Act
      const result = await service.getUserSessions(userId);

      // Assert
      expect(result).toEqual([]);
      expect(unitOfWork.session.find).toHaveBeenCalledWith({
        account: {
          user: {
            id: userId,
          },
        },
        deleteFlag: false,
        isActive: true,
        expiresAt: {
          $gt: expect.any(Date),
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const userId = 'user-123';
      const dbError = new Error('Database connection failed');
      unitOfWork.session.find.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.getUserSessions(userId)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findOneById', () => {
    it('should find session by id successfully', async () => {
      // Arrange
      const sessionId = 'session-123';
      const mockSession = createMockSession({
        id: sessionId,
        account: { user: { id: 'user-123' } } as any,
        isActive: true,
      });

      unitOfWork.session.findOne.mockResolvedValue(mockSession);

      // Act
      const result = await service.findOneById(sessionId);

      // Assert
      expect(result).toEqual(mockSession);
      expect(unitOfWork.session.findOne).toHaveBeenCalledWith(
        { id: sessionId },
        undefined,
      );
      expect(unitOfWork.session.findOne).toHaveBeenCalledTimes(1);
    });

    it('should find session by id with options', async () => {
      // Arrange
      const sessionId = 'session-123';
      const options = { populate: ['account'] };
      const mockSession = createMockSession({
        id: sessionId,
        account: { user: { id: 'user-123' } } as any,
        isActive: true,
      });

      unitOfWork.session.findOne.mockResolvedValue(mockSession);

      // Act
      const result = await service.findOneById(sessionId, options);

      // Assert
      expect(result).toEqual(mockSession);
      expect(unitOfWork.session.findOne).toHaveBeenCalledWith(
        { id: sessionId },
        options,
      );
    });

    it('should return null when session not found', async () => {
      // Arrange
      const sessionId = 'non-existent-session';
      unitOfWork.session.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findOneById(sessionId);

      // Assert
      expect(result).toBeNull();
      expect(unitOfWork.session.findOne).toHaveBeenCalledWith(
        { id: sessionId },
        undefined,
      );
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const sessionId = 'session-123';
      const dbError = new Error('Database query failed');
      unitOfWork.session.findOne.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.findOneById(sessionId)).rejects.toThrow(
        'Database query failed',
      );
    });
  });

  describe('create', () => {
    it('should create session successfully with all required fields', async () => {
      // Arrange
      const expiresAt = new Date(Date.now() + 3600000);
      const sessionInput = createMockSessionInput({
        account: { id: 'account-123' } as any,
        refreshTokenHash: 'refresh-token-123',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ipAddress: '192.168.1.1',
        expiresAt: expiresAt,
      });

      const expectedSession = createMockSessionByInput({
        ...sessionInput,
        lastAccessedAt: expiresAt,
      });

      unitOfWork.session.create.mockReturnValue(expectedSession);

      // Act
      const result = await service.create(sessionInput);

      // Assert
      expect(result).toEqual(expectedSession);
      expect(unitOfWork.session.create).toHaveBeenCalledWith(expectedSession);
      expect(unitOfWork.session.create).toHaveBeenCalledTimes(1);

      // Verify crypto was called correctly
      expect(mockCrypto.createHash).toHaveBeenCalledWith('md5');
    });

    it('should create unique device id based on user agent and ip', async () => {
      // Arrange
      const sessionInput = createMockSessionInput({
        account: { id: 'account-123' } as any,
        refreshTokenHash: 'refresh-token-123',
        userAgent: 'Chrome/91.0',
        ipAddress: '10.0.0.1',
        expiresAt: new Date(Date.now() + 3600000),
      });

      unitOfWork.session.create.mockReturnValue({} as SessionEntity);

      // Act
      await service.create(sessionInput);

      // Assert
      const hashMock = mockCrypto.createHash('md5');
      expect(hashMock.update).toHaveBeenCalledWith('Chrome/91.010.0.0.1');
      expect(hashMock.digest).toHaveBeenCalledWith('hex');
    });

    it('should handle repository create errors', async () => {
      // Arrange
      const sessionInput = createMockSessionInput({
        account: { id: 'account-123' } as any,
        refreshTokenHash: 'refresh-token-123',
        expiresAt: new Date(Date.now() + 3600000),
      });

      const createError = new Error('Failed to create session');
      unitOfWork.session.create.mockImplementation(() => {
        throw createError;
      });

      // Act & Assert
      await expect(service.create(sessionInput)).rejects.toThrow(
        'Failed to create session',
      );
    });
  });

  describe('save', () => {
    it('should save successfully', async () => {
      // Arrange
      unitOfWork.save.mockResolvedValue(undefined);

      // Act
      const result = await service.save();

      // Assert
      expect(result).toBeUndefined();
      expect(unitOfWork.save).toHaveBeenCalledTimes(1);
      expect(unitOfWork.save).toHaveBeenCalledWith();
    });

    it('should handle save errors', async () => {
      // Arrange
      const saveError = new Error('Failed to save to database');
      unitOfWork.save.mockRejectedValue(saveError);

      // Act & Assert
      await expect(service.save()).rejects.toThrow(
        'Failed to save to database',
      );
      expect(unitOfWork.save).toHaveBeenCalledTimes(1);
    });

    it('should handle database constraint violations', async () => {
      // Arrange
      const constraintError = new Error(
        'UNIQUE constraint failed: sessions.refresh_token',
      );
      unitOfWork.save.mockRejectedValue(constraintError);

      // Act & Assert
      await expect(service.save()).rejects.toThrow(
        'UNIQUE constraint failed: sessions.refresh_token',
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should create and save session in sequence', async () => {
      // Arrange
      const account = createMockAccount({ id: 'account-123' });
      const user = createMockUser({ id: 'user-123' });
      const sessionInput: SessionCreateInput = {
        account,
        user,
        refreshTokenHash: 'refresh-token-123',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',

        deviceType: 'mocked-device-id',
      };

      const expectedSession = createMockSessionByInput({
        ...sessionInput,
        expiresAt: new Date(Date.now() + 3600000),
      });

      unitOfWork.session.create.mockReturnValue(expectedSession);
      unitOfWork.save.mockResolvedValue(undefined);

      // Act
      const createdSession = await service.create(sessionInput);
      await service.save();

      // Assert
      expect(createdSession).toEqual(expectedSession);
      expect(unitOfWork.session.create).toHaveBeenCalledTimes(1);
      expect(unitOfWork.save).toHaveBeenCalledTimes(1);

      // Verify call order
      const createCallTime =
        unitOfWork.session.create.mock.invocationCallOrder[0];
      const saveCallTime = unitOfWork.save.mock.invocationCallOrder[0];
      expect(createCallTime).toBeLessThan(saveCallTime);
    });

    it('should find session after creation', async () => {
      // Arrange
      const sessionId = 'session-123';
      const sessionInput = createMockSessionByInput({
        account: { id: 'account-123' } as any,
        refreshTokenHash: 'refresh-token-123',
        expiresAt: new Date(Date.now() + 3600000),
      });

      const createdSession = createMockSession({
        ...sessionInput,
        refreshCount: 0,
        isActive: true,
        lastAccessedAt: new Date(),
        deviceId: 'mocked-device-id',
      });

      createdSession.id = sessionId;

      unitOfWork.session.create.mockReturnValue(createdSession);
      unitOfWork.session.findOne.mockResolvedValue(createdSession);

      // Act
      const created = await service.create(sessionInput);
      const found = await service.findOneById(sessionId);

      // Assert
      expect(created).toEqual(createdSession);
      expect(found).toEqual(createdSession);
      expect(unitOfWork.session.create).toHaveBeenCalledTimes(1);
      expect(unitOfWork.session.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty user id in getUserSessions', async () => {
      // Arrange
      const emptyUserId = '';
      unitOfWork.session.find.mockResolvedValue([]);

      // Act
      const result = await service.getUserSessions(emptyUserId);

      // Assert
      expect(result).toEqual([]);
      expect(unitOfWork.session.find).toHaveBeenCalledWith({
        account: {
          user: {
            id: emptyUserId,
          },
        },
        deleteFlag: false,
        isActive: true,
        expiresAt: {
          $gt: expect.any(Date),
        },
      });
    });

    it('should handle null user id in getUserSessions', async () => {
      // Arrange
      const nullUserId = null as any;
      unitOfWork.session.find.mockResolvedValue([]);

      // Act
      const result = await service.getUserSessions(nullUserId);

      // Assert
      expect(result).toEqual([]);
      expect(unitOfWork.session.find).toHaveBeenCalledWith({
        account: {
          user: {
            id: nullUserId,
          },
        },
        deleteFlag: false,
        isActive: true,
        expiresAt: {
          $gt: expect.any(Date),
        },
      });
    });

    it('should handle very long user agent and ip address', async () => {
      // Arrange
      const longUserAgent = 'a'.repeat(1000);
      const longIpAddress = '192.168.1.1'.repeat(50);
      const sessionInput = createMockSessionByInput({
        account: { id: 'account-123' } as any,
        refreshTokenHash: 'refresh-token-123',
        userAgent: longUserAgent,
        ipAddress: longIpAddress,
        expiresAt: new Date(Date.now() + 3600000),
      });

      unitOfWork.session.create.mockReturnValue({} as SessionEntity);

      // Act
      await service.create(sessionInput);

      // Assert
      const hashMock = mockCrypto.createHash('md5');
      expect(hashMock.update).toHaveBeenCalledWith(
        longUserAgent + longIpAddress,
      );
    });

    it('should handle special characters in user agent and ip', async () => {
      // Arrange
      const specialUserAgent =
        'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.1)';
      const specialIpAddress = '::1';
      const sessionInput = createMockSessionByInput({
        account: { id: 'account-123' } as any,
        refreshTokenHash: 'refresh-token-123',
        userAgent: specialUserAgent,
        ipAddress: specialIpAddress,
        expiresAt: new Date(Date.now() + 3600000),
      });

      unitOfWork.session.create.mockReturnValue({} as SessionEntity);

      // Act
      await service.create(sessionInput);

      // Assert
      const hashMock = mockCrypto.createHash('md5');
      expect(hashMock.update).toHaveBeenCalledWith(
        specialUserAgent + specialIpAddress,
      );
    });

    it('should handle concurrent session operations', async () => {
      // Arrange
      const userId = 'user-123';
      const sessionId = 'session-123';
      const sessionInput = createMockSessionByInput({
        account: { id: 'account-123' } as any,
        refreshTokenHash: 'refresh-token-123',
        expiresAt: new Date(Date.now() + 3600000),
      });

      const mockSession = createMockSession({ id: sessionId });
      const mockSessions = [mockSession];

      unitOfWork.session.create.mockReturnValue(mockSession);
      unitOfWork.session.findOne.mockResolvedValue(mockSession);
      unitOfWork.session.find.mockResolvedValue(mockSessions);
      unitOfWork.save.mockResolvedValue(undefined);

      // Act - perform multiple operations concurrently
      const promises = [
        service.create(sessionInput),
        service.findOneById(sessionId),
        service.getUserSessions(userId),
        service.save(),
      ];

      // Assert - all operations should complete successfully
      const results = await Promise.all(promises);
      expect(results[0]).toEqual(mockSession);
      expect(results[1]).toEqual(mockSession);
      expect(results[2]).toEqual(mockSessions);
      expect(results[3]).toBeUndefined();
    });
  });

  describe('Private method behavior verification', () => {
    it('should create device id with correct hash algorithm', async () => {
      // Arrange
      const sessionInput = createMockSessionByInput({
        account: { id: 'account-123' } as any,
        refreshTokenHash: 'refresh-token-123',
        userAgent: 'TestAgent',
        ipAddress: '127.0.0.1',
        expiresAt: new Date(Date.now() + 3600000),
      });

      unitOfWork.session.create.mockReturnValue({} as SessionEntity);

      // Act
      await service.create(sessionInput);

      // Assert
      expect(mockCrypto.createHash).toHaveBeenCalledWith('md5');
      const hashMock = mockCrypto.createHash('md5');
      expect(hashMock.update).toHaveBeenCalledWith('TestAgent127.0.0.1');
      expect(hashMock.digest).toHaveBeenCalledWith('hex');
    });

    it('should set correct default values in create method', async () => {
      // Arrange
      const sessionInput = createMockSessionByInput({
        account: { id: 'account-123' } as any,
        refreshTokenHash: 'refresh-token-123',
        expiresAt: new Date(Date.now() + 3600000),
      });

      unitOfWork.session.create.mockReturnValue({} as SessionEntity);

      // Act
      await service.create(sessionInput);

      // Assert
      expect(unitOfWork.session.create).toHaveBeenCalledWith({
        ...sessionInput,
        refreshCount: 0,
        isActive: true,
        lastAccessedAt: expect.any(Date),
        deviceId: 'mocked-device-id',
      });
    });

    it('should use current date for lastAccessedAt', async () => {
      // Arrange
      const beforeCreate = new Date();
      const sessionInput = createMockSessionByInput({
        account: { id: 'account-123' } as any,
        refreshTokenHash: 'refresh-token-123',
        expiresAt: new Date(Date.now() + 3600000),
      });

      unitOfWork.session.create.mockReturnValue({} as SessionEntity);

      // Act
      await service.create(sessionInput);
      const afterCreate = new Date();

      // Assert
      const createCall = unitOfWork.session.create.mock.calls[0][0];
      const lastAccessedAt = createCall.lastAccessedAt as Date;
      expect(lastAccessedAt).toBeInstanceOf(Date);
      expect(lastAccessedAt?.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(lastAccessedAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });
  });
});
