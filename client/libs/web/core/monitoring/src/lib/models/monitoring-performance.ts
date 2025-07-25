/**
 * Performance monitoring related interfaces and types
 */

export type MonitoringPerformanceData = {
  id?: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  type?: MonitoringPerformanceType;
  threshold?: number;
  component?: string;
  metadata?: Record<string, unknown>;
};

export const monitoringPerformanceTypes = {
  WebVital: "web-vital",
  Custom: "custom",
  Navigation: "navigation",
  Resource: "resource",
} as const;

export type MonitoringPerformanceType =
  (typeof monitoringPerformanceTypes)[keyof typeof monitoringPerformanceTypes];
