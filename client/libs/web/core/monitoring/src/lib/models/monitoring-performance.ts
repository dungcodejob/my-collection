/**
 * Performance monitoring related interfaces and types
 */

export interface MonitoringPerformanceData {
  id?: string; // Optional for new monitoring system, required for legacy
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  type?: MonitoringPerformanceType; // Optional for legacy compatibility
  threshold?: number;
  component?: string; // From legacy PerformanceMetric
  metadata?: Record<string, any>;
}

export type MonitoringPerformanceType =
  | "web-vital"
  | "custom"
  | "navigation"
  | "resource";

// Legacy aliases for backward compatibility
export type PerformanceData = MonitoringPerformanceData;
export type PerformanceType = MonitoringPerformanceType;
