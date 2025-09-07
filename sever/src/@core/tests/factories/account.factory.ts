import { AccountEntity } from '@app/entities';
import { faker } from '@faker-js/faker';

/**
 * Account Entity Factory using Faker.js for realistic test data
 * Can be used in both testing and development environments
 */

/**
 * Create a mock Account entity with realistic data
 */
export const createMockAccount = (
  overrides: Partial<AccountEntity> = {},
): AccountEntity =>
  ({
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password({ length: 60 }), // Simulated hashed password
    version: faker.number.int({ min: 0, max: 5 }),
    passwordUpdatedAt: faker.date.recent({ days: 30 }),
    isActive: faker.datatype.boolean({ probability: 0.8 }), // 80% chance of being active
    lastLoginAt: faker.datatype.boolean({ probability: 0.7 })
      ? faker.date.recent({ days: 7 })
      : undefined,
    createAt: faker.date.past({ years: 2 }),
    updateAt: faker.date.recent({ days: 30 }),
    deletedAt: faker.datatype.boolean({ probability: 0.05 })
      ? faker.date.recent({ days: 30 })
      : undefined,
    deleteFlag: faker.datatype.boolean({ probability: 0.05 }),
    ...overrides,
  }) as AccountEntity;

/**
 * Create multiple mock accounts
 */
export const createMockAccounts = (
  count: number,
  overrides: Partial<AccountEntity> = {},
): AccountEntity[] => {
  return Array.from({ length: count }, () => createMockAccount(overrides));
};

/**
 * Generate seed accounts for development
 */
export const generateSeedAccounts = (users: any[]): AccountEntity[] => {
  return users.map((user, index) =>
    createMockAccount({
      id: faker.string.uuid(),
      username: `user${index + 1}`,
      email: `user${index + 1}@example.com`,
      user: user,
    }),
  );
};

/**
 * Create account with specific states for testing
 */
export const createActiveAccount = (
  overrides: Partial<AccountEntity> = {},
): AccountEntity =>
  createMockAccount({
    isActive: true,
    lastLoginAt: faker.date.recent({ days: 1 }),
    deleteFlag: false,
    deletedAt: undefined,
    ...overrides,
  });

export const createInactiveAccount = (
  overrides: Partial<AccountEntity> = {},
): AccountEntity =>
  createMockAccount({
    isActive: false,
    lastLoginAt: undefined,
    ...overrides,
  });

export const createNewAccount = (
  overrides: Partial<AccountEntity> = {},
): AccountEntity =>
  createMockAccount({
    lastLoginAt: undefined,
    version: 0,
    passwordUpdatedAt: faker.date.recent({ days: 1 }),
    createAt: faker.date.recent({ days: 1 }),
    ...overrides,
  });

export const createDeletedAccount = (
  overrides: Partial<AccountEntity> = {},
): AccountEntity =>
  createMockAccount({
    deleteFlag: true,
    deletedAt: faker.date.recent({ days: 30 }),
    isActive: false,
    ...overrides,
  });
