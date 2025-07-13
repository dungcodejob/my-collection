# Migration Guide: Từ Sentry ErrorHandler sang Unified ErrorHandler

## Tổng quan

Hướng dẫn này sẽ giúp bạn chuyển đổi từ việc sử dụng Sentry ErrorHandler sang UnifiedErrorHandler tùy chỉnh, cho phép kiểm soát tốt hơn việc xử lý lỗi và tích hợp với hệ thống monitoring hiện có.

## Lợi ích của UnifiedErrorHandler

### ✅ Ưu điểm

- **Kiểm soát hoàn toàn**: Tự quyết định cách xử lý từng loại lỗi
- **Tích hợp đa provider**: Có thể gửi lỗi đến nhiều provider (Sentry, Console, Custom)
- **Error throttling**: Tránh spam khi có quá nhiều lỗi
- **Context phong phú**: Thêm nhiều thông tin context hơn
- **Flexible routing**: Route các loại lỗi khác nhau đến các provider khác nhau
- **Local logging**: Lưu trữ lỗi local cho debugging

### ⚠️ Cân nhắc

- **Complexity**: Phức tạp hơn so với Sentry ErrorHandler
- **Maintenance**: Cần maintain code tự viết
- **Performance**: Cần optimize để tránh impact performance

## Bước 1: Backup cấu hình hiện tại

### Current app.config.ts

```typescript
// BEFORE: Sử dụng Sentry ErrorHandler
import { createErrorHandler, TraceService } from "@sentry/angular";

export const appConfig: ApplicationConfig = {
  providers: [
    // Sentry Error Handler
    {
      provide: ErrorHandler,
      useValue: createErrorHandler({
        showDialog: false,
        logErrors: true,
      }),
    },
    // Sentry Trace Service
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [TraceService],
      multi: true,
    },
  ],
};
```

## Bước 2: Cài đặt UnifiedErrorHandler

### Updated app.config.ts

```typescript
// AFTER: Sử dụng UnifiedErrorHandler
import { ErrorHandler, APP_INITIALIZER } from "@angular/core";
import { TraceService } from "@sentry/angular"; // Vẫn giữ cho performance monitoring
import {
  UnifiedErrorHandler,
  EnhancedUnifiedErrorHandler,
  initializeErrorHandling,
} from "./monitoring/examples/angular-error-handler.example";
import { UnifiedMonitoringService } from "./monitoring/data-access/unified-monitoring.service";

export const appConfig: ApplicationConfig = {
  providers: [
    // Unified Error Handler (chọn một trong hai)
    {
      provide: ErrorHandler,
      useClass: UnifiedErrorHandler, // Hoặc EnhancedUnifiedErrorHandler
    },

    // Vẫn giữ Sentry TraceService cho performance monitoring
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [TraceService],
      multi: true,
    },

    // Initialize error handling
    {
      provide: APP_INITIALIZER,
      useFactory: (monitoring: UnifiedMonitoringService) => {
        return () => initializeErrorHandling(monitoring);
      },
      deps: [UnifiedMonitoringService],
      multi: true,
    },
  ],
};
```

## Bước 3: Cấu hình UnifiedMonitoringService

### Đảm bảo Sentry provider được cấu hình

```typescript
// Trong component hoặc service initialization
const monitoringConfig: MonitoringConfig = {
  environment: environment.production ? "production" : "development",
  debug: !environment.production,
  sampleRate: environment.production ? 0.1 : 1.0,
  enablePerformance: true,
  enableReplay: !environment.production,
  dsn: environment.sentryDsn,
};

// Initialize với Sentry provider
await this.monitoring.initializeWithEnvironment(
  monitoringConfig.environment,
  monitoringConfig
);
```

## Bước 4: Testing và Validation

### Test Error Handling

```typescript
@Component({
  template: `
    <button (click)="testJavaScriptError()">Test JS Error</button>
    <button (click)="testPromiseRejection()">Test Promise Rejection</button>
    <button (click)="testHttpError()">Test HTTP Error</button>
    <button (click)="testCustomError()">Test Custom Error</button>
  `,
})
export class ErrorTestComponent {
  private monitoring = inject(UnifiedMonitoringService);

  testJavaScriptError(): void {
    throw new Error("Test JavaScript Error");
  }

  testPromiseRejection(): void {
    Promise.reject(new Error("Test Promise Rejection"));
  }

  testHttpError(): void {
    // Simulate HTTP error
    const httpError = {
      error: new Error("HTTP 500 Error"),
      status: 500,
      statusText: "Internal Server Error",
    };
    throw httpError;
  }

  testCustomError(): void {
    this.monitoring.captureException(new Error("Custom Error"), {
      component: "ErrorTestComponent",
      level: "warning",
      extra: { testType: "manual" },
    });
  }
}
```

### Kiểm tra Error Logs

```typescript
// Xem error logs trong console hoặc monitoring dashboard
this.monitoring.getErrorLogs().subscribe(logs => {
  console.log("Current error logs:", logs);
});

// Xem system metrics
this.monitoring.getSystemMetrics().subscribe(metrics => {
  console.log("System metrics:", metrics);
});
```

## Bước 5: Advanced Configuration

### Custom Error Routing

```typescript
@Injectable()
export class SmartErrorHandler extends UnifiedErrorHandler {
  override handleError(error: any): void {
    const errorInfo = this.extractErrorInfo(error);

    // Route errors based on type
    if (errorInfo.category === "network") {
      // Send network errors only to console in development
      if (!environment.production) {
        console.warn("Network error (dev only):", error);
        return;
      }
    }

    if (errorInfo.level === "fatal") {
      // Send critical errors to multiple providers
      this.monitoring.captureException(errorInfo.error, {
        component: "smart-error-handler",
        level: "fatal",
        extra: { priority: "high", requiresImmedateAttention: true },
      });

      // Also send email notification (if configured)
      this.sendCriticalErrorNotification(errorInfo.error);
    }

    super.handleError(error);
  }

  private sendCriticalErrorNotification(error: Error): void {
    // Implementation for critical error notifications
  }
}
```

### Error Analytics

```typescript
@Injectable()
export class AnalyticsErrorHandler extends UnifiedErrorHandler {
  private errorStats = new Map<string, number>();

  override handleError(error: any): void {
    // Track error frequency
    const errorType = error.constructor.name;
    const count = this.errorStats.get(errorType) || 0;
    this.errorStats.set(errorType, count + 1);

    // Send analytics data
    this.monitoring.recordPerformance({
      name: "error_frequency",
      value: count + 1,
      unit: "count",
      type: "counter",
      timestamp: new Date(),
      threshold: 10, // Alert if same error occurs > 10 times
      component: "analytics-error-handler",
      metadata: {
        errorType,
        totalUniqueErrors: this.errorStats.size,
      },
    });

    super.handleError(error);
  }
}
```

## Bước 6: Monitoring và Alerting

### Setup Error Alerts

```typescript
// Trong monitoring service hoặc component
this.monitoring.getErrorLogs().subscribe(logs => {
  const criticalErrors = logs.filter(log => log.severity === "critical");

  if (criticalErrors.length > 0) {
    // Trigger alert
    this.showCriticalErrorAlert(criticalErrors);
  }
});

// Setup performance monitoring cho error handling
this.monitoring.recordPerformance({
  name: "error_handler_performance",
  value: Date.now() - startTime,
  unit: "ms",
  type: "timing",
  timestamp: new Date(),
  component: "unified-error-handler",
});
```

## Rollback Plan

Nếu cần rollback về Sentry ErrorHandler:

```typescript
// Revert app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    // Rollback to Sentry ErrorHandler
    {
      provide: ErrorHandler,
      useValue: createErrorHandler({
        showDialog: false,
        logErrors: true,
      }),
    },
    // Comment out UnifiedErrorHandler
    // {
    //   provide: ErrorHandler,
    //   useClass: UnifiedErrorHandler
    // },
  ],
};
```

## Best Practices

### 1. Error Categorization

```typescript
// Phân loại lỗi theo mức độ nghiêm trọng
const ERROR_CATEGORIES = {
  CRITICAL: ["SecurityError", "AuthenticationError"],
  HIGH: ["HttpError", "NetworkError"],
  MEDIUM: ["ValidationError", "BusinessLogicError"],
  LOW: ["UIError", "DisplayError"],
};
```

### 2. Performance Optimization

```typescript
// Debounce error reporting
private errorQueue: Error[] = [];
private processErrorsDebounced = debounce(() => {
  this.processBatchErrors(this.errorQueue);
  this.errorQueue = [];
}, 1000);
```

### 3. Error Context Enhancement

```typescript
// Thêm context phong phú
const enhancedContext = {
  user: this.getCurrentUser(),
  session: this.getSessionInfo(),
  feature: this.getCurrentFeature(),
  performance: this.getPerformanceMetrics(),
  environment: this.getEnvironmentInfo(),
};
```

## Kết luận

UnifiedErrorHandler cung cấp sự linh hoạt và kiểm soát tốt hơn so với Sentry ErrorHandler mặc định. Tuy nhiên, cần cân nhắc kỹ về complexity và maintenance cost trước khi migration.

### Khuyến nghị:

- **Development**: Sử dụng UnifiedErrorHandler để có control tốt hơn
- **Production**: Có thể kết hợp cả hai (Sentry cho reliability, Unified cho customization)
- **Testing**: Luôn test kỹ error handling sau khi migration
