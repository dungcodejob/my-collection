import { Injectable } from "@angular/core";
import {
  MonitoringBreadcrumb,
  MonitoringConfig,
  MonitoringErrorData,
  MonitoringErrorLevel,
  MonitoringPerformanceData,
  MonitoringUserContext,
} from "../models";
import { ConsoleProvider } from "../providers/console-provider";
import { SentryProvider } from "../providers/sentry-provider";
import { AbstractMonitoringService } from "./abstract-monitoring.service";

/**
 * Unified monitoring service that provides loose coupling
 * This service manages multiple monitoring providers independently
 */
@Injectable({
  providedIn: "root",
})
export class UnifiedMonitoringService extends AbstractMonitoringService {
  constructor() {
    super();
    this.setupDefaultProviders();
  }

  /**
   * Setup default monitoring providers
   */
  private setupDefaultProviders(): void {
    // Always register console provider as fallback
    const consoleProvider = new ConsoleProvider();
    this.registerProvider(consoleProvider, false);

    // Register Sentry provider if available
    try {
      const sentryProvider = new SentryProvider();
      this.registerProvider(sentryProvider, true); // Set as primary
    } catch (error) {
      console.warn("Sentry provider not available, using console provider only:", error);
    }
  }

  /**
   * Initialize monitoring with environment-specific configuration
   */
  async initializeWithEnvironment(
    environment: string,
    config: Partial<MonitoringConfig> = {}
  ): Promise<void> {
    const defaultConfig: MonitoringConfig = {
      environment,
      debug: environment === "development",
      sampleRate: environment === "production" ? 0.1 : 1.0,
      enablePerformance: true,
      enableReplay: environment !== "production",
      ...config,
    };

    await this.initialize(defaultConfig);
  }

  /**
   * Log error with automatic context enrichment
   */
  async logErrorWithContext(
    message: string,
    level: MonitoringErrorLevel = "error",
    component?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const errorData: MonitoringErrorData = {
      message,
      level,
      timestamp: new Date(),
      component,
      source: "application",
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
        ...metadata,
      },
    };

    await this.logError(errorData);
  }

  // recordPerformanceMetric removed - use recordPerformance instead

  /**
   * Record Web Vitals metrics
   */
  async recordWebVital(
    name: "CLS" | "INP" | "LCP" | "FCP" | "TTFB",
    value: number,
    rating: "good" | "needs-improvement" | "poor"
  ): Promise<void> {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      INP: { good: 200, poor: 500 },
      LCP: { good: 2500, poor: 4000 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[name];
    const performanceData: MonitoringPerformanceData = {
      name: `web-vital-${name.toLowerCase()}`,
      value,
      unit: name === "CLS" ? "score" : "ms",
      type: "web-vital",
      timestamp: new Date(),
      threshold: threshold.poor,
      metadata: {
        rating,
        goodThreshold: threshold.good,
        poorThreshold: threshold.poor,
        url: window.location.href,
      },
    };

    await this.recordPerformance(performanceData);
  }

  /**
   * Track user action with breadcrumb
   */
  trackUserAction(
    action: string,
    category = "user",
    data?: Record<string, any>
  ): void {
    const breadcrumb: MonitoringBreadcrumb = {
      message: action,
      category,
      level: "info",
      timestamp: new Date(),
      data: {
        url: window.location.href,
        ...data,
      },
    };

    this.addBreadcrumb(breadcrumb);
  }

  /**
   * Track navigation events
   */
  trackNavigation(from: string, to: string): void {
    this.trackUserAction(`Navigation: ${from} → ${to}`, "navigation", { from, to });
  }

  /**
   * Track API calls
   */
  trackApiCall(method: string, url: string, status: number, duration: number): void {
    const level = status >= 400 ? "error" : status >= 300 ? "warning" : "info";

    this.trackUserAction(`API ${method} ${url} - ${status}`, "http", {
      method,
      url,
      status,
      duration,
    });

    // Also record as performance metric
    const performanceData: MonitoringPerformanceData = {
      name: `api-${method.toLowerCase()}-${url.replace(/[^a-zA-Z0-9]/g, "-")}`,
      value: duration,
      unit: "ms",
      type: "custom",
      timestamp: new Date(),
      threshold: 5000,
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    };
    this.recordPerformance(performanceData);
  }

  /**
   * Set user context with automatic enrichment
   */
  setUserWithContext(user: Partial<MonitoringUserContext> & { id: string }): void {
    const enrichedUser: MonitoringUserContext = {
      ...user,
      ipAddress: user.ipAddress || "unknown",
      segment: user.segment || "default",
    };

    this.setUser(enrichedUser);

    // Add breadcrumb for user context change
    this.trackUserAction(`User context set: ${user.id}`, "auth", {
      userId: user.id,
      email: user.email,
    });
  }

  /**
   * Handle unhandled errors
   */
  handleUnhandledError(error: Error, source = "unknown"): void {
    this.captureException(error, {
      component: "global-error-handler",
      extra: {
        source,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      level: "error",
    });
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    const error = reason instanceof Error ? reason : new Error(String(reason));

    this.captureException(error, {
      component: "unhandled-promise-rejection",
      extra: {
        reason: String(reason),
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      level: "error",
    });
  }

  /**
   * Get monitoring health status
   */
  getHealthStatus(): {
    status: string;
    providers: { name: string; initialized: boolean }[];
    errorCount: number;
    performanceCount: number;
  } {
    return {
      status: this.getStatus(),
      providers: this.getProviders().map(provider => ({
        name: provider.name,
        initialized: provider.isInitialized(),
      })),
      errorCount: this.getCurrentErrors().length,
      performanceCount: this.getCurrentPerformance().length,
    };
  }

  /**
   * Export monitoring data for debugging
   */
  exportDebugData(): {
    errors: MonitoringErrorData[];
    performance: MonitoringPerformanceData[];
    status: string;
    providers: string[];
  } {
    return {
      errors: this.getCurrentErrors(),
      performance: this.getCurrentPerformance(),
      status: this.getStatus(),
      providers: this.getProviders().map(p => p.name),
    };
  }
}
