import { Component, OnInit, OnDestroy, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MonitoringService } from "../data-access/monitoring.service";
import { MonitoringStore } from "../data-access/monitoring.store";
import { interval, Subscription } from "rxjs";

@Component({
  selector: "app-monitoring-demo",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="monitoring-demo">
      <h2>Monitoring System Demo</h2>

      <div class="demo-controls">
        <button
          (click)="startDemo()"
          [disabled]="!canStartDemo()"
          class="btn btn-primary"
        >
          Start Demo
        </button>

        <button
          (click)="stopDemo()"
          [disabled]="!canStopDemo()"
          class="btn btn-secondary"
        >
          Stop Demo
        </button>

        <button (click)="generateError()" class="btn btn-warning">Generate Error</button>

        <button (click)="clearErrors()" class="btn btn-danger">Clear Errors</button>
      </div>

      <div class="demo-status">
        <p><strong>Demo Status:</strong> {{ demoStatus() }}</p>
        <p>
          <strong>Monitoring Active:</strong> {{ store.isMonitoring() ? "Yes" : "No" }}
        </p>
        <p>
          <strong>Health Status:</strong>
          <span [class]="'status-' + store.healthStatus()">
            {{ store.healthStatus() | titlecase }}
          </span>
        </p>
      </div>

      <div class="demo-metrics">
        <h3>Current Metrics</h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <h4>CPU Usage</h4>
            <p>{{ store.metrics()?.cpuUsage | number : "1.1-1" }}%</p>
          </div>

          <div class="metric-card">
            <h4>Memory Usage</h4>
            <p>{{ store.metrics()?.memoryUsage | number : "1.1-1" }}%</p>
          </div>

          <div class="metric-card">
            <h4>Network Latency</h4>
            <p>{{ store.metrics()?.networkLatency | number : "1.0-0" }}ms</p>
          </div>

          <div class="metric-card">
            <h4>Active Users</h4>
            <p>{{ store.metrics()?.activeUsers }}</p>
          </div>

          <div class="metric-card">
            <h4>Error Count</h4>
            <p>{{ store.metrics()?.errorCount }}</p>
          </div>

          <div class="metric-card">
            <h4>Response Time</h4>
            <p>{{ store.metrics()?.responseTime | number : "1.0-0" }}ms</p>
          </div>
        </div>
      </div>

      @if (store.errors().length > 0) {
      <div class="demo-errors">
        <h3>Recent Errors ({{ store.errors().length }})</h3>
        <div class="error-list">
          @for (error of store.errors().slice(0, 5); track error.id) {
          <div
            class="error-item"
            [class.critical]="error.severity === 'critical'"
            [class.warning]="error.severity === 'medium' || error.severity === 'high'"
          >
            <div class="error-header">
              <span class="error-type">{{ error.type || "System Error" }}</span>
              <span class="error-severity">{{ error.severity }}</span>
              <span class="error-time">{{ error.timestamp | date : "short" }}</span>
            </div>
            <div class="error-message">{{ error.message }}</div>
            @if (error.source) {
            <div class="error-source">Source: {{ error.source }}</div>
            }
          </div>
          }
        </div>
      </div>
      } @if (store.performance().length > 0) {
      <div class="demo-performance">
        <h3>Performance Metrics</h3>
        <div class="performance-list">
          @for (perf of store.performance().slice(0, 5); track perf.id) {
          <div class="performance-item">
            <div class="perf-header">
              <span class="perf-name">{{ perf.name }}</span>
              <span class="perf-value"
                >{{ perf.value | number : "1.1-1" }} {{ perf.unit }}</span
              >
              <span class="perf-time">{{ perf.timestamp | date : "short" }}</span>
            </div>
            @if (perf.threshold) {
            <div class="perf-threshold">
              Threshold: {{ perf.threshold }} {{ perf.unit }}
              <span
                class="threshold-status"
                [class.exceeded]="perf.value > perf.threshold"
                [class.ok]="perf.value <= perf.threshold"
              >
                {{ perf.value > perf.threshold ? "EXCEEDED" : "OK" }}
              </span>
            </div>
            }
          </div>
          }
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .monitoring-demo {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .demo-controls {
        margin: 20px 0;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn-warning {
        background-color: #ffc107;
        color: black;
      }

      .btn-danger {
        background-color: #dc3545;
        color: white;
      }

      .demo-status {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 4px;
        margin: 20px 0;
      }

      .status-healthy {
        color: #28a745;
        font-weight: bold;
      }

      .status-warning {
        color: #ffc107;
        font-weight: bold;
      }

      .status-critical {
        color: #dc3545;
        font-weight: bold;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin: 20px 0;
      }

      .metric-card {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 15px;
        text-align: center;
      }

      .metric-card h4 {
        margin: 0 0 10px 0;
        color: #495057;
        font-size: 14px;
      }

      .metric-card p {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
      }

      .error-list,
      .performance-list {
        margin: 15px 0;
      }

      .error-item {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 15px;
        margin: 10px 0;
        border-left: 4px solid #6c757d;
      }

      .error-item.warning {
        border-left-color: #ffc107;
      }

      .error-item.critical {
        border-left-color: #dc3545;
      }

      .error-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .error-type {
        font-weight: bold;
        color: #495057;
      }

      .error-severity {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        text-transform: uppercase;
        background: #6c757d;
        color: white;
      }

      .error-time {
        font-size: 12px;
        color: #6c757d;
      }

      .error-message {
        color: #495057;
        margin-bottom: 5px;
      }

      .error-source {
        font-size: 12px;
        color: #6c757d;
      }

      .performance-item {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 15px;
        margin: 10px 0;
      }

      .perf-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .perf-name {
        font-weight: bold;
        color: #495057;
      }

      .perf-value {
        font-size: 18px;
        font-weight: bold;
        color: #007bff;
      }

      .perf-time {
        font-size: 12px;
        color: #6c757d;
      }

      .perf-threshold {
        font-size: 12px;
        color: #6c757d;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .threshold-status {
        padding: 2px 6px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 10px;
      }

      .threshold-status.ok {
        background: #d4edda;
        color: #155724;
      }

      .threshold-status.exceeded {
        background: #f8d7da;
        color: #721c24;
      }
    `,
  ],
})
export class MonitoringDemoComponent implements OnInit, OnDestroy {
  // Sử dụng Signal API
  isDemoRunning = signal(false);
  private demoSubscription?: Subscription;
  private errorGeneratorSubscription?: Subscription;

  public monitoringService = inject(MonitoringService);
  public store = inject(MonitoringStore);

  // Computed signals
  demoStatus = computed(() => (this.isDemoRunning() ? "Running" : "Stopped"));
  canStartDemo = computed(() => !this.isDemoRunning());
  canStopDemo = computed(() => this.isDemoRunning());

  ngOnInit() {
    // Khởi tạo một số dữ liệu mẫu
    this.initializeSampleData();
  }

  ngOnDestroy() {
    this.stopDemo();
  }

  startDemo() {
    if (this.isDemoRunning()) return;

    this.isDemoRunning.set(true);
    this.store.startMonitoring();

    // Tạo lỗi ngẫu nhiên mỗi 15 giây
    this.errorGeneratorSubscription = interval(15000).subscribe(() => {
      if (Math.random() > 0.7) {
        // 30% cơ hội tạo lỗi
        this.generateRandomError();
      }
    });

    // Tạo performance metrics ngẫu nhiên
    this.demoSubscription = interval(8000).subscribe(() => {
      this.generatePerformanceMetrics();
    });
  }

  stopDemo() {
    this.isDemoRunning.set(false);
    this.store.stopMonitoring();

    if (this.demoSubscription) {
      this.demoSubscription.unsubscribe();
      this.demoSubscription = undefined;
    }

    if (this.errorGeneratorSubscription) {
      this.errorGeneratorSubscription.unsubscribe();
      this.errorGeneratorSubscription = undefined;
    }
  }

  generateError() {
    this.generateRandomError();
  }

  clearErrors() {
    this.store.clearErrors();
  }

  private initializeSampleData() {
    // Tạo một số performance metrics mẫu
    this.store.recordPerformance("Initial Load Time", 1250, "ms", 3000);
    this.store.recordPerformance("JS Heap Size", 25.6, "MB", 50);
    this.store.recordPerformance("API Response Time", 180, "ms", 500);
  }

  private generateRandomError() {
    const errorTypes = [
      "Network Error",
      "Validation Error",
      "Database Error",
      "Authentication Error",
      "Permission Error",
    ];
    const severities: ("low" | "medium" | "high" | "critical")[] = [
      "low",
      "medium",
      "high",
      "critical",
    ];
    const sources = [
      "UserService",
      "AuthService",
      "DatabaseService",
      "ApiService",
      "ValidationService",
    ];

    const randomError = {
      type: errorTypes[Math.floor(Math.random() * errorTypes.length)],
      message: `Random error occurred at ${new Date().toLocaleTimeString()}`,
      severity: severities[Math.floor(Math.random() * severities.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      stackTrace:
        "Error\n    at Component.method (component.ts:123)\n    at Observable.subscribe (rxjs.js:456)",
    };

    this.store.logError(randomError);
  }

  private generatePerformanceMetrics() {
    const metrics = [
      { name: "Page Load Time", unit: "ms", min: 800, max: 3000, threshold: 2500 },
      { name: "API Response Time", unit: "ms", min: 50, max: 1000, threshold: 500 },
      { name: "JS Heap Size", unit: "MB", min: 15, max: 80, threshold: 50 },
      { name: "DOM Nodes Count", unit: "nodes", min: 100, max: 2000, threshold: 1500 },
      { name: "Memory Usage", unit: "%", min: 20, max: 95, threshold: 80 },
    ];

    const randomMetric = metrics[Math.floor(Math.random() * metrics.length)];
    const value =
      Math.random() * (randomMetric.max - randomMetric.min) + randomMetric.min;

    this.store.recordPerformance(
      randomMetric.name,
      Math.round(value * 100) / 100,
      randomMetric.unit,
      randomMetric.threshold
    );
  }
}
