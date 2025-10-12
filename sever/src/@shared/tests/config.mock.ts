import { AppConfig } from '@app/configs';

/**
 * Mock AppConfig for testing
 * Provides default test configuration values
 */
export const mockAppConfig: AppConfig = {
  testing: true,
  appId: 'test_app_id',
  client: 'http://localhost:4200',
  host: 'localhost',
  port: 3000,
  scheme: 'http',
  throttlerTtl: 60,
  throttlerLimit: 20,
  account: {
    username: 'test_user',
    password: 'test_password',
  },
  get domain() {
    return `${this.scheme}://${this.host}:${this.port}`;
  },
};

/**
 * Mock ConfigService for testing
 * Returns predefined values for common config keys
 */
export const mockConfigService = {
  get: jest.fn((key: string) => {
    const configMap: Record<string, any> = {
      // App config
      'app.testing': mockAppConfig.testing,
      'app.appId': mockAppConfig.appId,
      'app.client': mockAppConfig.client,
      'app.host': mockAppConfig.host,
      'app.port': mockAppConfig.port,
      'app.scheme': mockAppConfig.scheme,
      'app.domain': mockAppConfig.domain,
      'app.throttlerTtl': mockAppConfig.throttlerTtl,
      'app.throttlerLimit': mockAppConfig.throttlerLimit,
      'app.account.username': mockAppConfig.account.username,
      'app.account.password': mockAppConfig.account.password,

      // Database config
      'database.host': 'localhost',
      'database.port': 5432,
      'database.username': 'test_user',
      'database.password': 'test_password',
      'database.database': 'test_db',

      // JWT config
      'jwt.secret': 'test-jwt-secret',
      'jwt.expiresIn': '1h',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.refreshExpiresIn': '7d',

      // Cookie config
      'cookie.secret': 'test-cookie-secret',
      'cookie.httpOnly': true,
      'cookie.secure': false,
      'cookie.sameSite': 'lax',
      'cookie.maxAge': 604800000, // 7 days
    };

    return configMap[key] || null;
  }),

  getOrThrow: jest.fn((key: string) => {
    const value = mockConfigService.get(key);
    if (value === null || value === undefined) {
      throw new Error(`Configuration key "${key}" does not exist`);
    }
    return value;
  }),
};

/**
 * Mock appConfig registerAs function
 * Returns the mock configuration
 */
export const mockAppConfigFactory = jest.fn(() => mockAppConfig);

/**
 * Mock for @nestjs/config module
 * Use this in your test files to mock the entire config module
 */
export const mockConfigModule = {
  ConfigModule: {
    forRoot: jest.fn().mockReturnValue({
      module: 'ConfigModule',
      providers: [],
      exports: [],
    }),
    forFeature: jest.fn().mockReturnValue({
      module: 'ConfigModule',
      providers: [],
      exports: [],
    }),
  },
  ConfigService: jest.fn().mockImplementation(() => mockConfigService),
  registerAs: jest
    .fn()
    .mockImplementation((token: string, factory: () => any) => {
      return {
        KEY: token,
        asProvider: () => ({
          provide: token,
          useFactory: factory,
        }),
      };
    }),
};

/**
 * Helper function to create custom mock config
 * Useful when you need specific config values for certain tests
 */
export const createMockAppConfig = (
  overrides: Partial<AppConfig> = {},
): AppConfig => {
  return {
    ...mockAppConfig,
    ...overrides,
    account: {
      ...mockAppConfig.account,
      ...(overrides.account || {}),
    },
    get domain() {
      const scheme = overrides.scheme || mockAppConfig.scheme;
      const host = overrides.host || mockAppConfig.host;
      const port = overrides.port || mockAppConfig.port;
      return `${scheme}://${host}:${port}`;
    },
  };
};

/**
 * Helper function to create mock ConfigService with custom values
 */
export const createMockConfigService = (
  customConfig: Record<string, any> = {},
) => {
  return {
    get: jest.fn((key: string) => {
      return customConfig[key] !== undefined
        ? customConfig[key]
        : mockConfigService.get(key);
    }),
    getOrThrow: jest.fn((key: string) => {
      const value =
        customConfig[key] !== undefined
          ? customConfig[key]
          : mockConfigService.get(key);
      if (value === null || value === undefined) {
        throw new Error(`Configuration key "${key}" does not exist`);
      }
      return value;
    }),
  };
};

/**
 * Environment-specific mock configs
 */
export const mockConfigs = {
  development: createMockAppConfig({
    testing: true,
    scheme: 'http',
    host: 'localhost',
    port: 3000,
  }),

  test: createMockAppConfig({
    testing: true,
    scheme: 'http',
    host: 'localhost',
    port: 3001,
    appId: 'test_app',
  }),

  production: createMockAppConfig({
    testing: false,
    scheme: 'https',
    host: 'api.example.com',
    port: 443,
    throttlerTtl: 300,
    throttlerLimit: 100,
  }),
};
