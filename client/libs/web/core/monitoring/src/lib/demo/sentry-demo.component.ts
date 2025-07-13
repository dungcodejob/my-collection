import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MonitoringService } from "../data-access/monitoring.service";
import { UnifiedMonitoringService } from "../data-access/unified-monitoring.service";
import { MonitoringPerformanceData, MonitoringTransaction } from "../models";

@Component({
  selector: "app-sentry-demo",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sentry-demo p-6 bg-white rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Sentry Integration Demo</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <!-- Error Testing -->
        <div class="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 class="text-lg font-semibold text-red-800 mb-3">Error Testing</h3>
          <div class="space-y-2">
            <button
              (click)="throwJavaScriptError()"
              class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Throw JavaScript Error
            </button>
            <button
              (click)="throwAsyncError()"
              class="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Throw Async Error
            </button>
            <button
              (click)="logCustomError()"
              class="w-full px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500 transition-colors"
            >
              Log Custom Error
            </button>
          </div>
        </div>

        <!-- Message Testing -->
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 class="text-lg font-semibold text-blue-800 mb-3">Message Testing</h3>
          <div class="space-y-2">
            <button
              (click)="sendInfoMessage()"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Send Info Message
            </button>
            <button
              (click)="sendWarningMessage()"
              class="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            >
              Send Warning Message
            </button>
            <button
              (click)="sendCriticalMessage()"
              class="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              Send Critical Message
            </button>
          </div>
        </div>

        <!-- Performance Testing -->
        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 class="text-lg font-semibold text-green-800 mb-3">Performance Testing</h3>
          <div class="space-y-2">
            <button
              (click)="simulateSlowOperation()"
              class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Simulate Slow Operation
            </button>
            <button
              (click)="recordPerformance()"
              class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Record Performance Metric
            </button>
            <button
              (click)="simulateMemoryLeak()"
              class="w-full px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500 transition-colors"
            >
              Simulate Memory Issue
            </button>
          </div>
        </div>
      </div>

      <!-- User Context Testing -->
      <div class="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
        <h3 class="text-lg font-semibold text-purple-800 mb-3">User Context Testing</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            (click)="setUserContext()"
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Set User Context
          </button>
          <button
            (click)="clearUserContext()"
            class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Clear User Context
          </button>
          <button
            (click)="addBreadcrumb()"
            class="px-4 py-2 bg-purple-400 text-white rounded hover:bg-purple-500 transition-colors"
          >
            Add Breadcrumb
          </button>
        </div>
      </div>

      <!-- Transaction Testing -->
      <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
        <h3 class="text-lg font-semibold text-indigo-800 mb-3">Transaction Testing</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button
            (click)="startTransaction()"
            class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Start Transaction
          </button>
          <button
            (click)="finishTransaction()"
            class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
            [disabled]="!currentTransaction"
          >
            Finish Transaction
          </button>
        </div>
      </div>

      <!-- Instructions -->
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Click the buttons above to test different Sentry features</li>
          <li>• Check your Sentry dashboard to see the captured events</li>
          <li>• Make sure to configure your DSN in main.ts</li>
          <li>• Open browser console to see local logging</li>
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
      .sentry-demo {
        max-width: 1200px;
        margin: 0 auto;
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class SentryDemoComponent {
  private unifiedMonitoringService = inject(UnifiedMonitoringService);
  private monitoringService = inject(MonitoringService);

  currentTransaction: MonitoringTransaction | null = null;

  /**
   * Throw a JavaScript error to test error capturing
   */
  throwJavaScriptError(): void {
    console.log("Throwing JavaScript error...");
    throw new Error("This is a test JavaScript error from Sentry Demo");
  }

  /**
   * Throw an async error to test async error capturing
   */
  async throwAsyncError(): Promise<void> {
    console.log("Throwing async error...");
    try {
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("This is a test async error from Sentry Demo"));
        }, 100);
      });
    } catch (error) {
      // Re-throw to let Sentry catch it
      throw error;
    }
  }

  /**
   * Log a custom error through monitoring service
   */
  logCustomError(): void {
    console.log("Logging custom error...");
    this.monitoringService.logError({
      message: "Custom error logged through MonitoringService",
      severity: "high",
      component: "SentryDemoComponent",
      type: "CustomError",
      source: "demo",
      stackTrace: new Error().stack,
    });
  }

  /**
   * Send info message to Sentry
   */
  sendInfoMessage(): void {
    console.log("Sending info message...");
    this.unifiedMonitoringService.logErrorWithContext(
      "This is an info message from Sentry Demo",
      "info",
      "SentryDemoComponent",
      { action: "info_test" }
    );
  }

  /**
   * Send warning message to Sentry
   */
  sendWarningMessage(): void {
    console.log("Sending warning message...");
    this.unifiedMonitoringService.logErrorWithContext(
      "This is a warning message from Sentry Demo",
      "warning",
      "SentryDemoComponent",
      { action: "warning_test" }
    );
  }

  /**
   * Send critical message to Sentry
   */
  sendCriticalMessage(): void {
    console.log("Sending critical message...");
    this.unifiedMonitoringService.logErrorWithContext(
      "This is a critical message from Sentry Demo",
      "fatal",
      "SentryDemoComponent",
      { action: "critical_test" }
    );
  }

  /**
   * Simulate a slow operation
   */
  async simulateSlowOperation(): Promise<void> {
    console.log("Simulating slow operation...");
    const transaction = this.unifiedMonitoringService.startTransaction("slow-operation", {
      description: "Simulating slow operation for demo",
      tags: { component: "SentryDemoComponent", type: "task" },
    });

    try {
      // Simulate slow work
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record performance metric
      this.monitoringService.recordPerformance({
        name: "Slow Operation Duration",
        value: 2000,
        unit: "ms",
        threshold: 1000,
        component: "SentryDemoComponent",
      });

      if (transaction) {
        transaction.setStatus("ok");
      }
    } catch (error) {
      if (transaction) {
        transaction.setStatus("internal");
      }
      throw error;
    } finally {
      if (transaction) {
        transaction.finish();
      }
    }
  }

  /**
   * Record a performance metric
   */
  recordPerformance(): void {
    console.log("Recording performance metric...");
    const performanceData: MonitoringPerformanceData = {
      name: "demo-operation",
      value: Math.random() * 1000,
      unit: "ms",
      type: "custom",
      timestamp: new Date(),
      threshold: 500,
    };
    this.unifiedMonitoringService.recordPerformance(performanceData);
  }

  /**
   * Simulate memory issue
   */
  simulateMemoryLeak(): void {
    console.log("Simulating memory issue...");

    // Simulate high memory usage
    this.monitoringService.recordPerformance({
      name: "Memory Usage",
      value: 95,
      unit: "%",
      threshold: 85,
      component: "SentryDemoComponent",
    });
  }

  /**
   * Set user context
   */
  setUserContext(): void {
    console.log("Setting user context...");
    this.unifiedMonitoringService.setUserWithContext({
      id: "demo-user-123",
      email: "demo@example.com",
      username: "Demo User",
    });

    this.unifiedMonitoringService.setTag("demo_mode", "true");
    this.unifiedMonitoringService.setContext("demoInfo", {
      component: "SentryDemoComponent",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }

  /**
   * Clear user context
   */
  clearUserContext(): void {
    console.log("Clearing user context...");
    this.unifiedMonitoringService.clearUser();
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(): void {
    console.log("Adding breadcrumb...");
    this.unifiedMonitoringService.trackUserAction(
      "User clicked breadcrumb test button",
      "user",
      {
        component: "SentryDemoComponent",
        timestamp: new Date().toISOString(),
      }
    );
  }

  /**
   * Start a transaction
   */
  startTransaction(): void {
    console.log("Starting transaction...");
    this.currentTransaction = this.unifiedMonitoringService.startTransaction(
      "demo-transaction",
      {
        description: "Demo transaction for testing",
        tags: { component: "SentryDemoComponent", type: "navigation" },
      }
    );

    this.unifiedMonitoringService.trackUserAction(
      "Demo transaction started",
      "navigation"
    );
  }

  /**
   * Finish the current transaction
   */
  finishTransaction(): void {
    if (this.currentTransaction) {
      console.log("Finishing transaction...");
      this.currentTransaction.setStatus("ok");
      this.currentTransaction.finish();
      this.currentTransaction = null;

      this.unifiedMonitoringService.trackUserAction(
        "Demo transaction finished",
        "navigation"
      );
    }
  }
}
