// Environment Types
export enum Environment {
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production",
}

// Environment Configuration Interface
export type EnvironmentConfig = {
  production: boolean;
  environment: Environment;
  apiUrl: string;
  appName: string;
  version: string;
  enableLogging: boolean;
  enableAnalytics: boolean;
};

// Default Environment Settings
export const DEFAULT_ENVIRONMENT_CONFIG: EnvironmentConfig = {
  production: false,
  environment: Environment.DEVELOPMENT,
  apiUrl: "http://localhost:3000/api",
  appName: "My Collection",
  version: "1.0.0",
  enableLogging: true,
  enableAnalytics: false,
};

// Environment-specific configurations
export const ENVIRONMENT_CONFIGS: Record<Environment, Partial<EnvironmentConfig>> = {
  [Environment.DEVELOPMENT]: {
    production: false,
    apiUrl: "http://localhost:3000/api",
    enableLogging: true,
    enableAnalytics: false,
  },
  [Environment.STAGING]: {
    production: false,
    apiUrl: "https://staging-api.mycollection.com/api",
    enableLogging: true,
    enableAnalytics: true,
  },
  [Environment.PRODUCTION]: {
    production: true,
    apiUrl: "https://api.mycollection.com/api",
    enableLogging: false,
    enableAnalytics: true,
  },
};

// Helper function to get environment config
export const getEnvironmentConfig = (env: Environment): EnvironmentConfig => {
  return {
    ...DEFAULT_ENVIRONMENT_CONFIG,
    ...ENVIRONMENT_CONFIGS[env],
  };
};

// Helper function to detect current environment
export const getCurrentEnvironment = (): Environment => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
      return Environment.DEVELOPMENT;
    }

    if (hostname.includes("staging")) {
      return Environment.STAGING;
    }

    return Environment.PRODUCTION;
  }

  return Environment.DEVELOPMENT;
};
