import { Role, UserEntity } from '@app/entities';
import { faker } from '@faker-js/faker';
import { createMockAccount } from './account.factory';
import { createMockSessions } from './session.factory';

/**
 * User Entity Factory using Faker.js for realistic test data
 * Can be used in both testing and development environments
 */

/**
 * Create a mock User entity with realistic data
 */
export const createMockUser = (
  overrides: Partial<UserEntity> = {},
): UserEntity =>
  ({
    id: faker.number.int({ min: 1, max: 10000 }),
    name: faker.person.fullName(),
    role: Role.USER,
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent({ days: 30 }),
    ...overrides,
  }) as UserEntity;

/**
 * Create multiple mock users
 */
export const createMockUsers = (
  count: number,
  overrides: Partial<UserEntity> = {},
): UserEntity[] => {
  return Array.from({ length: count }, () => createMockUser(overrides));
};

/**
 * Predefined user types for common test scenarios
 */
export const createAdminUser = (
  overrides: Partial<UserEntity> = {},
): UserEntity =>
  createMockUser({
    name: 'Admin User',
    role: Role.ADMIN,
    ...overrides,
  });

export const createRegularUser = (
  overrides: Partial<UserEntity> = {},
): UserEntity =>
  createMockUser({
    name: 'Regular User',
    role: Role.USER,
    ...overrides,
  });

/**
 * Seed data generators for development
 */
export const generateSeedUsers = (count: number = 50): UserEntity[] => {
  const users: UserEntity[] = [];

  // Add some predefined users
  users.push(createAdminUser({ id: faker.string.uuid() }));
  users.push(createRegularUser({ id: faker.string.uuid() }));

  // Add random users
  for (let i = 4; i <= count; i++) {
    users.push(createMockUser({ id: faker.string.uuid() }));
  }

  return users;
};

/**
 * User Relations Factory - Create users with related entities
 */

/**
 * Create a complete user with account and sessions
 */
export const createMockUserWithRelations = (
  userOverrides: Partial<UserEntity> = {},
  accountOverrides: Partial<any> = {},
  sessionCount: number = 2,
): {
  user: UserEntity;
  account: any;
  sessions: any[];
} => {
  const user = createMockUser(userOverrides);
  const account = createMockAccount({
    user: user,
    ...accountOverrides,
  });
  const sessions = createMockSessions(sessionCount, {
    user: user,
    account: account,
  });

  return {
    user,
    account,
    sessions,
  };
};

/**
 * Create a complete user with active account and sessions
 */
export const createActiveUserWithRelations = (
  userOverrides: Partial<UserEntity> = {},
  sessionCount: number = 2,
): {
  user: UserEntity;
  account: any;
  sessions: any[];
} => {
  return createMockUserWithRelations(
    userOverrides,
    {
      isActive: true,
    },
    sessionCount,
  );
};

/**
 * Create a user with inactive account
 */
export const createInactiveUserWithRelations = (
  userOverrides: Partial<UserEntity> = {},
): {
  user: UserEntity;
  account: any;
  sessions: any[];
} => {
  return createMockUserWithRelations(
    userOverrides,
    {
      isActive: false,
    },
    0, // No active sessions for inactive account
  );
};

/**
 * Create multiple users with their complete relations
 */
export const createMockUsersWithRelations = (
  count: number,
  sessionsPerUser: number = 2,
): Array<{
  user: UserEntity;
  account: any;
  sessions: any[];
}> => {
  return Array.from({ length: count }, (_, index) =>
    createMockUserWithRelations(
      { id: `user-${index + 1}` },
      { id: `account-${index + 1}` },
      sessionsPerUser,
    ),
  );
};

/**
 * Create a family of related entities for comprehensive testing
 */
export const createTestDataSet = (): {
  adminUser: {
    user: UserEntity;
    account: any;
    sessions: any[];
  };
  regularUsers: Array<{
    user: UserEntity;
    account: any;
    sessions: any[];
  }>;
  inactiveUser: {
    user: UserEntity;
    account: any;
    sessions: any[];
  };
} => {
  return {
    adminUser: createActiveUserWithRelations(
      {
        id: 'admin-1',
        name: 'Admin User',
      },
      3, // Admin has more sessions
    ),
    regularUsers: createMockUsersWithRelations(5, 2), // 5 regular users with 2 sessions each
    inactiveUser: createInactiveUserWithRelations({
      id: 'inactive-100',
      name: 'Inactive User',
    }),
  };
};
