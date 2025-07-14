import { ErrorHandler, Injectable, inject } from "@angular/core";
import { UnifiedMonitoringService } from "../data-access/unified-monitoring.service";
import { MonitoringErrorContext, MonitoringErrorLevel } from "../models";

/**
 * Enhanced Unified Error Handler với throttling và advanced features
 * Thay thế Sentry ErrorHandler với tích hợp UnifiedMonitoringService
 *
 * Features:
 * - Tự động detect component từ stack trace
 * - Error throttling (10 lỗi/phút)
 * - Error frequency tracking
 * - Performance protection
 * - Enhanced error context
 */
@Injectable()
export class EnhancedUnifiedErrorHandler implements ErrorHandler {
  protected monitoring = inject(UnifiedMonitoringService);
  protected errorCount = 0;
  protected lastErrorTime = 0;
  protected readonly MAX_ERRORS_PER_MINUTE = 10;
  protected readonly ERROR_THROTTLE_MS = 60000; // 1 minute

  handleError(error: any): void {
    // Implement error throttling to prevent spam
    const now = Date.now();

    if (now - this.lastErrorTime > this.ERROR_THROTTLE_MS) {
      this.errorCount = 0;
      this.lastErrorTime = now;
    }

    this.errorCount++;

    if (this.errorCount > this.MAX_ERRORS_PER_MINUTE) {
      console.warn("Error reporting throttled due to high frequency");
      return;
    }

    // Add error frequency context
    const originalCaptureException = this.monitoring.captureException.bind(
      this.monitoring
    );
    this.monitoring.captureException = (
      exception: Error,
      context?: MonitoringErrorContext
    ): Promise<void> => {
      return originalCaptureException(exception, {
        ...context,
        extra: {
          ...context?.extra,
          errorFrequency: {
            count: this.errorCount,
            timeWindow: this.ERROR_THROTTLE_MS,
            isThrottled: this.errorCount > this.MAX_ERRORS_PER_MINUTE,
          },
        },
      });
    };

    // Call base error handling logic
    this.performErrorHandling(error);
  }

  /**
   * Perform the actual error handling logic
   */
  protected performErrorHandling(error: any): void {
    // Log error to console for development
    console.error("Angular Error caught by EnhancedUnifiedErrorHandler:", error);

    try {
      // Extract error information
      const errorInfo = this.extractErrorInfo(error);

      // Capture exception through unified monitoring
      this.monitoring.captureException(errorInfo.error, {
        component: this.getActualComponent(error),
        level: errorInfo.level,
        extra: {
          angularError: true,
          errorType: errorInfo.type,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          originalError: error,
          errorHandler: "EnhancedUnifiedErrorHandler",
        },
        tags: {
          source: this.getActualComponent(error),
          errorCategory: errorInfo.category,
        },
      });

      // Also log to ErrorLog system for internal tracking
      this.monitoring.logErrorLog({
        message: errorInfo.error.message,
        severity: this.mapLevelToSeverity(errorInfo.level),
        component: this.getActualComponent(error),
        type: errorInfo.type,
        source: this.getErrorSource(error),
        stackTrace: errorInfo.error.stack,
      });
    } catch (handlerError) {
      // Fallback: if monitoring fails, at least log to console
      console.error("Error in EnhancedUnifiedErrorHandler:", handlerError);
      console.error("Original error:", error);
    }
  }

  /**
   * Extract and normalize error information
   */
  protected extractErrorInfo(error: any): {
    error: Error;
    level: MonitoringErrorLevel;
    type: string;
    category: string;
  } {
    let normalizedError: Error;
    let level: MonitoringErrorLevel = "error";
    let type = "UnknownError";
    let category = "general";

    // Handle different error types
    if (error instanceof Error) {
      normalizedError = error;
      type = error.constructor.name;
    } else if (error?.rejection instanceof Error) {
      // Unhandled promise rejection
      normalizedError = error.rejection;
      type = "UnhandledPromiseRejection";
      category = "promise";
      level = "warning";
    } else if (error?.error instanceof Error) {
      // Angular HTTP error or similar
      normalizedError = error.error;
      type = "HttpError";
      category = "http";
    } else if (typeof error === "string") {
      normalizedError = new Error(error);
      type = "StringError";
    } else {
      // Fallback for unknown error types
      normalizedError = new Error(JSON.stringify(error));
      type = "UnknownError";
    }

    // Determine severity based on error type
    if (type.includes("Http") || type.includes("Network")) {
      level = "warning";
      category = "network";
    } else if (type.includes("Permission") || type.includes("Auth")) {
      level = "error";
      category = "security";
    } else if (type.includes("Syntax") || type.includes("Reference")) {
      level = "fatal";
      category = "code";
    }

    return { error: normalizedError, level, type, category };
  }

  /**
   * Map MonitoringErrorLevel to ErrorLog severity
   */
  protected mapLevelToSeverity(
    level: MonitoringErrorLevel
  ): "low" | "medium" | "high" | "critical" {
    switch (level) {
      case "debug":
      case "info":
        return "low";
      case "warning":
        return "medium";
      case "error":
        return "high";
      case "fatal":
        return "critical";
      default:
        return "medium";
    }
  }

  /**
   * Extract source information from error
   */
  protected getErrorSource(error: any): string {
    try {
      if (error?.stack) {
        const stackLines = error.stack.split("\n");
        const relevantLine = stackLines.find(
          (line: string) => line.includes(".ts:") && !line.includes("error-handler")
        );

        if (relevantLine) {
          const match = relevantLine.match(/([^/]+\.ts):(\d+):(\d+)/);
          if (match) {
            return `${match[1]}:${match[2]}`;
          }
        }
      }
    } catch {
      // Ignore errors in source extraction
    }

    return "unknown";
  }

  /**
   * Extract actual component name from error stack trace
   */
  protected getActualComponent(error: any): string {
    try {
      // Try to get component from error context first
      if (error?.context?.component) {
        return error.context.component;
      }

      // Try to extract from stack trace
      const stack = error?.stack || new Error().stack;
      if (stack) {
        const lines = stack.split("\n");

        // Look for Angular component patterns in stack trace
        for (const line of lines) {
          // Pattern 1: ComponentName.methodName (file.component.ts:line:col)
          const componentMatch = line.match(/at\s+(\w+Component)\./i);
          if (componentMatch) {
            return componentMatch[1];
          }

          // Pattern 2: file.component.ts pattern
          const fileMatch = line.match(/([\w-]+)\.component\.ts/);
          if (fileMatch) {
            // Convert kebab-case to PascalCase + Component
            const componentName =
              fileMatch[1]
                .split("-")
                .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
                .join("") + "Component";
            return componentName;
          }

          // Pattern 3: Angular service or directive patterns
          const serviceMatch = line.match(/at\s+(\w+(?:Service|Directive|Pipe))\./i);
          if (serviceMatch) {
            return serviceMatch[1];
          }
        }

        // Fallback: try to get any class name from stack
        for (const line of lines) {
          const classMatch = line.match(/at\s+(\w+)\./i);
          if (
            classMatch &&
            !classMatch[1].includes("Error") &&
            !classMatch[1].includes("Handler") &&
            classMatch[1] !== "Object" &&
            classMatch[1] !== "Function"
          ) {
            return classMatch[1];
          }
        }
      }

      // Try to get from current route if available
      const currentRoute = this.getCurrentRoute();
      if (currentRoute) {
        return currentRoute;
      }
    } catch (extractError) {
      console.warn("Failed to extract component name:", extractError);
    }

    return "UnknownComponent";
  }

  /**
   * Get current route component name
   */
  protected getCurrentRoute(): string | null {
    try {
      // Try to get from URL path
      const path = window.location.pathname;
      const segments = path.split("/").filter(s => s.length > 0);

      if (segments.length > 0) {
        // Convert last segment to component name
        const lastSegment = segments[segments.length - 1];
        return (
          lastSegment
            .split("-")
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("") + "Component"
        );
      }

      // Default route
      if (path === "/" || path === "") {
        return "HomeComponent";
      }
    } catch {
      // Ignore errors in route extraction
    }

    return null;
  }
}

/**
 * Configuration cho app.config.ts
 */
export const ERROR_HANDLER_CONFIG = {
  provide: ErrorHandler,
  useClass: EnhancedUnifiedErrorHandler,
};

/**
 * Ví dụ sử dụng trong app.config.ts:
 *
 * import { ERROR_HANDLER_CONFIG } from './monitoring/examples/angular-error-handler.example';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     // ... other providers
 *
 *     // Sử dụng Enhanced ErrorHandler với throttling
 *     ERROR_HANDLER_CONFIG,
 *
 *     // Vẫn có thể giữ Sentry cho performance monitoring
 *     {
 *       provide: APP_INITIALIZER,
 *       useFactory: () => () => {},
 *       deps: [TraceService],
 *       multi: true,
 *     },
 *   ]
 * };
 */

/**
 * Global Error Handlers Setup
 * Bổ sung cho Angular ErrorHandler
 */
export function setupGlobalErrorHandlers(monitoring: UnifiedMonitoringService): void {
  // Handle unhandled JavaScript errors
  window.addEventListener("error", event => {
    monitoring.handleUnhandledError(
      new Error(event.message),
      `${event.filename}:${event.lineno}:${event.colno}`
    );
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", event => {
    monitoring.handleUnhandledRejection(event.reason, event.promise);
  });

  // Handle network errors
  window.addEventListener("online", () => {
    monitoring.addBreadcrumb({
      message: "Network connection restored",
      category: "network",
      level: "info",
    });
  });

  window.addEventListener("offline", () => {
    monitoring.addBreadcrumb({
      message: "Network connection lost",
      category: "network",
      level: "warning",
    });
  });
}

/**
 * Utility để setup trong main.ts hoặc app initialization
 */
export function initializeErrorHandling(monitoring: UnifiedMonitoringService): void {
  setupGlobalErrorHandlers(monitoring);

  // Log initialization
  monitoring.addBreadcrumb({
    message: "Unified error handling initialized",
    category: "system",
    level: "info",
  });
}
