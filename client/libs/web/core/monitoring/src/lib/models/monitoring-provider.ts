import { MonitoringBreadcrumb } from "./monitoring-breadcrumb";
import { MonitoringConfig } from "./monitoring-config";
import { MonitoringErrorContext, MonitoringErrorData } from "./monitoring-error";
import { MonitoringPerformanceData } from "./monitoring-performance";
import {
  MonitoringTransaction,
  MonitoringTransactionContext,
} from "./monitoring-transaction";
import { MonitoringUserContext } from "./monitoring-user";

/**
 * Abstract interface for monitoring providers
 * This allows loose coupling between monitoring logic and specific implementations
 */
export type MonitoringProvider = {
  readonly name: string;
  readonly version: string;

  // Initialization
  initialize(config: MonitoringConfig): Promise<void>;
  isInitialized(): boolean;

  // Error Monitoring
  captureError(error: MonitoringErrorData): Promise<void>;
  captureException(exception: Error, context?: MonitoringErrorContext): Promise<void>;

  // Performance Monitoring
  recordPerformance(metric: MonitoringPerformanceData): Promise<void>;
  startTransaction(
    name: string,
    context?: MonitoringTransactionContext
  ): MonitoringTransaction;

  // User Context
  setUser(user: MonitoringUserContext): void;
  clearUser(): void;

  // Custom Context
  setContext(key: string, value: any): void;
  setTag(key: string, value: string): void;
  addBreadcrumb(breadcrumb: MonitoringBreadcrumb): void;

  // Lifecycle
  flush(timeout?: number): Promise<boolean>;
  close(timeout?: number): Promise<boolean>;
};
