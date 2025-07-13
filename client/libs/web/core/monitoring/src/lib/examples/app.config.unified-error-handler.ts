import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import {
  APP_INITIALIZER,
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
// import { TraceService } from '@sentry/angular'; // Optional: only if using Sentry

// import { routes } from '../app.routes'; // Import your actual routes
// import { AuthInterceptor } from '../auth/utils/auth.interceptor'; // Import your actual interceptor
import { UnifiedMonitoringService } from "../data-access/unified-monitoring.service";
import {
  EnhancedUnifiedErrorHandler,
  initializeErrorHandling,
} from "./angular-error-handler.example";

/**
 * App configuration với UnifiedErrorHandler thay vì Sentry ErrorHandler
 *
 * CÁCH SỬ DỤNG:
 * 1. Copy file này thành app.config.ts
 * 2. Hoặc thay thế providers trong app.config.ts hiện tại
 * 3. Đảm bảo UnifiedMonitoringService đã được initialize
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter([]), // Replace with your actual routes
    provideHttpClient(withInterceptorsFromDi()),
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthInterceptor, // Replace with your actual interceptor
    //   multi: true
    // },

    // ===== ERROR HANDLING CONFIGURATION =====

    // Enhanced UnifiedErrorHandler với throttling
    {
      provide: ErrorHandler,
      useClass: EnhancedUnifiedErrorHandler,
    },

    // Option 3: Custom ErrorHandler với additional logic
    // {
    //   provide: ErrorHandler,
    //   useClass: CustomSmartErrorHandler // Xem implementation bên dưới
    // },

    // ===== MONITORING INITIALIZATION =====

    // Initialize UnifiedMonitoringService
    {
      provide: APP_INITIALIZER,
      useFactory: (monitoring: UnifiedMonitoringService) => {
        return async () => {
          try {
            // Initialize monitoring với environment-specific config
            await monitoring.initializeWithEnvironment(
              "development", // Hoặc lấy từ environment
              {
                environment: "development",
                debug: true,
                sampleRate: 1.0,
                enablePerformance: true,
                enableReplay: true,
                dsn: "your-sentry-dsn-here", // Optional
              }
            );

            // Setup global error handlers
            initializeErrorHandling(monitoring);

            console.log("✅ Unified monitoring and error handling initialized");
          } catch (error) {
            console.error("❌ Failed to initialize monitoring:", error);
          }
        };
      },
      deps: [UnifiedMonitoringService],
      multi: true,
    },

    // ===== SENTRY PERFORMANCE MONITORING (Optional) =====
    // Vẫn có thể giữ Sentry TraceService cho performance monitoring
    // Optional: Sentry performance monitoring
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: () => () => {
    //     console.log('Sentry TraceService initialized for performance monitoring');
    //   },
    //   deps: [TraceService],
    //   multi: true,
    // },
  ],
};

/**
 * Custom Smart ErrorHandler với business logic
 * Extends EnhancedUnifiedErrorHandler để thêm logic tùy chỉnh
 */
import { Injectable } from "@angular/core";

@Injectable()
export class CustomSmartErrorHandler extends EnhancedUnifiedErrorHandler {
  // monitoring is already available from parent class

  override handleError(error: any): void {
    // Custom business logic trước khi xử lý error
    const errorInfo = this.extractErrorInfo(error);

    // 1. Route errors dựa trên environment
    if (this.isProduction()) {
      // Production: chỉ log critical errors
      if (errorInfo.level === "fatal" || errorInfo.level === "error") {
        super.handleError(error);
      }
    } else {
      // Development: log tất cả errors
      super.handleError(error);
    }

    // 2. Special handling cho specific error types
    if (errorInfo.type === "ChunkLoadError") {
      // Handle chunk load errors (thường do deployment mới)
      this.handleChunkLoadError(error);
      return;
    }

    if (errorInfo.category === "network") {
      // Handle network errors differently
      this.handleNetworkError(error);
      return;
    }

    // 3. User notification cho critical errors
    if (errorInfo.level === "fatal") {
      this.showUserNotification("Đã xảy ra lỗi nghiêm trọng. Vui lòng tải lại trang.");
    }
  }

  private isProduction(): boolean {
    // Implement production check
    return window.location.hostname !== "localhost";
  }

  private handleChunkLoadError(error: any): void {
    // Suggest page reload for chunk load errors
    console.warn("Chunk load error detected, suggesting page reload");

    this.monitoring.addBreadcrumb({
      message: "Chunk load error - suggesting reload",
      category: "deployment",
      level: "warning",
      data: {
        component: this.getActualComponent(error),
        url: window.location.href,
      },
    });

    // Show user-friendly message
    if (confirm("Ứng dụng đã được cập nhật. Bạn có muốn tải lại trang không?")) {
      window.location.reload();
    }
  }

  private handleNetworkError(error: any): void {
    console.warn("Network error detected:", error);

    this.monitoring.addBreadcrumb({
      message: "Network error occurred",
      category: "network",
      level: "warning",
      data: {
        online: navigator.onLine,
        url: window.location.href,
      },
    });

    // Don't spam Sentry with network errors in development
    if (!this.isProduction()) {
      return;
    }

    // Only log to monitoring if it's a persistent network issue
    this.monitoring.captureException(error, {
      component: this.getActualComponent(error),
      level: "warning",
      extra: {
        networkStatus: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType,
        errorHandler: "CustomSmartErrorHandler",
      },
    });
  }

  private showUserNotification(message: string): void {
    // Implement user notification (toast, modal, etc.)
    console.error("USER NOTIFICATION:", message);

    // Example: Show toast notification
    // this.toastService.error(message);

    // Example: Show modal
    // this.modalService.showError(message);
  }
}

/**
 * Alternative configuration cho production
 */
export const productionAppConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter([]), // Replace with your actual routes
    provideHttpClient(withInterceptorsFromDi()),
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthInterceptor, // Replace with your actual interceptor
    //   multi: true
    // },

    // Production: Sử dụng Enhanced ErrorHandler với throttling
    {
      provide: ErrorHandler,
      useClass: EnhancedUnifiedErrorHandler,
    },

    // Production monitoring config
    {
      provide: APP_INITIALIZER,
      useFactory: (monitoring: UnifiedMonitoringService) => {
        return async () => {
          await monitoring.initializeWithEnvironment("production", {
            environment: "production",
            debug: false,
            sampleRate: 0.1, // Chỉ sample 10% errors
            enablePerformance: true,
            enableReplay: false, // Tắt replay trong production
            dsn: "your-production-sentry-dsn",
          });

          initializeErrorHandling(monitoring);
        };
      },
      deps: [UnifiedMonitoringService],
      multi: true,
    },

    // Optional: Sentry performance monitoring
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: () => () => {},
    //   deps: [TraceService],
    //   multi: true,
    // },
  ],
};

/**
 * Utility function để chọn config dựa trên environment
 */
export function getAppConfig(): ApplicationConfig {
  const isProduction = window.location.hostname !== "localhost";
  return isProduction ? productionAppConfig : appConfig;
}

/**
 * CÁCH SỬ DỤNG TRONG main.ts:
 *
 * import { bootstrapApplication } from '@angular/platform-browser';
 * import { AppComponent } from './app/app.component';
 * import { getAppConfig } from './app/monitoring/examples/app.config.unified-error-handler';
 *
 * bootstrapApplication(AppComponent, getAppConfig())
 *   .then(() => {
 *     console.log('🚀 Application started with unified error handling');
 *   })
 *   .catch(err => {
 *     console.error('❌ Application failed to start:', err);
 *   });
 */

/**
 * TESTING ERROR HANDLER:
 *
 * // Trong browser console:
 *
 * // Test JavaScript error
 * throw new Error('Test error');
 *
 * // Test promise rejection
 * Promise.reject(new Error('Test promise rejection'));
 *
 * // Test network error simulation
 * fetch('/non-existent-endpoint').catch(err => {
 *   throw new Error('Network error: ' + err.message);
 * });
 *
 * // Check error logs
 * // Mở monitoring dashboard hoặc check console logs
 */
