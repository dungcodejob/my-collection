/**
 * Error monitoring related interfaces and types
 */

export type MonitoringErrorData = {
  message: string;
  level: MonitoringErrorLevel;
  timestamp: Date;
  source?: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export type MonitoringErrorContext = {
  component?: string;
  userId?: string;
  sessionId?: string;
  extra?: Record<string, any>;
  tags?: Record<string, string>;
  level?: MonitoringErrorLevel;
}

export type MonitoringErrorLevel = "debug" | "info" | "warning" | "error" | "fatal";
