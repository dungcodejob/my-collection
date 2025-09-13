import { DAY, HOUR, MINUTE } from '@app/constants';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { jwtConfig, JwtConfig } from '@app/configs';
import { BcryptService } from './bcrypt.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

const bcryptCompare = bcrypt.compare as jest.Mock;
const bcryptGenSalt = bcrypt.genSalt as jest.Mock;
const bcryptHash = bcrypt.hash as jest.Mock;

describe('BcryptService', () => {
  let service: BcryptService;
  let mockJwtConfig: JwtConfig;

  bcrypt.compare('password', 'hashed-password');
  beforeEach(async () => {
    // Mock JWT config
    mockJwtConfig = {
      jwtSalt: 12,
      access: {
        secret: 'test-access-secret',
        time: 15 * MINUTE,
      },
      refresh: {
        secret: 'test-refresh-secret',
        time: 7 * DAY,
      },
      confirmation: {
        secret: 'test-confirmation-secret',
        time: 1 * HOUR,
      },
      resetPassword: {
        secret: 'test-reset-password-secret',
        time: 1 * HOUR,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [jwtConfig],
        }),
      ],
      providers: [BcryptService],
    })
      .overrideProvider(jwtConfig.KEY)
      .useValue(mockJwtConfig)
      .compile();

    service = module.get<BcryptService>(BcryptService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('should hash a string value successfully', async () => {
      // Arrange
      const inputValue = 'password123';
      const mockSalt = 'mock-salt';
      const expectedHash = 'hashed-password';

      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash.mockResolvedValue(expectedHash);

      // Act
      const result = await service.hash(inputValue);

      // Assert
      expect(result).toBe(expectedHash);
      expect(bcryptGenSalt).toHaveBeenCalledWith(mockJwtConfig.jwtSalt);
      expect(bcryptGenSalt).toHaveBeenCalledTimes(1);
      expect(bcryptHash).toHaveBeenCalledWith(inputValue, mockSalt);
      expect(bcryptHash).toHaveBeenCalledTimes(1);
    });

    it('should hash empty string', async () => {
      // Arrange
      const inputValue = '';
      const mockSalt = 'mock-salt';
      const expectedHash = 'hashed-empty-string';

      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash.mockResolvedValue(expectedHash);

      // Act
      const result = await service.hash(inputValue);

      // Assert
      expect(result).toBe(expectedHash);
      expect(bcryptGenSalt).toHaveBeenCalledWith(mockJwtConfig.jwtSalt);
      expect(bcryptHash).toHaveBeenCalledWith(inputValue, mockSalt);
    });

    it('should hash string with special characters', async () => {
      // Arrange
      const inputValue = 'p@ssw0rd!@#$%^&*()';
      const mockSalt = 'mock-salt';
      const expectedHash = 'hashed-special-chars';

      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash.mockResolvedValue(expectedHash);

      // Act
      const result = await service.hash(inputValue);

      // Assert
      expect(result).toBe(expectedHash);
      expect(bcryptGenSalt).toHaveBeenCalledWith(mockJwtConfig.jwtSalt);
      expect(bcryptHash).toHaveBeenCalledWith(inputValue, mockSalt);
    });

    it('should hash very long string', async () => {
      // Arrange
      const inputValue = 'a'.repeat(1000);
      const mockSalt = 'mock-salt';
      const expectedHash = 'hashed-long-string';

      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash.mockResolvedValue(expectedHash);

      // Act
      const result = await service.hash(inputValue);

      // Assert
      expect(result).toBe(expectedHash);
      expect(bcryptGenSalt).toHaveBeenCalledWith(mockJwtConfig.jwtSalt);
      expect(bcryptHash).toHaveBeenCalledWith(inputValue, mockSalt);
    });

    it('should hash unicode characters', async () => {
      // Arrange
      const inputValue = '密码123🔐';
      const mockSalt = 'mock-salt';
      const expectedHash = 'hashed-unicode';

      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash.mockResolvedValue(expectedHash);

      // Act
      const result = await service.hash(inputValue);

      // Assert
      expect(result).toBe(expectedHash);
      expect(bcryptGenSalt).toHaveBeenCalledWith(mockJwtConfig.jwtSalt);
      expect(bcryptHash).toHaveBeenCalledWith(inputValue, mockSalt);
    });

    it('should use correct salt rounds from config', async () => {
      // Arrange
      const inputValue = 'test-password';
      const customSaltRounds = 15;
      const mockSalt = 'mock-salt';
      const expectedHash = 'hashed-password';

      // Update config with custom salt rounds
      mockJwtConfig.jwtSalt = customSaltRounds;
      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash.mockResolvedValue(expectedHash);

      // Act
      const result = await service.hash(inputValue);

      // Assert
      expect(result).toBe(expectedHash);
      expect(bcryptGenSalt).toHaveBeenCalledWith(customSaltRounds);
      expect(bcryptHash).toHaveBeenCalledWith(inputValue, mockSalt);
    });

    it('should handle genSalt errors', async () => {
      // Arrange
      const inputValue = 'password123';
      const saltError = new Error('Salt generation failed');

      bcryptGenSalt.mockRejectedValue(saltError);

      // Act & Assert
      await expect(service.hash(inputValue)).rejects.toThrow(
        'Salt generation failed',
      );
      expect(bcryptGenSalt).toHaveBeenCalledWith(mockJwtConfig.jwtSalt);
      expect(bcryptHash).not.toHaveBeenCalled();
    });

    it('should handle hash errors', async () => {
      // Arrange
      const inputValue = 'password123';
      const mockSalt = 'mock-salt';
      const hashError = new Error('Hash generation failed');

      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash.mockRejectedValue(hashError);

      // Act & Assert
      await expect(service.hash(inputValue)).rejects.toThrow(
        'Hash generation failed',
      );
      expect(bcryptGenSalt).toHaveBeenCalledWith(mockJwtConfig.jwtSalt);
      expect(bcryptHash).toHaveBeenCalledWith(inputValue, mockSalt);
    });

    it('should handle multiple concurrent hash operations', async () => {
      // Arrange
      const values = ['password1', 'password2', 'password3'];
      const mockSalt = 'mock-salt';
      const expectedHashes = ['hash1', 'hash2', 'hash3'];

      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash
        .mockResolvedValueOnce(expectedHashes[0])
        .mockResolvedValueOnce(expectedHashes[1])
        .mockResolvedValueOnce(expectedHashes[2]);

      // Act
      const promises = values.map((value) => service.hash(value));
      const results = await Promise.all(promises);

      // Assert
      expect(results).toEqual(expectedHashes);
      expect(bcryptGenSalt).toHaveBeenCalledTimes(3);
      expect(bcryptHash).toHaveBeenCalledTimes(3);
    });
  });

  describe('verify', () => {
    it('should verify correct password successfully', async () => {
      // Arrange
      const plainPassword = 'password123';
      const hashedPassword = 'hashed-password';

      bcryptCompare.mockResolvedValue(true);

      // Act
      const result = await service.verify(plainPassword, hashedPassword);

      // Assert
      expect(result).toBe(true);
      expect(bcryptCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(bcryptCompare).toHaveBeenCalledTimes(1);
    });

    it('should reject incorrect password', async () => {
      // Arrange
      const plainPassword = 'wrongpassword';
      const hashedPassword = 'hashed-password';

      bcryptCompare.mockResolvedValue(false);

      // Act
      const result = await service.verify(plainPassword, hashedPassword);

      // Assert
      expect(result).toBe(false);
      expect(bcryptCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(bcryptCompare).toHaveBeenCalledTimes(1);
    });

    it('should verify empty string against empty hash', async () => {
      // Arrange
      const plainPassword = '';
      const hashedPassword = '';

      bcryptCompare.mockResolvedValue(true);

      // Act
      const result = await service.verify(plainPassword, hashedPassword);

      // Assert
      expect(result).toBe(true);
      expect(bcryptCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    it('should verify password with special characters', async () => {
      // Arrange
      const plainPassword = 'p@ssw0rd!@#$%^&*()';
      const hashedPassword = 'hashed-special-password';

      bcryptCompare.mockResolvedValue(true);

      // Act
      const result = await service.verify(plainPassword, hashedPassword);

      // Assert
      expect(result).toBe(true);
      expect(bcryptCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    it('should verify very long password', async () => {
      // Arrange
      const plainPassword = 'a'.repeat(1000);
      const hashedPassword = 'hashed-long-password';

      bcryptCompare.mockResolvedValue(true);

      // Act
      const result = await service.verify(plainPassword, hashedPassword);

      // Assert
      expect(result).toBe(true);
      expect(bcryptCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    it('should verify unicode password', async () => {
      // Arrange
      const plainPassword = '密码123🔐';
      const hashedPassword = 'hashed-unicode-password';

      bcryptCompare.mockResolvedValue(true);

      // Act
      const result = await service.verify(plainPassword, hashedPassword);

      // Assert
      expect(result).toBe(true);
      expect(bcryptCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    it('should handle compare errors', async () => {
      // Arrange
      const plainPassword = 'password123';
      const hashedPassword = 'hashed-password';
      const compareError = new Error('Compare operation failed');

      bcryptCompare.mockRejectedValue(compareError);

      // Act & Assert
      await expect(
        service.verify(plainPassword, hashedPassword),
      ).rejects.toThrow('Compare operation failed');
      expect(bcryptCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    it('should handle malformed hash', async () => {
      // Arrange
      const plainPassword = 'password123';
      const malformedHash = 'not-a-valid-hash';
      const compareError = new Error('Invalid hash format');

      bcryptCompare.mockRejectedValue(compareError);

      // Act & Assert
      await expect(
        service.verify(plainPassword, malformedHash),
      ).rejects.toThrow('Invalid hash format');
      expect(bcryptCompare).toHaveBeenCalledWith(plainPassword, malformedHash);
    });

    it('should handle multiple concurrent verify operations', async () => {
      // Arrange
      const passwords = ['password1', 'password2', 'password3'];
      const hashes = ['hash1', 'hash2', 'hash3'];
      const expectedResults = [true, false, true];
      bcryptCompare
        .mockResolvedValueOnce(expectedResults[0])
        .mockResolvedValueOnce(expectedResults[1])
        .mockResolvedValueOnce(expectedResults[2]);

      // Act
      const promises = passwords.map((password, index) =>
        service.verify(password, hashes[index]),
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toEqual(expectedResults);
      expect(bcryptCompare).toHaveBeenCalledTimes(3);
      passwords.forEach((password, index) => {
        expect(bcryptCompare).toHaveBeenCalledWith(password, hashes[index]);
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should hash and verify the same password successfully', async () => {
      // Arrange
      const password = 'integration-test-password';
      const mockSalt = 'mock-salt';
      const hashedPassword = 'hashed-integration-password';

      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash.mockResolvedValue(hashedPassword);
      bcryptCompare.mockResolvedValue(true);

      // Act
      const hash = await service.hash(password);
      const isValid = await service.verify(password, hash);

      // Assert
      expect(hash).toBe(hashedPassword);
      expect(isValid).toBe(true);
      expect(bcryptGenSalt).toHaveBeenCalledWith(mockJwtConfig.jwtSalt);
      expect(bcryptHash).toHaveBeenCalledWith(password, mockSalt);
      expect(bcryptCompare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should hash and reject different password', async () => {
      // Arrange
      const originalPassword = 'original-password';
      const differentPassword = 'different-password';
      const mockSalt = 'mock-salt';
      const hashedPassword = 'hashed-original-password';

      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash.mockResolvedValue(hashedPassword);
      bcryptCompare.mockResolvedValue(false);

      // Act
      const hash = await service.hash(originalPassword);
      const isValid = await service.verify(differentPassword, hash);

      // Assert
      expect(hash).toBe(hashedPassword);
      expect(isValid).toBe(false);
      expect(bcryptGenSalt).toHaveBeenCalledWith(mockJwtConfig.jwtSalt);
      expect(bcryptHash).toHaveBeenCalledWith(originalPassword, mockSalt);
      expect(bcryptCompare).toHaveBeenCalledWith(
        differentPassword,
        hashedPassword,
      );
    });

    it('should handle sequential hash and verify operations', async () => {
      // Arrange
      const passwords = ['password1', 'password2', 'password3'];
      const mockSalt = 'mock-salt';
      const hashes = ['hash1', 'hash2', 'hash3'];
      const verifyResults = [true, true, false];

      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash
        .mockResolvedValueOnce(hashes[0])
        .mockResolvedValueOnce(hashes[1])
        .mockResolvedValueOnce(hashes[2]);
      bcryptCompare
        .mockResolvedValueOnce(verifyResults[0])
        .mockResolvedValueOnce(verifyResults[1])
        .mockResolvedValueOnce(verifyResults[2]);

      // Act
      const results: { hash: string; isValid: boolean }[] = [];
      for (let i = 0; i < passwords.length; i++) {
        const hash = await service.hash(passwords[i]);
        const isValid = await service.verify(passwords[i], hash);
        results.push({ hash, isValid });
      }

      // Assert
      expect(results).toEqual([
        { hash: hashes[0], isValid: verifyResults[0] },
        { hash: hashes[1], isValid: verifyResults[1] },
        { hash: hashes[2], isValid: verifyResults[2] },
      ]);
      expect(bcryptGenSalt).toHaveBeenCalledTimes(3);
      expect(bcryptHash).toHaveBeenCalledTimes(3);
      expect(bcryptCompare).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null/undefined values gracefully', async () => {
      // Arrange
      const nullValue = null as any;
      const undefinedValue = undefined as any;
      const mockSalt = 'mock-salt';
      const expectedHash = 'hashed-null';

      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash.mockResolvedValue(expectedHash);
      bcryptCompare.mockResolvedValue(false);

      // Act & Assert - hash should handle null/undefined
      await expect(service.hash(nullValue)).resolves.toBe(expectedHash);
      await expect(service.hash(undefinedValue)).resolves.toBe(expectedHash);

      // Act & Assert - verify should handle null/undefined
      await expect(service.verify(nullValue, 'some-hash')).resolves.toBe(false);
      await expect(service.verify('some-password', nullValue)).resolves.toBe(
        false,
      );
    });

    it('should handle service instantiation with different salt values', async () => {
      // Arrange
      const customJwtConfig = {
        ...mockJwtConfig,
        jwtSalt: 8, // Different salt rounds
      };

      const customModule: TestingModule = await Test.createTestingModule({
        providers: [
          BcryptService,
          {
            provide: jwtConfig.KEY,
            useValue: customJwtConfig,
          },
        ],
      }).compile();

      const customService = customModule.get<BcryptService>(BcryptService);
      const password = 'test-password';
      const mockSalt = 'custom-salt';
      const expectedHash = 'custom-hash';

      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash.mockResolvedValue(expectedHash);

      // Act
      const result = await customService.hash(password);

      // Assert
      expect(result).toBe(expectedHash);
      expect(bcryptGenSalt).toHaveBeenCalledWith(8); // Custom salt rounds
      expect(bcryptHash).toHaveBeenCalledWith(password, mockSalt);
    });

    it('should maintain consistent behavior across multiple service instances', async () => {
      // Arrange
      const password = 'consistent-test';
      const mockSalt = 'consistent-salt';
      const expectedHash = 'consistent-hash';

      // Create second service instance
      const secondModule: TestingModule = await Test.createTestingModule({
        providers: [
          BcryptService,
          {
            provide: jwtConfig.KEY,
            useValue: mockJwtConfig,
          },
        ],
      }).compile();

      const secondService = secondModule.get<BcryptService>(BcryptService);

      bcryptGenSalt.mockResolvedValue(mockSalt);
      bcryptHash.mockResolvedValue(expectedHash);
      bcryptCompare.mockResolvedValue(true);

      // Act
      const hash1 = await service.hash(password);
      const hash2 = await secondService.hash(password);
      const verify1 = await service.verify(password, hash1);
      const verify2 = await secondService.verify(password, hash2);

      // Assert
      expect(hash1).toBe(expectedHash);
      expect(hash2).toBe(expectedHash);
      expect(verify1).toBe(true);
      expect(verify2).toBe(true);
    });
  });
});
