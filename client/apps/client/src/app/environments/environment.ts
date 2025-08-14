import { MCConfig as MCLocalConfig } from "@client/web-core-config";

export const environment: MCLocalConfig = {
  mode: "prod",
  development: false,
  apiBaseUrl: "https://my-collection-api.herokuapp.com/api",
  appVersion: "1.0.0",
  apiKey: "123",
  loggingLevel: "debug",
  featureFlags: {
    enableBookmarkSync: true,
    enableCategories: true,
  },
  analytics: {
    enabled: true,
    trackingId: "123",
  },
  timeout: 10000,
  retryPolicies: {
    maxRetries: 3,
    retryDelay: 1000,
  },
};
