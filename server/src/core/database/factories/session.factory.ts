import { AccountEntity, SessionEntity, UserEntity } from '@app/entities';
import { faker } from '@faker-js/faker';
import { SessionCreateInput } from 'src/modules/session';
import { createMockAccount } from './account.factory';
import { createMockTenant } from './tenant.factory';
import { createMockUser } from './user.factory';

/**
 * Session Entity Factory using Faker.js for realistic test data
 * Can be used in both testing and development environments
 */

/**
 * Create a mock Session entity with realistic data
 */
export const createMockSession = (
  overrides: Partial<SessionEntity> = {},
): SessionEntity =>
  ({
    id: faker.string.uuid(),
    deviceId: faker.string.uuid(),
    expiresAt: faker.datatype.boolean({ probability: 0.8 })
      ? faker.date.soon({ days: 30 })
      : undefined,
    lastAccessedAt: faker.date.recent({ days: 1 }),
    isActive: faker.datatype.boolean({ probability: 0.7 }), // 70% chance of being active
    refreshTokenHash: faker.datatype.boolean({ probability: 0.8 })
      ? faker.string.alphanumeric(64)
      : undefined,
    refreshCount: faker.number.int({ min: 0, max: 10 }),
    ipAddress: faker.datatype.boolean({ probability: 0.9 })
      ? faker.internet.ip()
      : undefined,
    userAgent: faker.datatype.boolean({ probability: 0.9 })
      ? faker.internet.userAgent()
      : undefined,
    deviceType: faker.datatype.boolean({ probability: 0.8 })
      ? faker.helpers.arrayElement([
          'Desktop',
          'Mobile',
          'Tablet',
          'Smart TV',
          'Gaming Console',
        ])
      : undefined,
    location: faker.datatype.boolean({ probability: 0.7 })
      ? `${faker.location.city()}, ${faker.location.country()}`
      : undefined,
    createAt: faker.date.recent({ days: 30 }),
    updateAt: faker.date.recent({ days: 1 }),
    deletedAt: faker.datatype.boolean({ probability: 0.05 })
      ? faker.date.recent({ days: 30 })
      : undefined,
    deleteFlag: faker.datatype.boolean({ probability: 0.05 }),
    ...overrides,
  }) as SessionEntity;

export const createMockSessionInput = (
  overrides: Partial<SessionCreateInput> = {},
): SessionCreateInput => {
  return {
    tenant: createMockTenant(),
    account: createMockAccount(),
    user: createMockUser(),
    refreshTokenHash: faker.string.alphanumeric(64),
    userAgent: faker.internet.userAgent(),
    ipAddress: faker.internet.ip(),
    deviceType: faker.helpers.arrayElement([
      'Desktop',
      'Mobile',
      'Tablet',
      'Smart TV',
      'Gaming Console',
    ]),
    ...overrides,
  };
};

export const createMockSessionByInput = (
  overrides: Partial<SessionCreateInput> = {},
): SessionEntity => {
  const input = createMockSessionInput(overrides);

  return createMockSession({
    expiresAt: overrides.expiresAt as Date,
    account: createMockAccount(overrides.account as Partial<AccountEntity>),
    user: createMockUser(overrides.user as Partial<UserEntity>),
    refreshTokenHash: input.refreshTokenHash || faker.string.alphanumeric(64),
    userAgent: input.userAgent || faker.internet.userAgent(),
    ipAddress: input.ipAddress || faker.internet.ip(),
    deviceType:
      input.deviceType ||
      faker.helpers.arrayElement([
        'Desktop',
        'Mobile',
        'Tablet',
        'Smart TV',
        'Gaming Console',
      ]),
    lastAccessedAt: input.lastAccessedAt
      ? new Date(input.lastAccessedAt)
      : faker.date.anytime(),
  });
};

/**
 * Create multiple mock sessions
 */
export const createMockSessions = (
  count: number,
  overrides: Partial<SessionEntity> = {},
): SessionEntity[] => {
  return Array.from({ length: count }, () => createMockSession(overrides));
};

/**
 * Generate seed sessions for development
 */
export const generateSeedSessions = (
  accounts: any[],
  users: any[],
  sessionsPerUser: number = 2,
): SessionEntity[] => {
  const sessions: SessionEntity[] = [];

  accounts.forEach((account, accountIndex) => {
    const user = users[accountIndex] || users[0]; // Fallback to first user

    for (let i = 0; i < sessionsPerUser; i++) {
      sessions.push(
        createMockSession({
          id: faker.string.uuid(),
          deviceId: faker.string.uuid(),
          account: account,
          user: user,
        }),
      );
    }
  });

  return sessions;
};

/**
 * Create sessions with specific device types for testing
 */
export const createMobileSession = (
  overrides: Partial<SessionEntity> = {},
): SessionEntity =>
  createMockSession({
    deviceType: 'Mobile',
    deviceId: faker.string.uuid(),
    userAgent: faker.helpers.arrayElement([
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
    ]),
    ...overrides,
  });

export const createDesktopSession = (
  overrides: Partial<SessionEntity> = {},
): SessionEntity =>
  createMockSession({
    deviceType: 'Desktop',
    deviceId: faker.string.uuid(),
    userAgent: faker.helpers.arrayElement([
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    ]),
    ...overrides,
  });

export const createTabletSession = (
  overrides: Partial<SessionEntity> = {},
): SessionEntity =>
  createMockSession({
    deviceType: 'Tablet',
    deviceId: faker.string.uuid(),
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    ...overrides,
  });

/**
 * Create sessions with specific states for testing
 */
export const createActiveSession = (
  overrides: Partial<SessionEntity> = {},
): SessionEntity =>
  createMockSession({
    isActive: true,
    expiresAt: faker.date.soon({ days: 30 }),
    lastAccessedAt: faker.date.recent({ days: 1 }),
    refreshTokenHash: faker.string.alphanumeric(64),
    deleteFlag: false,
    deletedAt: undefined,
    ...overrides,
  });

export const createExpiredSession = (
  overrides: Partial<SessionEntity> = {},
): SessionEntity =>
  createMockSession({
    isActive: false,
    expiresAt: faker.date.soon({ days: 1 }),
    lastAccessedAt: faker.date.soon({ days: 2 }),
    refreshTokenHash: undefined,
    ...overrides,
  });

export const createInactiveSession = (
  overrides: Partial<SessionEntity> = {},
): SessionEntity =>
  createMockSession({
    isActive: false,
    expiresAt: faker.date.soon({ days: 30 }),
    lastAccessedAt: faker.date.recent({ days: 7 }),
    refreshTokenHash: undefined,
    ...overrides,
  });

export const createValidSession = (
  overrides: Partial<SessionEntity> = {},
): SessionEntity =>
  createMockSession({
    isActive: true,
    expiresAt: faker.date.soon({ days: 7 }),
    lastAccessedAt: faker.date.recent({ days: 1 }),
    refreshTokenHash: faker.string.alphanumeric(64),
    refreshCount: faker.number.int({ min: 0, max: 3 }),
    deleteFlag: false,
    deletedAt: undefined,
    ...overrides,
  });

export const createDeletedSession = (
  overrides: Partial<SessionEntity> = {},
): SessionEntity =>
  createMockSession({
    isActive: false,
    deleteFlag: true,
    deletedAt: faker.date.recent({ days: 30 }),
    expiresAt: faker.date.recent({ days: 35 }),
    refreshTokenHash: undefined,
    ...overrides,
  });
