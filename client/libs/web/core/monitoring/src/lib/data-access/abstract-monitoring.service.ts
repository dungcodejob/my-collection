import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import {
  ErrorLog,
  MonitoringBreadcrumb,
  MonitoringConfig,
  MonitoringErrorContext,
  MonitoringErrorData,
  MonitoringPerformanceData,
  MonitoringProvider,
  MonitoringTransaction,
  MonitoringTransactionContext,
  MonitoringUserContext,
  SystemMetrics,
} from "../models";

/**
 * Abstract monitoring service that provides a unified API
 * Independent of any specific monitoring provider implementation
 */
@Injectable({
  providedIn: "root",
})
export abstract class AbstractMonitoringService {
  protected providers: Map<string, MonitoringProvider> = new Map();
  protected primaryProvider?: MonitoringProvider;
  protected isInitialized = false;

  // Observables for reactive monitoring
  private errorsSubject = new BehaviorSubject<MonitoringErrorData[]>([]);
  private performanceSubject = new BehaviorSubject<MonitoringPerformanceData[]>([]);
  private statusSubject = new BehaviorSubject<MonitoringStatus>("inactive");
  private systemMetricsSubject = new BehaviorSubject<SystemMetrics | null>(null);
  private errorLogsSubject = new BehaviorSubject<ErrorLog[]>([]);

  readonly errors$ = this.errorsSubject.asObservable();
  readonly performance$ = this.performanceSubject.asObservable();
  readonly status$ = this.statusSubject.asObservable();
  readonly systemMetrics$ = this.systemMetricsSubject.asObservable();
  readonly errorLogs$ = this.errorLogsSubject.asObservable();
  // Alias for backward compatibility
  readonly performanceMetrics$ = this.performanceSubject.asObservable();

  /**
   * Initialize monitoring with configuration
   */
  async initialize(config: MonitoringConfig): Promise<void> {
    try {
      this.statusSubject.next("initializing");

      // Initialize all registered providers
      const initPromises = Array.from(this.providers.values()).map(provider =>
        provider.initialize(config)
      );

      await Promise.all(initPromises);

      this.isInitialized = true;
      this.statusSubject.next("active");

      console.log(`Monitoring initialized with ${this.providers.size} provider(s)`);
    } catch (error) {
      this.statusSubject.next("error");
      console.error("Failed to initialize monitoring:", error);
      throw error;
    }
  }

  /**
   * Register a monitoring provider
   */
  registerProvider(provider: MonitoringProvider, isPrimary = false): void {
    this.providers.set(provider.name, provider);

    if (isPrimary || !this.primaryProvider) {
      this.primaryProvider = provider;
    }

    console.log(`Registered monitoring provider: ${provider.name}`);
  }

  /**
   * Unregister a monitoring provider
   */
  unregisterProvider(providerName: string): void {
    const provider = this.providers.get(providerName);
    if (provider) {
      this.providers.delete(providerName);

      if (this.primaryProvider === provider) {
        this.primaryProvider = this.providers.values().next().value;
      }

      console.log(`Unregistered monitoring provider: ${providerName}`);
    }
  }

  /**
   * Get list of registered providers
   */
  getProviders(): MonitoringProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get specific provider by name
   */
  getProvider(name: string): MonitoringProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Log an error to all providers
   */
  async logError(error: MonitoringErrorData): Promise<void> {
    if (!this.isInitialized) {
      console.warn("Monitoring not initialized, queuing error");
      return;
    }

    // Add to local store for reactive updates
    const currentErrors = this.errorsSubject.value;
    this.errorsSubject.next([...currentErrors, error]);

    // Send to all providers
    const promises = Array.from(this.providers.values()).map(provider =>
      provider
        .captureError(error)
        .catch(err =>
          console.error(`Provider ${provider.name} failed to capture error:`, err)
        )
    );

    await Promise.allSettled(promises);
  }

  /**
   * Capture an exception to all providers
   */
  async captureException(
    exception: Error,
    context?: MonitoringErrorContext
  ): Promise<void> {
    if (!this.isInitialized) {
      console.warn("Monitoring not initialized, logging to console:", exception);
      return;
    }

    const promises = Array.from(this.providers.values()).map(provider =>
      provider
        .captureException(exception, context)
        .catch(err =>
          console.error(`Provider ${provider.name} failed to capture exception:`, err)
        )
    );

    await Promise.allSettled(promises);
  }

  /**
   * Record performance metric to all providers
   */
  async recordPerformance(metric: MonitoringPerformanceData): Promise<void> {
    if (!this.isInitialized) {
      console.warn("Monitoring not initialized, queuing performance metric");
      return;
    }

    // Add to local store for reactive updates
    const currentMetrics = this.performanceSubject.value;
    this.performanceSubject.next([...currentMetrics, metric]);

    // Send to all providers
    const promises = Array.from(this.providers.values()).map(provider =>
      provider
        .recordPerformance(metric)
        .catch(err =>
          console.error(`Provider ${provider.name} failed to record performance:`, err)
        )
    );

    await Promise.allSettled(promises);
  }

  /**
   * Start a transaction (uses primary provider)
   */
  startTransaction(
    name: string,
    context?: MonitoringTransactionContext
  ): MonitoringTransaction | null {
    if (!this.primaryProvider) {
      console.warn("No primary provider available for transaction");
      return null;
    }

    return this.primaryProvider.startTransaction(name, context);
  }

  /**
   * Set user context for all providers
   */
  setUser(user: MonitoringUserContext): void {
    this.providers.forEach(provider => {
      try {
        provider.setUser(user);
      } catch (error) {
        console.error(`Provider ${provider.name} failed to set user:`, error);
      }
    });
  }

  /**
   * Clear user context for all providers
   */
  clearUser(): void {
    this.providers.forEach(provider => {
      try {
        provider.clearUser();
      } catch (error) {
        console.error(`Provider ${provider.name} failed to clear user:`, error);
      }
    });
  }

  /**
   * Set context for all providers
   */
  setContext(key: string, value: any): void {
    this.providers.forEach(provider => {
      try {
        provider.setContext(key, value);
      } catch (error) {
        console.error(`Provider ${provider.name} failed to set context:`, error);
      }
    });
  }

  /**
   * Set tag for all providers
   */
  setTag(key: string, value: string): void {
    this.providers.forEach(provider => {
      try {
        provider.setTag(key, value);
      } catch (error) {
        console.error(`Provider ${provider.name} failed to set tag:`, error);
      }
    });
  }

  /**
   * Add breadcrumb to all providers
   */
  addBreadcrumb(breadcrumb: MonitoringBreadcrumb): void {
    this.providers.forEach(provider => {
      try {
        provider.addBreadcrumb(breadcrumb);
      } catch (error) {
        console.error(`Provider ${provider.name} failed to add breadcrumb:`, error);
      }
    });
  }

  /**
   * Flush all providers
   */
  async flush(timeout = 5000): Promise<boolean> {
    const promises = Array.from(this.providers.values()).map(provider =>
      provider.flush(timeout).catch(() => false)
    );

    const results = await Promise.allSettled(promises);
    return results.every(result => result.status === "fulfilled" && result.value);
  }

  /**
   * Close all providers
   */
  async close(timeout = 5000): Promise<boolean> {
    const promises = Array.from(this.providers.values()).map(provider =>
      provider.close(timeout).catch(() => false)
    );

    const results = await Promise.allSettled(promises);
    this.isInitialized = false;
    this.statusSubject.next("inactive");

    return results.every(result => result.status === "fulfilled" && result.value);
  }

  /**
   * Get current monitoring status
   */
  getStatus(): MonitoringStatus {
    return this.statusSubject.value;
  }

  /**
   * Check if monitoring is initialized
   */
  isMonitoringInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current errors
   */
  getCurrentErrors(): MonitoringErrorData[] {
    return this.errorsSubject.value;
  }

  /**
   * Get current performance metrics
   */
  getCurrentPerformance(): MonitoringPerformanceData[] {
    return this.performanceSubject.value;
  }

  /**
   * Clear all stored errors
   */
  clearErrors(): void {
    this.errorsSubject.next([]);
  }

  /**
   * Clear all stored performance metrics
   */
  clearPerformance(): void {
    this.performanceSubject.next([]);
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics(metrics: SystemMetrics): void {
    this.systemMetricsSubject.next(metrics);
  }

  /**
   * Get current system metrics
   */
  getCurrentSystemMetrics(): SystemMetrics | null {
    return this.systemMetricsSubject.value;
  }

  /**
   * Log error with ErrorLog format
   */
  logErrorLog(error: Partial<ErrorLog>): void {
    const newError: ErrorLog = {
      id: error.id || Date.now().toString(),
      message: error.message || "Unknown error",
      severity: error.severity || "medium",
      timestamp: error.timestamp || new Date(),
      component: error.component,
      type: error.type,
      source: error.source,
      stackTrace: error.stackTrace,
      userId: error.userId,
    };

    const currentErrors = this.errorLogsSubject.value;
    this.errorLogsSubject.next([newError, ...currentErrors].slice(0, 100));
  }

  /**
   * Get current error logs
   */
  getCurrentErrorLogs(): ErrorLog[] {
    return this.errorLogsSubject.value;
  }

  /**
   * Clear all error logs
   */
  clearErrorLogs(): void {
    this.errorLogsSubject.next([]);
  }

  // Performance metrics methods removed - use recordPerformance, getCurrentPerformance, clearPerformance instead
}

export type MonitoringStatus = "inactive" | "initializing" | "active" | "error";
