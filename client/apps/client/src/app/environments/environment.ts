import { MCConfig } from "@client/web-core-config";

export const environment: MCConfig = {
  mode: "dev",
  development: true,
  apiBaseUrl: "http://localhost:3000/api",
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
