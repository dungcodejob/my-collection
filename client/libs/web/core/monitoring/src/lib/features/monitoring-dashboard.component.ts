import { Component, OnInit, OnDestroy, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MonitoringStore } from "../data-access/monitoring.store";
import { MonitoringService } from "../data-access/monitoring.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-monitoring-dashboard",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="monitoring-dashboard p-6 bg-gray-50 min-h-screen">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">System Monitoring Dashboard</h1>
          <div class="flex space-x-3 items-center">
            <!-- Refresh Interval Control -->
            <div class="flex items-center space-x-2">
              <label class="text-sm text-gray-600">Refresh:</label>
              <select
                [value]="refreshInterval()"
                (change)="updateRefreshInterval(+($event.target as HTMLSelectElement).value)"
                class="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="1000">1s</option>
                <option value="5000">5s</option>
                <option value="10000">10s</option>
                <option value="30000">30s</option>
              </select>
            </div>

            <button
              (click)="toggleMonitoring()"
              [class]="
                isMonitoring()
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              "
              class="px-4 py-2 text-white rounded-md text-sm font-medium transition-colors"
            >
              {{ isMonitoring() ? "Stop Monitoring" : "Start Monitoring" }}
            </button>
            <button
              (click)="clearErrors()"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium"
            >
              Clear Errors
            </button>
            <button
              (click)="recordTestError()"
              class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm font-medium"
            >
              Test Error
            </button>
          </div>
        </div>

        <!-- Status Overview -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <!-- System Status -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  [class]="
                    'w-8 h-8 rounded-full flex items-center justify-center ' +
                    (systemStatus() === 'healthy'
                      ? 'bg-green-100'
                      : systemStatus() === 'warning'
                      ? 'bg-yellow-100'
                      : 'bg-red-100')
                  "
                >
                  <svg
                    class="w-5 h-5"
                    [class]="
                      systemStatus() === 'healthy'
                        ? 'text-green-600'
                        : systemStatus() === 'warning'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    "
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    System Health
                  </dt>
                  <dd
                    class="text-lg font-medium"
                    [class]="
                      systemStatus() === 'healthy'
                        ? 'text-green-900'
                        : systemStatus() === 'warning'
                        ? 'text-yellow-900'
                        : 'text-red-900'
                    "
                  >
                    {{ systemStatus() | titlecase }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <!-- Monitoring Status -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  [class]="
                    'w-8 h-8 rounded-full flex items-center justify-center ' +
                    (isMonitoringActive() ? 'bg-blue-100' : 'bg-gray-100')
                  "
                >
                  <svg
                    class="w-5 h-5"
                    [class]="isMonitoringActive() ? 'text-blue-600' : 'text-gray-600'"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Monitoring</dt>
                  <dd
                    class="text-lg font-medium"
                    [class]="isMonitoringActive() ? 'text-blue-900' : 'text-gray-900'"
                  >
                    {{ isMonitoringActive() ? "Active" : "Inactive" }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <!-- Errors Count -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Errors</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ errorsCount() }}</dd>
                </dl>
              </div>
            </div>
          </div>

          <!-- Performance Metrics Count -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Performance Metrics
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ performanceCount() }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <!-- Refresh Interval Display -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Refresh Rate</dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ refreshInterval() / 1000 }}s
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Metrics Grid -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        *ngIf="metrics()"
      >
        <!-- CPU Usage -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">CPU Usage</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ metrics()!.cpuUsage | number : "1.1-1" }}%
              </p>
            </div>
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full"
                [style.width.%]="metrics()!.cpuUsage"
                [ngClass]="{
                  'bg-green-500': metrics()!.cpuUsage < 50,
                  'bg-yellow-500': metrics()!.cpuUsage >= 50 && metrics()!.cpuUsage < 80,
                  'bg-red-500': metrics()!.cpuUsage >= 80
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Memory Usage -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Memory Usage</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ metrics()!.memoryUsage | number : "1.1-1" }}%
              </p>
            </div>
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full"
                [style.width.%]="metrics()!.memoryUsage"
                [ngClass]="{
                  'bg-green-500': metrics()!.memoryUsage < 50,
                  'bg-yellow-500':
                    metrics()!.memoryUsage >= 50 && metrics()!.memoryUsage < 80,
                  'bg-red-500': metrics()!.memoryUsage >= 80
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Network Latency -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Network Latency</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ metrics()!.networkLatency | number : "1.0-0" }}ms
              </p>
            </div>
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Active Users -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Active Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ metrics()!.activeUsers }}</p>
            </div>
            <div
              class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Errors -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Recent Errors</h3>
              <button
                (click)="clearErrors()"
                class="text-sm text-red-600 hover:text-red-800"
              >
                @if (recentErrors().length > 0) { Clear All }
              </button>
            </div>
          </div>
          <div class="p-6">
            @if (recentErrors().length === 0) {
            <div class="text-center py-8">
              <svg
                class="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p class="mt-2 text-sm text-gray-500">No errors detected</p>
            </div>
            } @if (recentErrors().length > 0) {
            <div class="space-y-4">
              @for (error of recentErrors(); track error.timestamp) {
              <div
                class="flex items-start space-x-3 p-3 rounded-lg"
                [ngClass]="{
                  'bg-red-50 border border-red-200': error.severity === 'critical',
                  'bg-orange-50 border border-orange-200': error.severity === 'high',
                  'bg-yellow-50 border border-yellow-200': error.severity === 'medium',
                  'bg-blue-50 border border-blue-200': error.severity === 'low'
                }"
              >
                <div class="flex-shrink-0">
                  <div
                    class="w-2 h-2 rounded-full mt-2"
                    [ngClass]="{
                      'bg-red-500': error.severity === 'critical',
                      'bg-orange-500': error.severity === 'high',
                      'bg-yellow-500': error.severity === 'medium',
                      'bg-blue-500': error.severity === 'low'
                    }"
                  ></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ error.message }}</p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ error.timestamp | date : "short" }}
                    @if (error.component) {
                    <span> • {{ error.component }}</span>
                    }
                  </p>
                </div>
              </div>
              }
            </div>
            }
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Performance Metrics</h3>
          </div>
          <div class="p-6">
            @if (performance().length === 0) {
            <div class="text-center py-8">
              <svg
                class="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
              <p class="mt-2 text-sm text-gray-500">No performance data available</p>
            </div>
            } @if (performance().length > 0) {
            <div class="space-y-4">
              @for (metric of performance().slice(0, 10); track metric.timestamp) {
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ metric.name }}</p>
                  <p class="text-xs text-gray-500">
                    {{ metric.timestamp | date : "short" }}
                  </p>
                </div>
                <div class="text-right">
                  <p
                    class="text-sm font-bold"
                    [ngClass]="{
                      'text-red-600': metric.threshold && metric.value > metric.threshold,
                      'text-gray-900':
                        !metric.threshold || metric.value <= metric.threshold
                    }"
                  >
                    {{ metric.value | number : "1.1-1" }} {{ metric.unit }}
                  </p>
                  @if (metric.threshold) {
                  <p class="text-xs text-gray-400">
                    Threshold: {{ metric.threshold }} {{ metric.unit }}
                  </p>
                  }
                </div>
              </div>
              }
            </div>
            }
          </div>
        </div>
      </div>

      <!-- System Information -->
      <div class="mt-8 bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">System Information</h3>
        </div>
        <div class="p-6">
          @if (metrics()) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-sm font-medium text-gray-600">Response Time</p>
              <p class="text-lg font-bold text-gray-900">
                {{ metrics()!.responseTime | number : "1.0-0" }}ms
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Error Count</p>
              <p class="text-lg font-bold text-gray-900">{{ metrics()!.errorCount }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Last Updated</p>
              <p class="text-lg font-bold text-gray-900">
                {{ metrics()!.timestamp | date : "short" }}
              </p>
            </div>
          </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .monitoring-dashboard {
        font-family: "Inter", sans-serif;
      }

      .metric-card {
        transition: transform 0.2s ease-in-out;
      }

      .metric-card:hover {
        transform: translateY(-2px);
      }

      .progress-bar {
        transition: width 0.3s ease-in-out;
      }
    `,
  ],
})
export class MonitoringDashboardComponent implements OnInit, OnDestroy {
  private monitoringStore = inject(MonitoringStore);
  private monitoringService = inject(MonitoringService);
  private subscriptions = new Subscription();

  // Signal state
  isMonitoringActive = signal(false);
  refreshInterval = signal(5000);

  // Computed signals từ store
  readonly metrics = this.monitoringStore.metrics;
  readonly errors = this.monitoringStore.errors;
  readonly performance = this.monitoringStore.performance;
  readonly isMonitoring = this.monitoringStore.isMonitoring;
  readonly healthStatus = this.monitoringStore.healthStatus;
  readonly recentErrors = this.monitoringStore.recentErrors;
  readonly performanceIssues = this.monitoringStore.performanceIssues;

  // Additional computed signals
  systemStatus = computed(() => {
    const metrics = this.metrics();
    if (!metrics) return "unknown";
    return this.healthStatus();
  });

  metricsAvailable = computed(() => this.metrics() !== null);
  errorsCount = computed(() => this.errors().length);
  performanceCount = computed(() => this.performance().length);

  ngOnInit(): void {
    // Subscribe to monitoring service observables
    this.subscriptions.add(
      this.monitoringService.metrics$.subscribe(metrics => {
        this.monitoringStore.updateMetrics(metrics);
      })
    );

    this.subscriptions.add(
      this.monitoringService.errors$.subscribe(errors => {
        errors.forEach(error => this.monitoringStore.addError(error));
      })
    );

    this.subscriptions.add(
      this.monitoringService.performance$.subscribe(performance => {
        this.monitoringStore.updatePerformance(performance);
      })
    );

    // Start monitoring by default
    this.monitoringStore.startMonitoring();
    this.isMonitoringActive.set(true);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.monitoringStore.stopMonitoring();
    this.isMonitoringActive.set(false);
  }

  toggleMonitoring(): void {
    if (this.isMonitoring()) {
      this.monitoringStore.stopMonitoring();
      this.isMonitoringActive.set(false);
    } else {
      this.monitoringStore.startMonitoring();
      this.isMonitoringActive.set(true);
    }
  }

  clearErrors(): void {
    this.monitoringStore.clearErrors();
  }

  recordTestError(): void {
    this.monitoringStore.logError({
      message: "Test error for monitoring system",
      severity: "medium",
      component: "MonitoringDashboard",
    });
  }

  updateRefreshInterval(interval: number): void {
    this.refreshInterval.set(interval);
    // Restart monitoring with new interval if currently active
    if (this.isMonitoringActive()) {
      this.monitoringStore.stopMonitoring();
      setTimeout(() => {
        this.monitoringStore.startMonitoring();
      }, 100);
    }
  }
}
