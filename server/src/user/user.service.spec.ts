import { Role, UserEntity } from '@app/entities';
import { Errors } from '@app/errors';
import { UNIT_OF_WORK } from '@app/repositories';
import { BcryptService } from '@app/services';
import {
  createMockUser,
  createTestingModule,
  mockUnitOfWork,
} from '@app/tests';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let unitOfWork: typeof mockUnitOfWork;

  beforeEach(async () => {
    // const module: TestingModule = await Test.createTestingModule({
    //   providers: [UserService, BcryptService],
    // }).compile();

    const module = await createTestingModule({
      providers: [UserService, BcryptService],
    });

    service = module.get<UserService>(UserService);
    unitOfWork = module.get(UNIT_OF_WORK);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOneByAccountId', () => {
    it('should find user by account id successfully', async () => {
      // Arrange
      const accountId = 'test-account-id';
      const expectedUser = createMockUser();

      unitOfWork.user.findOne.mockResolvedValue(expectedUser);

      // Act
      const result = await service.findOneByAccountId(accountId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(unitOfWork.user.findOne).toHaveBeenCalledWith({
        accounts: {
          id: accountId,
        },
      });
      expect(unitOfWork.user.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found by account id', async () => {
      // Arrange
      const accountId = 'non-existent-account-id';
      unitOfWork.user.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findOneByAccountId(accountId);

      // Assert
      expect(result).toBeNull();
      expect(unitOfWork.user.findOne).toHaveBeenCalledWith({
        accounts: {
          id: accountId,
        },
      });
    });

    it('should handle database errors when finding user by account id', async () => {
      // Arrange
      const accountId = 'test-account-id';
      const dbError = new Error('Database connection failed');
      unitOfWork.user.findOne.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.findOneByAccountId(accountId)).rejects.toThrow(
        'Database connection failed',
      );
      expect(unitOfWork.user.findOne).toHaveBeenCalledWith({
        accounts: {
          id: accountId,
        },
      });
    });

    it('should handle empty account id', async () => {
      // Arrange
      const accountId = '';
      unitOfWork.user.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findOneByAccountId(accountId);

      // Assert
      expect(result).toBeNull();
      expect(unitOfWork.user.findOne).toHaveBeenCalledWith({
        accounts: {
          id: accountId,
        },
      });
    });
  });

  describe('create', () => {
    it('should create user successfully with valid data', () => {
      // Arrange
      const userData = {
        name: 'User',
        role: Role.USER,
      };

      const expectedUser = createMockUser(userData);
      unitOfWork.user.create.mockReturnValue(expectedUser);

      // Act
      const result = service.create(userData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(unitOfWork.user.create).toHaveBeenCalledTimes(1);

      // Verify that create was called with a UserEntity instance
      const createCall = unitOfWork.user.create.mock.calls[0][0];
      expect(createCall).toBeInstanceOf(UserEntity);
    });

    it('should create user with minimal required data', () => {
      // Arrange
      const minimalUserData = {
        name: 'Minimal User',
        role: Role.USER,
      };

      const expectedUser = createMockUser(minimalUserData);
      unitOfWork.user.create.mockReturnValue(expectedUser);

      // Act
      const result = service.create(minimalUserData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(unitOfWork.user.create).toHaveBeenCalledTimes(1);

      const createCall = unitOfWork.user.create.mock.calls[0][0];
      expect(createCall).toBeInstanceOf(UserEntity);
    });

    it('should create user with all optional fields', () => {
      // Arrange
      const completeUserData = {
        name: 'Complete User',
        role: Role.USER,
        createAt: new Date(),
        deletedAt: new Date(),
        deleteFlag: false,
        updateAt: new Date(),
        id: '1',
      };

      const expectedUser = createMockUser(completeUserData);
      unitOfWork.user.create.mockReturnValue(expectedUser);

      // Act
      const result = service.create(completeUserData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(unitOfWork.user.create).toHaveBeenCalledTimes(1);
    });

    it('should handle repository create errors', () => {
      // Arrange
      const userData = {
        name: 'Error User',
        role: Role.USER,
      };

      const createError = new Error('Failed to create user entity');
      unitOfWork.user.create.mockImplementation(() => {
        throw createError;
      });

      // Act & Assert
      expect(() => service.create(userData)).toThrow(
        'Failed to create user entity',
      );
      expect(unitOfWork.user.create).toHaveBeenCalledTimes(1);
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
        'UNIQUE constraint failed: users.email',
      );
      unitOfWork.save.mockRejectedValue(constraintError);

      // Act & Assert
      await expect(service.save()).rejects.toThrow(
        'UNIQUE constraint failed: users.email',
      );
      expect(unitOfWork.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration scenarios', () => {
    it('should create and save user in sequence', async () => {
      // Arrange
      const userData = {
        name: 'Integration Test',
        role: Role.USER,
      };

      const expectedUser = createMockUser(userData);
      unitOfWork.user.create.mockReturnValue(expectedUser);
      unitOfWork.save.mockResolvedValue(undefined);

      // Act
      const createdUser = service.create(userData);
      await service.save();

      // Assert
      expect(createdUser).toEqual(expectedUser);
      expect(unitOfWork.user.create).toHaveBeenCalledTimes(1);
      expect(unitOfWork.save).toHaveBeenCalledTimes(1);

      // Verify call order
      const createCallTime = unitOfWork.user.create.mock.invocationCallOrder[0];
      const saveCallTime = unitOfWork.save.mock.invocationCallOrder[0];
      expect(createCallTime).toBeLessThan(saveCallTime);
    });

    it('should handle create success but save failure', async () => {
      // Arrange
      const userData = {
        name: 'Save fail user',
        role: Role.USER,
      };

      const expectedUser = createMockUser(userData);
      unitOfWork.user.create.mockReturnValue(expectedUser);
      unitOfWork.save.mockRejectedValue(new Error('Save operation failed'));

      // Act
      const createdUser = service.create(userData);

      // Assert
      expect(createdUser).toEqual(expectedUser);
      expect(unitOfWork.user.create).toHaveBeenCalledTimes(1);

      // Save should fail
      await expect(service.save()).rejects.toThrow('Save operation failed');
      expect(unitOfWork.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle null/undefined userData in create', () => {
      // Arrange
      unitOfWork.user.create.mockImplementation(() => {
        throw new Error('Invalid user data');
      });

      // Act & Assert
      expect(() => service.create(null as any)).toThrow(
        Errors.User.InvalidUserData.message,
      );
      expect(() => service.create(undefined as any)).toThrow(
        Errors.User.InvalidUserData.message,
      );
    });

    it('should handle very long account id in findOneByAccountId', async () => {
      // Arrange
      const veryLongAccountId = 'a'.repeat(1000);
      unitOfWork.user.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findOneByAccountId(veryLongAccountId);

      // Assert
      expect(result).toBeNull();
      expect(unitOfWork.user.findOne).toHaveBeenCalledWith({
        accounts: {
          id: veryLongAccountId,
        },
      });
    });

    it('should handle special characters in account id', async () => {
      // Arrange
      const specialAccountId = 'account-123!@#$%^&*()_+';
      const expectedUser = createMockUser();
      unitOfWork.user.findOne.mockResolvedValue(expectedUser);

      // Act
      const result = await service.findOneByAccountId(specialAccountId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(unitOfWork.user.findOne).toHaveBeenCalledWith({
        accounts: {
          id: specialAccountId,
        },
      });
    });
  });
});
