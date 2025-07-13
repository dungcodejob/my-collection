import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

// Abstract Monitoring imports
import {
  UnifiedMonitoringService,
  MonitoringFactory,
  MONITORING_CONFIG,
  MonitoringConfig,
} from "../data-access";

// Environment
// import { environment } from '../../environments/environment';
// Note: Replace with your actual environment import path
const environment = {
  production: false,
  sentry: {
    dsn: "your-sentry-dsn-here",
    environment: "development",
  },
};

/**
 * Example app configuration using abstract monitoring architecture
 * This replaces the old Sentry-specific configuration with a flexible approach
 */

// Monitoring configuration based on environment
const monitoringConfig: MonitoringConfig = {
  environment: environment.production ? "production" : "development",
  debug: !environment.production,
  sampleRate: environment.production ? 0.1 : 1.0,
  enablePerformance: true,
  enableReplay: !environment.production,
  dsn: environment.sentryDsn, // Optional: only used if Sentry provider is active
};

/**
 * Factory function to create and initialize monitoring service
 */
export function createMonitoringService(): Promise<UnifiedMonitoringService> {
  return new Promise(async (resolve, reject) => {
    try {
      const factory = new MonitoringFactory();
      const service = new UnifiedMonitoringService();

      // Initialize with environment-specific configuration
      await service.initializeWithEnvironment(
        monitoringConfig.environment,
        monitoringConfig
      );

      // Setup global error handlers
      setupGlobalErrorHandlers(service);

      console.log("✅ Abstract monitoring initialized successfully");
      resolve(service);
    } catch (error) {
      console.error("❌ Failed to initialize monitoring:", error);
      reject(error);
    }
  });
}

/**
 * Setup global error handlers
 */
function setupGlobalErrorHandlers(monitoringService: UnifiedMonitoringService): void {
  // Handle unhandled errors
  window.addEventListener("error", event => {
    monitoringService.handleUnhandledError(
      new Error(event.message),
      `${event.filename}:${event.lineno}:${event.colno}`
    );
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", event => {
    monitoringService.handleUnhandledRejection(event.reason, event.promise);
  });

  // Handle Angular errors (if using custom error handler)
  // This would be implemented in a custom ErrorHandler service
}

/**
 * Alternative: Simple provider function
 */
export function provideAbstractMonitoring() {
  return {
    provide: UnifiedMonitoringService,
    useFactory: createMonitoringService,
    deps: [],
  };
}

/**
 * Alternative: Using injection tokens
 */
export function provideMonitoringWithTokens() {
  return [
    {
      provide: MONITORING_CONFIG,
      useValue: monitoringConfig,
    },
    {
      provide: UnifiedMonitoringService,
      useFactory: (config: MonitoringConfig) => {
        const factory = new MonitoringFactory();
        return factory.createMonitoringService(config.environment, config);
      },
      deps: [MONITORING_CONFIG],
    },
  ];
}

/**
 * Main application configuration
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Router
    provideRouter([]), // Your routes here

    // HTTP Client
    provideHttpClient(),

    // Animations
    importProvidersFrom(BrowserAnimationsModule),

    // Abstract Monitoring (choose one approach)

    // Approach 1: Simple factory
    provideAbstractMonitoring(),

    // Approach 2: With injection tokens (commented out)
    // ...provideMonitoringWithTokens(),

    // Approach 3: Manual setup (commented out)
    // {
    //   provide: UnifiedMonitoringService,
    //   useFactory: () => {
    //     const service = new UnifiedMonitoringService();
    //     service.initializeWithEnvironment('development');
    //     return service;
    //   }
    // },

    // Other providers...
  ],
};

/**
 * Example usage in main.ts
 */
/*
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('🚀 Application started with abstract monitoring');
  })
  .catch(err => {
    console.error('❌ Application failed to start:', err);
  });
*/

/**
 * Example custom error handler
 */
/*
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { UnifiedMonitoringService } from '../monitoring';

@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  private monitoring = inject(UnifiedMonitoringService);

  handleError(error: any): void {
    console.error('Angular Error:', error);
    
    this.monitoring.captureException(error, {
      component: 'angular-error-handler',
      level: 'error',
      extra: {
        angularError: true,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    });
  }
}

// Add to providers:
// { provide: ErrorHandler, useClass: CustomErrorHandler }
*/

/**
 * Example environment configuration
 */
/*
// environment.ts
export const environment = {
  production: false,
  sentryDsn: 'https://your-sentry-dsn@sentry.io/project-id',
  monitoring: {
    providers: ['console', 'sentry'],
    debug: true,
    sampleRate: 1.0
  }
};

// environment.prod.ts
export const environment = {
  production: true,
  sentryDsn: 'https://your-sentry-dsn@sentry.io/project-id',
  monitoring: {
    providers: ['sentry'],
    debug: false,
    sampleRate: 0.1
  }
};
*/
