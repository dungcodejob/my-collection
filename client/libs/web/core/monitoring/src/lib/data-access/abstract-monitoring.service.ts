import { Injectable, signal } from "@angular/core";
import {
  ErrorLog,
  MonitoringBreadcrumb,
  MonitoringConfig,
  MonitoringErrorContext,
  MonitoringErrorData,
  MonitoringPerformanceData,
  MonitoringProvider,
  MonitoringStatus,
  monitoringStatuses,
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

  private readonly _$errors = signal<MonitoringErrorData[]>([]);
  private readonly _$performance = signal<MonitoringPerformanceData[]>([]);
  private readonly _$status = signal<MonitoringStatus>(monitoringStatuses.Initializing);
  private readonly _$systemMetrics = signal<SystemMetrics | null>(null);
  private readonly _$errorLogs = signal<ErrorLog[]>([]);

  readonly $errors = this._$errors.asReadonly();
  readonly $performance = this._$performance.asReadonly();
  readonly $status = this._$status.asReadonly();
  readonly $systemMetrics = this._$systemMetrics.asReadonly();
  readonly $errorLogs = this._$errorLogs.asReadonly();
  readonly $performanceMetrics = this._$performance.asReadonly();

  /**
   * Initialize monitoring with configuration
   */
  async initialize(config: MonitoringConfig): Promise<void> {
    try {
      this._$status.set(monitoringStatuses.Initializing);

      // Initialize all registered providers
      const initPromises = Array.from(this.providers.values()).map(provider =>
        provider.initialize(config)
      );

      await Promise.all(initPromises);

      this.isInitialized = true;
      this._$status.set(monitoringStatuses.Active);

      console.log(`Monitoring initialized with ${this.providers.size} provider(s)`);
    } catch (error) {
      this._$status.set(monitoringStatuses.Error);
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
    const currentErrors = this._$errors();
    const newErrors = [...currentErrors, error];
    this._$errors.set(newErrors);

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
    const currentMetrics = this._$performance();
    const newMetrics = [...currentMetrics, metric];
    this._$performance.set(newMetrics);

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
  setContext<T>(key: string, value: T): void {
    this.providers.forEach(provider => {
      try {
        provider.setContext(key, value);
      } catch (error) {
        console.error(`Provider ${provider.name} failed to set context:`, error);
      }
    });
  }

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
    this._$status.set("inactive");

    return results.every(result => result.status === "fulfilled" && result.value);
  }

  isMonitoringInitialized(): boolean {
    return this.isInitialized;
  }

  clearErrors(): void {
    this._$errors.set([]);
  }

  clearPerformance(): void {
    this._$performance.set([]);
  }

  updateSystemMetrics(metrics: SystemMetrics): void {
    this._$systemMetrics.set(metrics);
  }

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

    const currentErrors = this._$errorLogs();
    const newErrors = [newError, ...currentErrors].slice(0, 100);
    this._$errorLogs.set(newErrors);
  }

  clearErrorLogs(): void {
    this._$errorLogs.set([]);
  }
}
