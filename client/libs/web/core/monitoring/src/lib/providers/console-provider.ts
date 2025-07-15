import {
  MonitoringBreadcrumb,
  MonitoringConfig,
  MonitoringErrorContext,
  MonitoringErrorData,
  MonitoringPerformanceData,
  MonitoringProvider,
  MonitoringTransaction,
  MonitoringTransactionContext,
  MonitoringUserContext,
} from "../models";
import { ConsoleTransaction } from "../transactions";

/**
 * Console implementation of MonitoringProvider
 * This provider logs everything to the browser console
 * Useful for development, testing, and as a fallback
 */
export class ConsoleProvider implements MonitoringProvider {
  readonly name = "console";
  readonly version = "1.0.0";

  private _initialized = false;
  private _config?: MonitoringConfig;
  private _userContext?: MonitoringUserContext;
  private _contextData: Record<string, unknown> = {};
  private _tags: Record<string, string> = {};
  private _breadcrumbs: MonitoringBreadcrumb[] = [];
  private _maxBreadcrumbs = 100;

  async initialize(config: MonitoringConfig): Promise<void> {
    this._config = config;
    this._initialized = true;

    console.group("🔍 Console Monitoring Provider Initialized");
    console.log("Config:", {
      environment: config.environment,
      debug: config.debug,
      sampleRate: config.sampleRate,
      enablePerformance: config.enablePerformance,
    });
    console.groupEnd();
  }

  isInitialized(): boolean {
    return this._initialized;
  }

  async captureError(error: MonitoringErrorData): Promise<void> {
    if (!this._initialized) {
      throw new Error("Console provider not initialized");
    }

    const log = this.getConsoleMethod(error.level);

    console.group(
      `🚨 Error [${error.level?.toUpperCase() || "UNKNOWN"}]: ${error.message}`
    );

    log("Timestamp:", error.timestamp?.toISOString());

    if (error.component) {
      log("Component:", error.component);
    }
    if (error.source) {
      log("Source:", error.source);
    }
    if (error.userId) {
      log("User ID:", error.userId);
    }
    if (error.sessionId) {
      log("Session ID:", error.sessionId);
    }
    if (error.metadata) {
      log("Metadata:", error.metadata);
    }

    // Show current context
    if (Object.keys(this._contextData).length > 0) {
      log("Context:", this._contextData);
    }
    if (Object.keys(this._tags).length > 0) {
      log("Tags:", this._tags);
    }

    console.groupEnd();
  }

  async captureException(
    exception: Error,
    context?: MonitoringErrorContext
  ): Promise<void> {
    if (!this._initialized) {
      throw new Error("Console provider not initialized");
    }

    const level = context?.level || "error";
    const log = this.getConsoleMethod(level);

    console.group(`💥 Exception [${level.toUpperCase()}]: ${exception.message}`);
    console.error("Exception:", exception);

    if (exception.stack) {
      log("Stack trace:", exception.stack);
    }

    if (context) {
      if (context.component) {
        log("Component:", context.component);
      }
      if (context.userId) {
        log("User ID:", context.userId);
      }
      if (context.sessionId) {
        log("Session ID:", context.sessionId);
      }
      if (context.tags) {
        log("Tags:", context.tags);
      }
      if (context.metadata) {
        log("Metadata:", context.metadata);
      }
    }

    // Show current context
    if (Object.keys(this._contextData).length > 0) {
      console.log("Context:", this._contextData);
    }

    console.groupEnd();
  }

  async recordPerformance(metric: MonitoringPerformanceData): Promise<void> {
    if (!this._initialized) {
      throw new Error("Console provider not initialized");
    }

    const isThresholdExceeded = metric.threshold && metric.value > metric.threshold;
    const logMethod = isThresholdExceeded ? console.warn : console.log;
    const icon = isThresholdExceeded ? "⚠️" : "📊";

    console.group(`${icon} Performance: ${metric.name}`);
    logMethod(`Value: ${metric.value}${metric.unit}`);
    console.log("Type:", metric.type);
    console.log("Timestamp:", metric.timestamp.toISOString());

    if (metric.threshold) {
      console.log(`Threshold: ${metric.threshold}${metric.unit}`);
      if (isThresholdExceeded) {
        console.warn(
          `⚠️ Threshold exceeded by ${metric.value - metric.threshold}${metric.unit}`
        );
      }
    }

    if (metric.metadata) {
      console.log("Metadata:", metric.metadata);
    }

    console.groupEnd();
  }

  startTransaction(
    name: string,
    context?: MonitoringTransactionContext
  ): MonitoringTransaction {
    if (!this._initialized) {
      throw new Error("Console provider not initialized");
    }

    return new ConsoleTransaction(name, context);
  }

  setUser(user: MonitoringUserContext): void {
    if (!this._initialized) {
      throw new Error("Console provider not initialized");
    }

    this._userContext = user;
    console.log("👤 User context set:", {
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }

  clearUser(): void {
    if (!this._initialized) {
      throw new Error("Console provider not initialized");
    }

    this._userContext = undefined;
    console.log("👤 User context cleared");
  }

  setContext<T>(key: string, value: T): void {
    if (!this._initialized) {
      throw new Error("Console provider not initialized");
    }

    this._contextData[key] = value;
    console.log(`🔧 Context set: ${key} =`, value);
  }

  setTag(key: string, value: string): void {
    if (!this._initialized) {
      throw new Error("Console provider not initialized");
    }

    this._tags[key] = value;
    console.log(`🏷️ Tag set: ${key} = ${value}`);
  }

  addBreadcrumb(breadcrumb: MonitoringBreadcrumb): void {
    if (!this._initialized) {
      throw new Error("Console provider not initialized");
    }

    // Add timestamp if not provided
    const timestampedBreadcrumb = {
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || new Date(),
    };

    this._breadcrumbs.push(timestampedBreadcrumb);

    // Keep only the last N breadcrumbs
    if (this._breadcrumbs.length > this._maxBreadcrumbs) {
      this._breadcrumbs = this._breadcrumbs.slice(-this._maxBreadcrumbs);
    }

    const icon = this.getBreadcrumbIcon(breadcrumb.level || "info");
    console.log(
      `${icon} Breadcrumb [${breadcrumb.category || "general"}]: ${breadcrumb.message}`,
      breadcrumb.data ? breadcrumb.data : ""
    );
  }

  async flush(timeout = 5000): Promise<boolean> {
    if (!this._initialized) {
      return false;
    }

    console.log(`🔄 Console provider flush completed (timeout: ${timeout}ms)`);

    // Simulate a small delay to respect the timeout parameter
    // In a real implementation, this would wait for pending operations
    await new Promise(resolve => setTimeout(resolve, Math.min(10, timeout)));

    return true;
  }

  async close(timeout = 5000): Promise<boolean> {
    if (!this._initialized) {
      return true;
    }

    console.log(`🔒 Console provider closing (timeout: ${timeout}ms)`);

    // Simulate cleanup time to respect the timeout parameter
    await new Promise(resolve => setTimeout(resolve, Math.min(10, timeout)));

    this._initialized = false;
    this._userContext = undefined;
    this._contextData = {};
    this._tags = {};
    this._breadcrumbs = [];

    console.log("🔒 Console provider closed");
    return true;
  }

  /**
   * Get breadcrumbs for debugging
   */
  getBreadcrumbs(): MonitoringBreadcrumb[] {
    return [...this._breadcrumbs];
  }

  /**
   * Get current context for debugging
   */
  getCurrentContext(): Record<string, unknown> {
    return {
      user: this._userContext,
      context: this._contextData,
      tags: this._tags,
      breadcrumbs: this._breadcrumbs.length,
    };
  }

  private getConsoleMethod(level?: string): (...args: unknown[]) => void {
    switch (level) {
      case "debug":
        return console.debug;
      case "info":
        return console.info;
      case "warning":
        return console.warn;
      case "error":
      case "fatal":
        return console.error;
      default:
        return console.log;
    }
  }

  private getBreadcrumbIcon(level: string): string {
    switch (level) {
      case "debug":
        return "🐛";
      case "info":
        return "ℹ️";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "📝";
    }
  }
}
