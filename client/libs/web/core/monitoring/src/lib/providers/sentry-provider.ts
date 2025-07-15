import * as Sentry from "@sentry/angular";
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
import { SentryTransaction } from "../transactions/sentry-transaction";

// Type aliases for Sentry types
type SentryErrorEvent = Sentry.ErrorEvent;
type SentryEventHint = Sentry.EventHint;
type SentryScope = Sentry.Scope;
type SentryLevel = Sentry.SeverityLevel;
type SentryBreadcrumbLevel = Sentry.SeverityLevel;

/**
 * Sentry implementation of MonitoringProvider
 * This adapter allows Sentry to be used through the abstract monitoring interface
 */
export class SentryProvider implements MonitoringProvider {
  readonly name = "sentry";
  readonly version = "1.0.0";

  private _initialized = false;
  private _config?: MonitoringConfig;

  async initialize(config: MonitoringConfig): Promise<void> {
    try {
      this._config = config;
      console.log("Initializing Sentry provider with config:", this._config);
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
        beforeSend: (
          event: SentryErrorEvent,
          hint?: SentryEventHint
        ): Sentry.ErrorEvent | Promise<Sentry.ErrorEvent | null> | null => {
          if (config.debug) {
            console.log("Sentry Event:", event);
            console.log("Sentry Hint:", hint);
          }
          return event;
        },
      });

      this._initialized = true;
      console.log("Sentry provider initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Sentry provider:", error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this._initialized;
  }

  async captureError(error: MonitoringErrorData): Promise<void> {
    if (!this._initialized) {
      throw new Error("Sentry provider not initialized");
    }

    Sentry.withScope((scope: SentryScope) => {
      // Set level
      scope.setLevel(this.mapErrorLevelToSentry(error.level || "error"));

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
      if (error.timestamp) {
        scope.setExtra("timestamp", error.timestamp.toISOString());
      }

      // Capture the error
      Sentry.captureMessage(
        error.message,
        this.mapErrorLevelToSentry(error.level || "error")
      );
    });
  }

  async captureException(
    exception: Error,
    context?: MonitoringErrorContext
  ): Promise<void> {
    if (!this._initialized) {
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
        if (context.metadata) {
          Object.entries(context.metadata).forEach(([key, value]) => {
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
    if (!this._initialized) {
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
  ): SentryTransaction {
    if (!this._initialized) {
      throw new Error("Sentry provider not initialized");
    }

    // Prepare attributes with proper typing
    const attributes: Record<string, string | number | boolean> = {};
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          attributes[key] = value;
        }
      });
    }
    if (context?.data) {
      Object.entries(context.data).forEach(([key, value]) => {
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          attributes[key] = value;
        }
      });
    }

    const span = Sentry.startSpan(
      {
        name,
        op: context?.description || "custom",
        attributes,
      },
      value => value
    );

    return new SentryTransaction(span);
  }

  setUser(user: MonitoringUserContext): void {
    if (!this._initialized) {
      throw new Error("Sentry provider not initialized");
    }

    const sentryUser: Sentry.User = {
      id: user.id,
      email: user.email,
      username: user.username,
      ip_address: user.ipAddress,
      segment: user.segment,
    };

    Sentry.setUser(sentryUser);
  }

  clearUser(): void {
    if (!this._initialized) {
      throw new Error("Sentry provider not initialized");
    }

    Sentry.setUser(null);
  }

  setContext(key: string, value: unknown): void {
    if (!this._initialized) {
      throw new Error("Sentry provider not initialized");
    }

    // Ensure value is a valid context object
    const contextValue =
      value && typeof value === "object" ? (value as Record<string, unknown>) : { value };
    Sentry.setContext(key, contextValue);
  }

  setTag(key: string, value: string): void {
    if (!this._initialized) {
      throw new Error("Sentry provider not initialized");
    }

    Sentry.setTag(key, value);
  }

  addBreadcrumb(breadcrumb: MonitoringBreadcrumb): void {
    if (!this._initialized) {
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
    if (!this._initialized) {
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
    if (!this._initialized) {
      return true;
    }

    try {
      await Sentry.close(timeout);
      this._initialized = false;
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
