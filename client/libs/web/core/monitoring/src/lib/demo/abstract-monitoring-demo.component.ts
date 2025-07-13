import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import {
  MonitoringErrorLevel,
  MonitoringPerformanceType,
  MonitoringUserContext,
} from "../data-access";
import { MonitoringFactory } from "../data-access/monitoring.factory";
import { UnifiedMonitoringService } from "../data-access/unified-monitoring.service";

@Component({
  selector: "app-abstract-monitoring-demo",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="monitoring-demo-container">
      <h2>🔍 Abstract Monitoring Demo</h2>
      <p>
        This demo shows how to use the abstract monitoring architecture with loose
        coupling.
      </p>

      <!-- Status Section -->
      <div class="status-section">
        <h3>📊 Monitoring Status</h3>
        <div class="status-card">
          <p>
            <strong>Status:</strong>
            <span [class]="'status-' + healthStatus.status">{{
              healthStatus.status
            }}</span>
          </p>
          <p><strong>Providers:</strong></p>
          <ul>
            <li *ngFor="let provider of healthStatus.providers">
              {{ provider.name }} -
              <span [class]="provider.initialized ? 'status-active' : 'status-inactive'">
                {{ provider.initialized ? "Active" : "Inactive" }}
              </span>
            </li>
          </ul>
          <p><strong>Errors:</strong> {{ healthStatus.errorCount }}</p>
          <p><strong>Performance Metrics:</strong> {{ healthStatus.performanceCount }}</p>
        </div>
      </div>

      <!-- Provider Management -->
      <div class="provider-section">
        <h3>🔧 Provider Management</h3>
        <div class="button-group">
          <button (click)="addConsoleProvider()" class="btn btn-secondary">
            Add Console Provider
          </button>
          <button (click)="addSentryProvider()" class="btn btn-secondary">
            Add Sentry Provider
          </button>
          <button (click)="removeProvider('console')" class="btn btn-danger">
            Remove Console
          </button>
          <button (click)="removeProvider('sentry')" class="btn btn-danger">
            Remove Sentry
          </button>
        </div>
      </div>

      <!-- Error Testing -->
      <div class="test-section">
        <h3>🚨 Error Testing</h3>
        <div class="button-group">
          <button (click)="testError('debug')" class="btn btn-info">Debug Error</button>
          <button (click)="testError('info')" class="btn btn-info">Info Error</button>
          <button (click)="testError('warning')" class="btn btn-warning">
            Warning Error
          </button>
          <button (click)="testError('error')" class="btn btn-danger">Error</button>
          <button (click)="testError('fatal')" class="btn btn-danger">Fatal Error</button>
          <button (click)="testException()" class="btn btn-danger">Test Exception</button>
        </div>
      </div>

      <!-- Performance Testing -->
      <div class="test-section">
        <h3>📈 Performance Testing</h3>
        <div class="button-group">
          <button (click)="testPerformance('custom')" class="btn btn-primary">
            Custom Metric
          </button>
          <button (click)="testPerformance('web-vital')" class="btn btn-primary">
            Web Vital
          </button>
          <button (click)="testSlowOperation()" class="btn btn-warning">
            Slow Operation
          </button>
          <button (click)="testApiCall()" class="btn btn-primary">API Call</button>
        </div>
      </div>

      <!-- User Context -->
      <div class="test-section">
        <h3>👤 User Context</h3>
        <div class="button-group">
          <button (click)="setUserContext()" class="btn btn-success">Set User</button>
          <button (click)="clearUserContext()" class="btn btn-secondary">
            Clear User
          </button>
          <button (click)="setCustomContext()" class="btn btn-info">Set Context</button>
          <button (click)="addBreadcrumb()" class="btn btn-info">Add Breadcrumb</button>
        </div>
      </div>

      <!-- Transaction Testing -->
      <div class="test-section">
        <h3>🔄 Transaction Testing</h3>
        <div class="button-group">
          <button (click)="startTransaction()" class="btn btn-success">
            Start Transaction
          </button>
          <button (click)="finishTransaction()" class="btn btn-primary">
            Finish Transaction
          </button>
        </div>
        <p *ngIf="currentTransaction">
          Transaction "{{ currentTransactionName }}" is running...
        </p>
      </div>

      <!-- Data Export -->
      <div class="export-section">
        <h3>📤 Data Export</h3>
        <div class="button-group">
          <button (click)="exportDebugData()" class="btn btn-info">
            Export Debug Data
          </button>
          <button (click)="clearAllData()" class="btn btn-warning">Clear All Data</button>
          <button (click)="flushProviders()" class="btn btn-secondary">
            Flush Providers
          </button>
        </div>
      </div>

      <!-- Recent Errors -->
      <div class="data-section" *ngIf="recentErrors.length > 0">
        <h3>🚨 Recent Errors</h3>
        <div class="error-list">
          <div *ngFor="let error of recentErrors" class="error-item">
            <span class="error-level">{{ error.level.toUpperCase() }}</span>
            <span class="error-message">{{ error.message }}</span>
            <span class="error-time">{{ error.timestamp | date : "short" }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Performance -->
      <div class="data-section" *ngIf="recentPerformance.length > 0">
        <h3>📊 Recent Performance</h3>
        <div class="performance-list">
          <div *ngFor="let metric of recentPerformance" class="performance-item">
            <span class="metric-name">{{ metric.name }}</span>
            <span class="metric-value">{{ metric.value }}{{ metric.unit }}</span>
            <span class="metric-type">{{ metric.type }}</span>
            <span class="metric-time">{{ metric.timestamp | date : "short" }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .monitoring-demo-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .status-section,
      .provider-section,
      .test-section,
      .export-section,
      .data-section {
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f9f9f9;
      }

      .status-card {
        background: white;
        padding: 15px;
        border-radius: 6px;
        border: 1px solid #eee;
      }

      .button-group {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 10px;
      }

      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s;
      }

      .btn-primary {
        background: #007bff;
        color: white;
      }
      .btn-secondary {
        background: #6c757d;
        color: white;
      }
      .btn-success {
        background: #28a745;
        color: white;
      }
      .btn-danger {
        background: #dc3545;
        color: white;
      }
      .btn-warning {
        background: #ffc107;
        color: black;
      }
      .btn-info {
        background: #17a2b8;
        color: white;
      }

      .btn:hover {
        opacity: 0.8;
      }

      .status-active {
        color: #28a745;
        font-weight: bold;
      }
      .status-inactive {
        color: #dc3545;
        font-weight: bold;
      }
      .status-active {
        color: #28a745;
      }
      .status-initializing {
        color: #ffc107;
      }
      .status-error {
        color: #dc3545;
      }

      .error-list,
      .performance-list {
        max-height: 300px;
        overflow-y: auto;
      }

      .error-item,
      .performance-item {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        margin: 4px 0;
        background: white;
        border-radius: 4px;
        border: 1px solid #eee;
      }

      .error-level {
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 12px;
      }

      .error-message {
        flex: 1;
        margin: 0 10px;
      }

      .error-time,
      .metric-time {
        font-size: 12px;
        color: #666;
      }

      .metric-name {
        font-weight: bold;
      }

      .metric-value {
        color: #007bff;
        font-weight: bold;
      }

      .metric-type {
        font-size: 12px;
        color: #666;
        text-transform: uppercase;
      }
    `,
  ],
})
export class AbstractMonitoringDemoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private monitoringService = inject(UnifiedMonitoringService);
  private monitoringFactory = inject(MonitoringFactory);

  healthStatus: any = {};
  recentErrors: any[] = [];
  recentPerformance: any[] = [];
  currentTransaction: any = null;
  currentTransactionName = "";

  ngOnInit(): void {
    this.initializeMonitoring();
    this.subscribeToUpdates();
    this.updateStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.currentTransaction) {
      this.currentTransaction.finish();
    }
  }

  private async initializeMonitoring(): Promise<void> {
    try {
      await this.monitoringService.initializeWithEnvironment("development", {
        debug: true,
        sampleRate: 1.0,
      });
      console.log("Abstract monitoring initialized successfully");
    } catch (error) {
      console.error("Failed to initialize monitoring:", error);
    }
  }

  private subscribeToUpdates(): void {
    // Subscribe to errors
    this.monitoringService.errors$.pipe(takeUntil(this.destroy$)).subscribe(errors => {
      this.recentErrors = errors.slice(-10); // Keep last 10 errors
      this.updateStatus();
    });

    // Subscribe to performance
    this.monitoringService.performance$
      .pipe(takeUntil(this.destroy$))
      .subscribe(performance => {
        this.recentPerformance = performance.slice(-10); // Keep last 10 metrics
        this.updateStatus();
      });

    // Subscribe to status changes
    this.monitoringService.status$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateStatus();
    });
  }

  private updateStatus(): void {
    this.healthStatus = this.monitoringService.getHealthStatus();
  }

  // Provider Management
  addConsoleProvider(): void {
    const provider = this.monitoringFactory.createProvider("console");
    if (provider) {
      this.monitoringService.registerProvider(provider);
      console.log("Console provider added");
      this.updateStatus();
    }
  }

  addSentryProvider(): void {
    const provider = this.monitoringFactory.createProvider("sentry");
    if (provider) {
      this.monitoringService.registerProvider(provider, true);
      console.log("Sentry provider added");
      this.updateStatus();
    }
  }

  removeProvider(name: string): void {
    this.monitoringService.unregisterProvider(name);
    console.log(`${name} provider removed`);
    this.updateStatus();
  }

  // Error Testing
  testError(level: MonitoringErrorLevel): void {
    this.monitoringService.logErrorWithContext(
      `Test ${level} error from abstract monitoring demo`,
      level,
      "abstract-monitoring-demo",
      { testData: true, level, timestamp: Date.now() }
    );
  }

  testException(): void {
    try {
      throw new Error("Test exception from abstract monitoring demo");
    } catch (error) {
      this.monitoringService.captureException(error as Error, {
        component: "abstract-monitoring-demo",
        level: "error",
        extra: { testException: true },
      });
    }
  }

  // Performance Testing
  testPerformance(type: MonitoringPerformanceType): void {
    const value = Math.random() * 1000 + 100;
    this.monitoringService.recordPerformance({
      name: `test-${type}-metric`,
      value: value,
      unit: "ms",
      type: type,
      timestamp: new Date(),
      threshold: 500,
      component: "AbstractMonitoringDemoComponent",
    });
  }

  testSlowOperation(): void {
    const start = performance.now();

    // Simulate slow operation
    setTimeout(() => {
      const duration = performance.now() - start;
      this.monitoringService.recordPerformance({
        name: "slow-operation-simulation",
        value: duration,
        unit: "ms",
        type: "custom",
        timestamp: new Date(),
        threshold: 100,
        component: "AbstractMonitoringDemoComponent",
      });
    }, Math.random() * 500 + 200);
  }

  testApiCall(): void {
    const methods = ["GET", "POST", "PUT", "DELETE"];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const status = Math.random() > 0.8 ? 500 : Math.random() > 0.9 ? 404 : 200;
    const duration = Math.random() * 2000 + 100;

    this.monitoringService.trackApiCall(method, "/api/test", status, duration);
  }

  // User Context
  setUserContext(): void {
    const user: MonitoringUserContext = {
      id: "demo-user-" + Date.now(),
      email: "demo@example.com",
      username: "demo-user",
      segment: "demo",
    };

    this.monitoringService.setUserWithContext(user);
  }

  clearUserContext(): void {
    this.monitoringService.clearUser();
  }

  setCustomContext(): void {
    this.monitoringService.setContext("demo-context", {
      feature: "abstract-monitoring-demo",
      timestamp: new Date().toISOString(),
      randomValue: Math.random(),
    });

    this.monitoringService.setTag("demo-tag", "abstract-monitoring");
  }

  addBreadcrumb(): void {
    this.monitoringService.addBreadcrumb({
      message: "Demo breadcrumb added",
      category: "demo",
      level: "info",
      data: { timestamp: Date.now() },
    });
  }

  // Transaction Testing
  startTransaction(): void {
    if (this.currentTransaction) {
      this.currentTransaction.finish();
    }

    this.currentTransactionName = `demo-transaction-${Date.now()}`;
    this.currentTransaction = this.monitoringService.startTransaction(
      this.currentTransactionName,
      {
        description: "Demo transaction from abstract monitoring",
        tags: { demo: "true", type: "test" },
      }
    );
  }

  finishTransaction(): void {
    if (this.currentTransaction) {
      this.currentTransaction.setStatus("ok");
      this.currentTransaction.finish();
      this.currentTransaction = null;
      this.currentTransactionName = "";
    }
  }

  // Data Export
  exportDebugData(): void {
    const debugData = this.monitoringService.exportDebugData();
    console.log("Debug Data:", debugData);

    // Create downloadable file
    const blob = new Blob([JSON.stringify(debugData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monitoring-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clearAllData(): void {
    this.monitoringService.clearErrors();
    this.monitoringService.clearPerformance();
    this.recentErrors = [];
    this.recentPerformance = [];
    console.log("All monitoring data cleared");
  }

  async flushProviders(): Promise<void> {
    const success = await this.monitoringService.flush();
    console.log("Flush result:", success);
  }
}
