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

export class MCConfig {
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

  private constructor(config: MCConfig) {
    this.development = config.development;
    this.mode = config.mode;
    this.apiBaseUrl = config.apiBaseUrl;
    this.appVersion = config.appVersion;
    this.apiKey = config.apiKey;
    this.loggingLevel = config.loggingLevel;
    this.featureFlags = config.featureFlags;
    this.analytics = config.analytics;
    this.timeout = config.timeout;
    this.retryPolicies = config.retryPolicies;
  }
}
