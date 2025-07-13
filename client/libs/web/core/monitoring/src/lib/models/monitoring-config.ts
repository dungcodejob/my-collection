/**
 * Configuration interface for monitoring providers
 */
export type MonitoringConfig = {
  dsn?: string;
  environment: string;
  debug?: boolean;
  sampleRate?: number;
  enablePerformance?: boolean;
  enableReplay?: boolean;
  [key: string]: any; // Allow provider-specific config
};
