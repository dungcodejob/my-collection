// import * as Sentry from '@sentry/angular';
// Note: Uncomment and install @sentry/angular when ready to use
// For now, we'll use type-safe mocks
type SentryEvent = any;
type SentryScope = any;
type SentryTransactionType = any;
type SentryLevel = "debug" | "info" | "warning" | "error" | "fatal";
type SentryBreadcrumbLevel = "debug" | "info" | "warning" | "error" | "fatal";

// Mock Sentry object for development
const Sentry = {
  init: (config: any) => console.log("Sentry.init called with:", config),
  captureException: (error: any, scope?: any) =>
    console.log("Sentry.captureException:", error),
  captureMessage: (message: string, level?: any) =>
    console.log("Sentry.captureMessage:", message, level),
  withScope: (callback: (scope: any) => void) => {
    const mockScope = {
      setContext: (key: string, value: any) =>
        console.log("Scope.setContext:", key, value),
      setTag: (key: string, value: string) => console.log("Scope.setTag:", key, value),
      setLevel: (level: any) => console.log("Scope.setLevel:", level),
      setUser: (user: any) => console.log("Scope.setUser:", user),
      setExtra: (key: string, value: any) => console.log("Scope.setExtra:", key, value),
    };
    callback(mockScope);
  },
  startTransaction: (context: any) => ({
    setName: (name: string) => console.log("Transaction.setName:", name),
    setStatus: (status: string) => console.log("Transaction.setStatus:", status),
    setData: (key: string, value: any) => console.log("Transaction.setData:", key, value),
    setTag: (key: string, value: string) =>
      console.log("Transaction.setTag:", key, value),
    finish: () => console.log("Transaction.finish"),
  }),
  setUser: (user: any) => console.log("Sentry.setUser:", user),
  setContext: (key: string, value: any) => console.log("Sentry.setContext:", key, value),
  setTag: (key: string, value: string) => console.log("Sentry.setTag:", key, value),
  addBreadcrumb: (breadcrumb: any) => console.log("Sentry.addBreadcrumb:", breadcrumb),
  flush: (timeout?: number) => Promise.resolve(true),
  close: (timeout?: number) => Promise.resolve(true),
  browserTracingIntegration: () => ({}),
  replayIntegration: () => ({}),
};

import { SentryTransactionImpl } from "../data-access/transactions";
import {
  MonitoringBreadcrumb,
  MonitoringBreadcrumbLevel,
  MonitoringConfig,
  MonitoringErrorContext,
  MonitoringErrorData,
  MonitoringErrorLevel,
  MonitoringPerformanceData,
  MonitoringProvider,
  MonitoringTransactionContext,
  MonitoringUserContext,
} from "../models";

/**
 * Sentry implementation of MonitoringProvider
 * This adapter allows Sentry to be used through the abstract monitoring interface
 */
export class SentryProvider implements MonitoringProvider {
  readonly name = "sentry";
  readonly version = "1.0.0";

  private initialized = false;
  private config?: MonitoringConfig;

  async initialize(config: MonitoringConfig): Promise<void> {
    try {
      this.config = config;

      // Initialize Sentry with provided config
      Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        debug: config.debug || false,
        tracesSampleRate: config.sampleRate || 1.0,
        integrations: [
          Sentry.browserTracingIntegration(),
          ...(config.enableReplay ? [Sentry.replayIntegration()] : []),
        ],
        replaysSessionSampleRate: config.enableReplay ? 0.1 : 0,
        beforeSend: (event: any) => {
          if (config.debug) {
            console.log("Sentry Event:", event);
          }
          return event;
        },
      });

      this.initialized = true;
      console.log("Sentry provider initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Sentry provider:", error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async captureError(error: MonitoringErrorData): Promise<void> {
    if (!this.initialized) {
      throw new Error("Sentry provider not initialized");
    }

    Sentry.withScope((scope: SentryScope) => {
      // Set level
      scope.setLevel(this.mapErrorLevelToSentry(error.level));

      // Set context
      if (error.component) {
        scope.setTag("component", error.component);
      }
      if (error.source) {
        scope.setTag("source", error.source);
      }
      if (error.userId) {
        scope.setUser({ id: error.userId });
      }
      if (error.sessionId) {
        scope.setTag("sessionId", error.sessionId);
      }

      // Set extra data
      if (error.metadata) {
        Object.entries(error.metadata).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }

      // Set timestamp
      scope.setExtra("timestamp", error.timestamp.toISOString());

      // Capture the error
      Sentry.captureMessage(error.message, this.mapErrorLevelToSentry(error.level));
    });
  }

  async captureException(
    exception: Error,
    context?: MonitoringErrorContext
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error("Sentry provider not initialized");
    }

    Sentry.withScope((scope: SentryScope) => {
      if (context) {
        // Set level
        if (context.level) {
          scope.setLevel(this.mapErrorLevelToSentry(context.level));
        }

        // Set tags
        if (context.tags) {
          Object.entries(context.tags).forEach(([key, value]) => {
            scope.setTag(key, value);
          });
        }

        // Set user context
        if (context.userId) {
          scope.setUser({ id: context.userId });
        }

        // Set extra data
        if (context.extra) {
          Object.entries(context.extra).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }

        // Set component context
        if (context.component) {
          scope.setTag("component", context.component);
        }

        if (context.sessionId) {
          scope.setTag("sessionId", context.sessionId);
        }
      }

      Sentry.captureException(exception);
    });
  }

  async recordPerformance(metric: MonitoringPerformanceData): Promise<void> {
    if (!this.initialized) {
      throw new Error("Sentry provider not initialized");
    }

    // Add breadcrumb for performance metric
    Sentry.addBreadcrumb({
      message: `Performance: ${metric.name}`,
      category: "performance",
      level: "info",
      data: {
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        type: metric.type,
        timestamp: metric.timestamp.toISOString(),
        ...metric.metadata,
      },
    });

    // If threshold is exceeded, capture as warning
    if (metric.threshold && metric.value > metric.threshold) {
      Sentry.withScope((scope: SentryScope) => {
        scope.setLevel("warning");
        scope.setTag("performance_issue", "threshold_exceeded");
        scope.setTag("metric_name", metric.name);
        scope.setTag("metric_type", metric.type);
        scope.setExtra("metric_value", metric.value);
        scope.setExtra("threshold", metric.threshold);
        scope.setExtra("unit", metric.unit);

        Sentry.captureMessage(
          `Performance threshold exceeded: ${metric.name} ` +
            `(${metric.value}${metric.unit} > ${metric.threshold}${metric.unit})`,
          "warning"
        );
      });
    }
  }

  startTransaction(
    name: string,
    context?: MonitoringTransactionContext
  ): SentryTransactionImpl {
    if (!this.initialized) {
      throw new Error("Sentry provider not initialized");
    }

    const transaction = Sentry.startTransaction({
      name,
      description: context?.description,
      tags: context?.tags,
      data: context?.data,
    });

    return new SentryTransactionImpl(transaction);
  }

  setUser(user: MonitoringUserContext): void {
    if (!this.initialized) {
      throw new Error("Sentry provider not initialized");
    }

    Sentry.setUser({
      ...user,
      id: user.id,
      email: user.email,
      username: user.username,
      ip_address: user.ipAddress,
      segment: user.segment,
    });
  }

  clearUser(): void {
    if (!this.initialized) {
      throw new Error("Sentry provider not initialized");
    }

    Sentry.setUser(null);
  }

  setContext(key: string, value: any): void {
    if (!this.initialized) {
      throw new Error("Sentry provider not initialized");
    }

    Sentry.setContext(key, value);
  }

  setTag(key: string, value: string): void {
    if (!this.initialized) {
      throw new Error("Sentry provider not initialized");
    }

    Sentry.setTag(key, value);
  }

  addBreadcrumb(breadcrumb: MonitoringBreadcrumb): void {
    if (!this.initialized) {
      throw new Error("Sentry provider not initialized");
    }

    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category,
      level: breadcrumb.level
        ? this.mapBreadcrumbLevelToSentry(breadcrumb.level)
        : "info",
      timestamp: breadcrumb.timestamp ? breadcrumb.timestamp.getTime() / 1000 : undefined,
      data: breadcrumb.data,
    });
  }

  async flush(timeout = 5000): Promise<boolean> {
    if (!this.initialized) {
      return false;
    }

    try {
      return await Sentry.flush(timeout);
    } catch (error) {
      console.error("Failed to flush Sentry:", error);
      return false;
    }
  }

  async close(timeout = 5000): Promise<boolean> {
    if (!this.initialized) {
      return true;
    }

    try {
      await Sentry.close(timeout);
      this.initialized = false;
      return true;
    } catch (error) {
      console.error("Failed to close Sentry:", error);
      return false;
    }
  }

  private mapErrorLevelToSentry(level: MonitoringErrorLevel): SentryLevel {
    const mapping: Record<MonitoringErrorLevel, SentryLevel> = {
      debug: "debug",
      info: "info",
      warning: "warning",
      error: "error",
      fatal: "fatal",
    };
    return mapping[level] || "error";
  }

  private mapBreadcrumbLevelToSentry(
    level: MonitoringBreadcrumbLevel
  ): SentryBreadcrumbLevel {
    const mapping: Record<MonitoringBreadcrumbLevel, SentryBreadcrumbLevel> = {
      debug: "debug",
      info: "info",
      warning: "warning",
      error: "error",
    };
    return mapping[level] || "info";
  }
}
