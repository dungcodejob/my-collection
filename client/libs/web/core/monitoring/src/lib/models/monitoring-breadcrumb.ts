/**
 * Breadcrumb interface and types for monitoring
 */

export type MonitoringBreadcrumb = {
  message: string;
  category?: string;
  level?: MonitoringBreadcrumbLevel;
  timestamp?: Date;
  data?: Record<string, unknown>;
};

export const monitoringBreadcrumbLevels = {
  Debug: "debug",
  Info: "info",
  Warning: "warning",
  Error: "error",
} as const;

export type MonitoringBreadcrumbLevel =
  (typeof monitoringBreadcrumbLevels)[keyof typeof monitoringBreadcrumbLevels];
