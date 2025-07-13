/**
 * Breadcrumb interface and types for monitoring
 */

export type MonitoringBreadcrumb = {
  message: string;
  category?: string;
  level?: MonitoringBreadcrumbLevel;
  timestamp?: Date;
  data?: Record<string, any>;
};

export type MonitoringBreadcrumbLevel = "debug" | "info" | "warning" | "error";
