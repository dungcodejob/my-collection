import { FactoryProvider, Injectable, InjectionToken } from "@angular/core";
import { MonitoringConfig, MonitoringProvider } from "../models";
import { ConsoleProvider } from "../providers/console-provider";
import { SentryProvider } from "../providers/sentry-provider";
import { UnifiedMonitoringService } from "./unified-monitoring.service";

/**
 * Injection token for monitoring configuration
 */
export const MONITORING_CONFIG = new InjectionToken<MonitoringConfig>(
  "MONITORING_CONFIG"
);

/**
 * Injection token for monitoring providers
 */
export const MONITORING_PROVIDERS = new InjectionToken<MonitoringProvider[]>(
  "MONITORING_PROVIDERS"
);

/**
 * Factory for creating and configuring monitoring providers
 */
@Injectable({
  providedIn: "root",
})
export class MonitoringFactory {
  /**
   * Create a monitoring provider by name
   */
  createProvider(name: string): MonitoringProvider | null {
    switch (name.toLowerCase()) {
      case "sentry":
        return new SentryProvider();
      case "console":
        return new ConsoleProvider();
      default:
        console.warn(`Unknown monitoring provider: ${name}`);
        return null;
    }
  }

  /**
   * Create multiple providers from configuration
   */
  createProviders(providerNames: string[]): MonitoringProvider[] {
    return providerNames
      .map(name => this.createProvider(name))
      .filter((provider): provider is MonitoringProvider => provider !== null);
  }

  /**
   * Create default providers based on environment
   */
  createDefaultProviders(environment: string): MonitoringProvider[] {
    const providers: MonitoringProvider[] = [];

    // Always include console provider
    providers.push(new ConsoleProvider());

    // Add Sentry in production or when explicitly enabled
    if (environment === "production" || environment === "staging") {
      try {
        providers.push(new SentryProvider());
      } catch (error) {
        console.warn("Failed to create Sentry provider:", error);
      }
    }

    return providers;
  }

  /**
   * Create monitoring configuration based on environment
   */
  createConfig(
    environment: string,
    overrides: Partial<MonitoringConfig> = {}
  ): MonitoringConfig {
    const baseConfig: MonitoringConfig = {
      environment,
      debug: environment === "development",
      sampleRate: this.getSampleRate(environment),
      enablePerformance: true,
      enableReplay: environment !== "production",
    };

    return { ...baseConfig, ...overrides };
  }

  /**
   * Initialize monitoring service with providers and configuration
   */
  async initializeMonitoring(
    service: UnifiedMonitoringService,
    config: MonitoringConfig,
    providers?: MonitoringProvider[]
  ): Promise<void> {
    // Use provided providers or create defaults
    const monitoringProviders =
      providers || this.createDefaultProviders(config.environment);

    // Register providers
    monitoringProviders.forEach((provider, index) => {
      const isPrimary = index === 0 && provider.name === "sentry";
      service.registerProvider(provider, isPrimary);
    });

    // Initialize with configuration
    await service.initialize(config);

    console.log(
      `Monitoring initialized with ${monitoringProviders.length} provider(s) for environment: ${config.environment}`
    );
  }

  /**
   * Create a monitoring service with automatic setup
   */
  async createMonitoringService(
    environment: string,
    configOverrides: Partial<MonitoringConfig> = {},
    providerNames?: string[]
  ): Promise<UnifiedMonitoringService> {
    const service = new UnifiedMonitoringService();
    const config = this.createConfig(environment, configOverrides);

    let providers: MonitoringProvider[] | undefined;
    if (providerNames) {
      providers = this.createProviders(providerNames);
    }

    await this.initializeMonitoring(service, config, providers);

    return service;
  }

  /**
   * Get sample rate based on environment
   */
  private getSampleRate(environment: string): number {
    switch (environment) {
      case "production":
        return 0.1; // 10% sampling in production
      case "staging":
        return 0.5; // 50% sampling in staging
      case "development":
      default:
        return 1.0; // 100% sampling in development
    }
  }
}

/**
 * Factory function for creating monitoring service
 */
export function createMonitoringService(
  environment: string,
  config?: Partial<MonitoringConfig>
): () => Promise<UnifiedMonitoringService> {
  return async () => {
    const factory = new MonitoringFactory();
    return factory.createMonitoringService(environment, config);
  };
}

/**
 * Factory function for Angular providers
 */
export function provideMonitoring(
  environment: string,
  config?: Partial<MonitoringConfig>,
  providerNames?: string[]
): FactoryProvider {
  return {
    provide: UnifiedMonitoringService,
    useFactory: async (): Promise<UnifiedMonitoringService> => {
      const factory = new MonitoringFactory();
      return factory.createMonitoringService(environment, config, providerNames);
    },
    deps: [],
  };
}
