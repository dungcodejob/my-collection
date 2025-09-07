import { HOUR, SECOND } from '@app/constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { BacklistService } from './backlist.service';

describe('BacklistService', () => {
  let service: BacklistService;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BacklistService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<BacklistService>(BacklistService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addTokenBlacklist', () => {
    it('should add token to blacklist with correct TTL', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';
      const exp = Date.now() + 3600000; // 1 hour from now
      const expectedKey = `blacklist:session:${sessionId}:token:${tokenId}`;

      cacheManager.set.mockResolvedValue(undefined);

      // Act
      await service.addTokenBlacklist(sessionId, tokenId, exp);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
      expect(cacheManager.set).toHaveBeenCalledTimes(1);
    });

    it('should not add token to blacklist when TTL is negative', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';
      const exp = Date.now() - HOUR; // 1 hour ago (expired)

      // Act
      await service.addTokenBlacklist(sessionId, tokenId, exp);

      // Assert
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should not add token to blacklist when TTL is zero', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';
      const exp = Date.now(); // exactly now

      // Act
      await service.addTokenBlacklist(sessionId, tokenId, exp);

      // Assert
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should handle cache manager errors gracefully', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';
      const exp = Date.now() + 3600000;
      const cacheError = new Error('Cache operation failed');

      cacheManager.set.mockRejectedValue(cacheError);

      // Act & Assert
      await expect(
        service.addTokenBlacklist(sessionId, tokenId, exp),
      ).rejects.toThrow('Cache operation failed');
    });
  });

  describe('addUserToBlacklist', () => {
    it('should add user to blacklist with correct TTL', async () => {
      // Arrange
      const userId = 'user-789';
      const exp = Date.now() + 3600000; // 1 hour from now
      const expectedKey = `blacklist:user:${userId}`;

      cacheManager.set.mockResolvedValue(undefined);

      // Act
      await service.addUserToBlacklist(userId, exp);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
      expect(cacheManager.set).toHaveBeenCalledTimes(1);
    });

    it('should not add user to blacklist when TTL is negative', async () => {
      // Arrange
      const userId = 'user-789';
      const exp = Date.now() - 3600000; // 1 hour ago (expired)

      // Act
      await service.addUserToBlacklist(userId, exp);

      // Assert
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should handle cache manager errors gracefully', async () => {
      // Arrange
      const userId = 'user-789';
      const exp = Date.now() + 3600000;
      const cacheError = new Error('Cache operation failed');

      cacheManager.set.mockRejectedValue(cacheError);

      // Act & Assert
      await expect(service.addUserToBlacklist(userId, exp)).rejects.toThrow(
        'Cache operation failed',
      );
    });
  });

  describe('checkIfTokenIsBlacklisted', () => {
    it('should return true when token is blacklisted', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';
      const tokenKey = `blacklist:session:${sessionId}:token:${tokenId}`;
      const sessionKey = `blacklist:session:${sessionId}`;

      cacheManager.get
        .mockResolvedValueOnce(Date.now()) // token is blacklisted
        .mockResolvedValueOnce(null); // session is not blacklisted

      // Act
      const result = await service.checkIfTokenIsBlacklisted(
        sessionId,
        tokenId,
      );

      // Assert
      expect(result).toBe(true);
      expect(cacheManager.get).toHaveBeenCalledWith(tokenKey);
      expect(cacheManager.get).toHaveBeenCalledWith(sessionKey);
      expect(cacheManager.get).toHaveBeenCalledTimes(2);
    });

    it('should return true when session is blacklisted', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';
      const tokenKey = `blacklist:session:${sessionId}:token:${tokenId}`;
      const sessionKey = `blacklist:session:${sessionId}`;

      cacheManager.get
        .mockResolvedValueOnce(null) // token is not blacklisted
        .mockResolvedValueOnce(Date.now()); // session is blacklisted

      // Act
      const result = await service.checkIfTokenIsBlacklisted(
        sessionId,
        tokenId,
      );

      // Assert
      expect(result).toBe(true);
      expect(cacheManager.get).toHaveBeenCalledWith(tokenKey);
      expect(cacheManager.get).toHaveBeenCalledWith(sessionKey);
      expect(cacheManager.get).toHaveBeenCalledTimes(2);
    });

    it('should return true when both token and session are blacklisted', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';
      const tokenKey = `blacklist:session:${sessionId}:token:${tokenId}`;
      const sessionKey = `blacklist:session:${sessionId}`;

      cacheManager.get
        .mockResolvedValueOnce(Date.now()) // token is blacklisted
        .mockResolvedValueOnce(Date.now()); // session is blacklisted

      // Act
      const result = await service.checkIfTokenIsBlacklisted(
        sessionId,
        tokenId,
      );

      // Assert
      expect(result).toBe(true);
      expect(cacheManager.get).toHaveBeenCalledWith(tokenKey);
      expect(cacheManager.get).toHaveBeenCalledWith(sessionKey);
      expect(cacheManager.get).toHaveBeenCalledTimes(2);
    });

    it('should return false when neither token nor session is blacklisted', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';
      const tokenKey = `blacklist:session:${sessionId}:token:${tokenId}`;
      const sessionKey = `blacklist:session:${sessionId}`;

      cacheManager.get
        .mockResolvedValueOnce(null) // token is not blacklisted
        .mockResolvedValueOnce(null); // session is not blacklisted

      // Act
      const result = await service.checkIfTokenIsBlacklisted(
        sessionId,
        tokenId,
      );

      // Assert
      expect(result).toBe(false);
      expect(cacheManager.get).toHaveBeenCalledWith(tokenKey);
      expect(cacheManager.get).toHaveBeenCalledWith(sessionKey);
      expect(cacheManager.get).toHaveBeenCalledTimes(2);
    });

    it('should return false when cache returns undefined', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';

      cacheManager.get
        .mockResolvedValueOnce(undefined) // token is not blacklisted
        .mockResolvedValueOnce(undefined); // session is not blacklisted

      // Act
      const result = await service.checkIfTokenIsBlacklisted(
        sessionId,
        tokenId,
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should handle cache manager errors gracefully', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';
      const cacheError = new Error('Cache operation failed');

      cacheManager.get.mockRejectedValue(cacheError);

      // Act & Assert
      await expect(
        service.checkIfTokenIsBlacklisted(sessionId, tokenId),
      ).rejects.toThrow('Cache operation failed');
    });
  });

  describe('checkIfUserIsBlacklisted', () => {
    it('should return true when user is blacklisted', async () => {
      // Arrange
      const userId = 'user-789';
      const expectedKey = `blacklist:user:${userId}`;

      cacheManager.get.mockResolvedValue(Date.now());

      // Act
      const result = await service.checkIfUserIsBlacklisted(userId);

      // Assert
      expect(result).toBe(true);
      expect(cacheManager.get).toHaveBeenCalledWith(expectedKey);
      expect(cacheManager.get).toHaveBeenCalledTimes(1);
    });

    it('should return false when user is not blacklisted', async () => {
      // Arrange
      const userId = 'user-789';
      const expectedKey = `blacklist:user:${userId}`;

      cacheManager.get.mockResolvedValue(null);

      // Act
      const result = await service.checkIfUserIsBlacklisted(userId);

      // Assert
      expect(result).toBe(false);
      expect(cacheManager.get).toHaveBeenCalledWith(expectedKey);
      expect(cacheManager.get).toHaveBeenCalledTimes(1);
    });

    it('should return false when cache returns undefined', async () => {
      // Arrange
      const userId = 'user-789';
      const expectedKey = `blacklist:user:${userId}`;

      cacheManager.get.mockResolvedValue(undefined);

      // Act
      const result = await service.checkIfUserIsBlacklisted(userId);

      // Assert
      expect(result).toBe(false);
      expect(cacheManager.get).toHaveBeenCalledWith(expectedKey);
      expect(cacheManager.get).toHaveBeenCalledTimes(1);
    });

    it('should handle cache manager errors gracefully', async () => {
      // Arrange
      const userId = 'user-789';
      const cacheError = new Error('Cache operation failed');

      cacheManager.get.mockRejectedValue(cacheError);

      // Act & Assert
      await expect(service.checkIfUserIsBlacklisted(userId)).rejects.toThrow(
        'Cache operation failed',
      );
    });
  });

  describe('Edge cases and integration scenarios', () => {
    it('should handle empty string parameters', async () => {
      // Arrange
      const sessionId = '';
      const tokenId = '';
      const userId = '';
      const exp = Date.now() + 3600000;

      cacheManager.set.mockResolvedValue(undefined);
      cacheManager.get.mockResolvedValue(null);

      // Act & Assert - should not throw errors
      await expect(
        service.addTokenBlacklist(sessionId, tokenId, exp),
      ).resolves.toBeUndefined();
      await expect(
        service.addUserToBlacklist(userId, exp),
      ).resolves.toBeUndefined();
      await expect(
        service.checkIfTokenIsBlacklisted(sessionId, tokenId),
      ).resolves.toBe(false);
      await expect(service.checkIfUserIsBlacklisted(userId)).resolves.toBe(
        false,
      );
    });

    it('should handle special characters in IDs', async () => {
      // Arrange
      const sessionId = 'session-123!@#$%^&*()';
      const tokenId = 'token-456<>?:"{}|';
      const userId = "user-789[]\\;',./`~";
      const exp = Date.now() + 3600000;

      cacheManager.set.mockResolvedValue(undefined);
      cacheManager.get.mockResolvedValue(null);

      // Act & Assert - should handle special characters correctly
      await expect(
        service.addTokenBlacklist(sessionId, tokenId, exp),
      ).resolves.toBeUndefined();
      await expect(
        service.addUserToBlacklist(userId, exp),
      ).resolves.toBeUndefined();
      await expect(
        service.checkIfTokenIsBlacklisted(sessionId, tokenId),
      ).resolves.toBe(false);
      await expect(service.checkIfUserIsBlacklisted(userId)).resolves.toBe(
        false,
      );
    });

    it('should handle very long ID strings', async () => {
      // Arrange
      const longId = 'a'.repeat(1000);
      const exp = Date.now() + 3600000;

      cacheManager.set.mockResolvedValue(undefined);
      cacheManager.get.mockResolvedValue(null);

      // Act & Assert - should handle long strings
      await expect(
        service.addTokenBlacklist(longId, longId, exp),
      ).resolves.toBeUndefined();
      await expect(
        service.addUserToBlacklist(longId, exp),
      ).resolves.toBeUndefined();
      await expect(
        service.checkIfTokenIsBlacklisted(longId, longId),
      ).resolves.toBe(false);
      await expect(service.checkIfUserIsBlacklisted(longId)).resolves.toBe(
        false,
      );
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';
      const userId = 'user-789';
      const exp = Date.now() + 3600000;

      cacheManager.set.mockResolvedValue(undefined);
      cacheManager.get.mockResolvedValue(null);

      // Act - perform multiple operations concurrently
      const promises = [
        service.addTokenBlacklist(sessionId, tokenId, exp),
        service.addUserToBlacklist(userId, exp),
        service.checkIfTokenIsBlacklisted(sessionId, tokenId),
        service.checkIfUserIsBlacklisted(userId),
      ];

      // Assert - all operations should complete successfully
      const results = await Promise.all(promises);
      expect(results[0]).toBeUndefined();
      expect(results[1]).toBeUndefined();
      expect(results[2]).toBe(false);
      expect(results[3]).toBe(false);
    });
  });

  describe('Private method behavior verification', () => {
    it('should create correct token key format', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';
      const exp = Date.now() + 3600000;
      const expectedKey = `blacklist:session:${sessionId}:token:${tokenId}`;

      cacheManager.set.mockResolvedValue(undefined);

      // Act
      await service.addTokenBlacklist(sessionId, tokenId, exp);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should create correct session key format', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';
      const expectedSessionKey = `blacklist:session:${sessionId}`;

      cacheManager.get.mockResolvedValue(null);

      // Act
      await service.checkIfTokenIsBlacklisted(sessionId, tokenId);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(expectedSessionKey);
    });

    it('should create correct user key format', async () => {
      // Arrange
      const userId = 'user-789';
      const exp = Date.now() + HOUR;
      const expectedKey = `blacklist:user:${userId}`;

      cacheManager.set.mockResolvedValue(undefined);

      // Act
      await service.addUserToBlacklist(userId, exp);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should calculate TTL correctly', async () => {
      // Arrange
      const sessionId = 'session-123';
      const tokenId = 'token-456';
      const futureTime = Date.now() + HOUR; // 1 hour from now
      const expectedTTLRange = [HOUR - SECOND * 10, HOUR + SECOND * 10]; // Allow some variance for execution time

      cacheManager.set.mockResolvedValue(undefined);

      // Act
      await service.addTokenBlacklist(sessionId, tokenId, futureTime);

      // Assert
      const setCall = cacheManager.set.mock.calls[0];
      const actualTTL = setCall[2] as number;

      expect(actualTTL).toBeGreaterThanOrEqual(expectedTTLRange[0]);
      expect(actualTTL).toBeLessThanOrEqual(expectedTTLRange[1]);
    });
  });
});
