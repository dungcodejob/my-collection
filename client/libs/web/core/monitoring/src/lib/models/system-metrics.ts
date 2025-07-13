/**
 * System metrics and monitoring data interfaces
 */

/**
 * Interface cho dữ liệu metrics hệ thống
 */
export interface SystemMetrics {
  cpuUsage: number; // %
  memoryUsage: number; // %
  networkLatency: number; // ms
  responseTime: number; // ms
  activeUsers: number;
  errorCount: number;
  timestamp: Date;
}

/**
 * Interface cho log lỗi
 */
export interface ErrorLog {
  id: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  component?: string;
  type?: string;
  source?: string;
  stackTrace?: string;
  userId?: string;
}

// PerformanceMetric has been moved to monitoring-performance.ts to avoid duplication
// Import it from there: import { PerformanceMetric } from './monitoring-performance';
