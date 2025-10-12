import { TenantEntity, TenantPlan, TenantStatus } from '@app/entities';
import { faker } from '@faker-js/faker';

/**
 * Tenant Entity Factory using Faker.js for realistic test data
 * Can be used in both testing and development environments
 */

/**
 * Create a mock Tenant entity with realistic data
 */
export const createMockTenant = (
  overrides: Partial<TenantEntity> = {},
): TenantEntity => {
  const companyName = faker.company.name();
  const slug = faker.helpers.slugify(companyName).toLowerCase();

  return {
    id: faker.string.uuid(),
    name: companyName,
    slug: slug,
    description: faker.company.catchPhrase(),
    status: faker.helpers.arrayElement(Object.values(TenantStatus)),
    plan: faker.helpers.arrayElement(Object.values(TenantPlan)),
    logoUrl: faker.image.avatar(),
    primaryColor: faker.color.rgb(),
    settings: {
      theme: faker.helpers.arrayElement(['light', 'dark', 'auto']),
      language: faker.helpers.arrayElement(['en', 'vi', 'fr', 'es']),
      timezone: faker.location.timeZone(),
      notifications: {
        email: faker.datatype.boolean(),
        push: faker.datatype.boolean(),
        sms: faker.datatype.boolean(),
      },
    },
    limits: {
      maxBookmarks: faker.number.int({ min: 100, max: 10000 }),
      maxCollections: faker.number.int({ min: 10, max: 1000 }),
      maxTags: faker.number.int({ min: 50, max: 5000 }),
      maxStorage: faker.number.int({ min: 100, max: 10000 }), // in MB
    },
    usage: {
      bookmarkCount: faker.number.int({ min: 0, max: 500 }),
      collectionCount: faker.number.int({ min: 0, max: 50 }),
      tagCount: faker.number.int({ min: 0, max: 200 }),
      storageUsed: faker.number.int({ min: 0, max: 1000 }), // in MB
    },
    subscriptionExpiresAt: faker.datatype.boolean({ probability: 0.7 })
      ? faker.date.future({ years: 1 })
      : undefined,
    isActive: faker.datatype.boolean({ probability: 0.9 }), // 90% chance of being active

    createAt: faker.date.past({ years: 2 }),
    updateAt: faker.date.recent({ days: 30 }),
    deletedAt: faker.datatype.boolean({ probability: 0.05 })
      ? faker.date.recent({ days: 30 })
      : undefined,
    deleteFlag: faker.datatype.boolean({ probability: 0.05 }),
    ...overrides,
  } as unknown as TenantEntity;
};

/**
 * Create multiple mock tenants
 */
export const createMockTenants = (
  count: number,
  overrides: Partial<TenantEntity> = {},
): TenantEntity[] => {
  return Array.from({ length: count }, () => createMockTenant(overrides));
};

/**
 * Generate seed tenants for development/testing
 * Note: This function requires UserEntity to be passed as parameter to avoid circular dependency
 */
export const generateSeedTenants = (users: any[]): TenantEntity[] => {
  return users.map((user, index) => {
    const tenant = createMockTenant({
      name: `${faker.company.name()} ${index + 1}`,
      slug: `tenant-${index + 1}-${faker.helpers.slugify(faker.company.name()).toLowerCase()}`,
      status: TenantStatus.ACTIVE,
      plan: faker.helpers.arrayElement([TenantPlan.FREE, TenantPlan.PREMIUM]),
      isActive: true,
      deleteFlag: false,
    });

    return tenant;
  });
};

/**
 * Create an active tenant with premium features
 */
export const createActiveTenant = (
  overrides: Partial<TenantEntity> = {},
): TenantEntity =>
  createMockTenant({
    status: TenantStatus.ACTIVE,
    plan: TenantPlan.PREMIUM,
    isActive: true,
    deleteFlag: false,
    deletedAt: undefined,
    subscriptionExpiresAt: faker.date.future({ years: 1 }),
    limits: {
      maxBookmarks: 5000,
      maxCollections: 500,
      maxTags: 2000,
      maxStorage: 5000,
    },
    ...overrides,
  });

/**
 * Create a suspended tenant
 */
export const createSuspendedTenant = (
  overrides: Partial<TenantEntity> = {},
): TenantEntity =>
  createMockTenant({
    status: TenantStatus.SUSPENDED,
    isActive: false,
    subscriptionExpiresAt: faker.date.recent({ days: 30 }),
    ...overrides,
  });

/**
 * Create a free plan tenant
 */
export const createFreeTenant = (
  overrides: Partial<TenantEntity> = {},
): TenantEntity =>
  createMockTenant({
    plan: TenantPlan.FREE,
    status: TenantStatus.ACTIVE,
    isActive: true,
    subscriptionExpiresAt: undefined,
    limits: {
      maxBookmarks: 100,
      maxCollections: 10,
      maxTags: 50,
      maxStorage: 100,
    },
    usage: {
      bookmarkCount: faker.number.int({ min: 0, max: 80 }),
      collectionCount: faker.number.int({ min: 0, max: 8 }),
      tagCount: faker.number.int({ min: 0, max: 40 }),
      storageUsed: faker.number.int({ min: 0, max: 80 }),
    },
    ...overrides,
  });

/**
 * Create an enterprise tenant
 */
export const createEnterpriseTenant = (
  overrides: Partial<TenantEntity> = {},
): TenantEntity =>
  createMockTenant({
    plan: TenantPlan.ENTERPRISE,
    status: TenantStatus.ACTIVE,
    isActive: true,
    subscriptionExpiresAt: faker.date.future({ years: 2 }),
    limits: {
      maxBookmarks: 50000,
      maxCollections: 5000,
      maxTags: 10000,
      maxStorage: 50000,
    },
    settings: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        sms: true,
      },
      customBranding: true,
      apiAccess: true,
      advancedAnalytics: true,
    },
    ...overrides,
  });

/**
 * Create a deleted tenant
 */
export const createDeletedTenant = (
  overrides: Partial<TenantEntity> = {},
): TenantEntity =>
  createMockTenant({
    deleteFlag: true,
    deletedAt: faker.date.recent({ days: 30 }),
    isActive: false,
    status: TenantStatus.INACTIVE,
    ...overrides,
  });
