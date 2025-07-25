export type FeatureFlags = {
  enableBookmarkSync: boolean;
  enableCategories: boolean;
};

export type AnalyticsConfig = {
  enabled: boolean;
  trackingId: string;
};

export type RetryPolicies = {
  maxRetries: number;
  retryDelay: number;
};

export type MCLocalConfig = {
  development: boolean;
  mode: "dev" | "staging" | "prod";
  apiBaseUrl: string;
  appVersion: string;
  apiKey: string;
  loggingLevel: "debug" | "info" | "error";
  featureFlags: FeatureFlags;
  analytics: AnalyticsConfig;
  timeout: number;
  retryPolicies: RetryPolicies;
};
