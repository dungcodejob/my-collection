import { Component, OnInit, OnDestroy, inject, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MonitoringStore } from "../data-access/monitoring.store";
import { MonitoringService } from "../data-access/monitoring.service";
import { Subscription } from "rxjs";

interface AlertRule {
  id: string;
  name: string;
  metric: "cpuUsage" | "memoryUsage" | "networkLatency" | "responseTime" | "errorCount";
  operator: ">" | "<" | ">=" | "<=" | "==";
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  description?: string;
}

@Component({
  selector: "app-monitoring-alerts",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="monitoring-alerts p-6 bg-gray-50 min-h-screen">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Alert Management</h1>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">Alerts Enabled:</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  [checked]="alertsEnabled()"
                  (change)="toggleAlerts()"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                ></div>
              </label>
            </div>
            <button
              (click)="showCreateAlert.set(true)"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            >
              Create Alert Rule
            </button>
          </div>
        </div>
      </div>

      <!-- Active Alerts -->
      @if (getActiveAlerts().length > 0) {
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Active Alerts</h2>
        <div class="space-y-4">
          @for (alert of getActiveAlerts(); track alert.id) {
          <div
            class="bg-white border-l-4 rounded-lg shadow p-6"
            [ngClass]="{
              'border-red-500': alert.severity === 'critical',
              'border-orange-500': alert.severity === 'high',
              'border-yellow-500': alert.severity === 'medium',
              'border-blue-500': alert.severity === 'low'
            }"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-red-100 text-red-800': alert.severity === 'critical',
                      'bg-orange-100 text-orange-800': alert.severity === 'high',
                      'bg-yellow-100 text-yellow-800': alert.severity === 'medium',
                      'bg-blue-100 text-blue-800': alert.severity === 'low'
                    }"
                  >
                    {{ alert.severity.toUpperCase() }}
                  </span>
                  <h3 class="text-lg font-medium text-gray-900">{{ alert.name }}</h3>
                </div>
                <p class="text-sm text-gray-600 mt-1">
                  {{ alert.description || "No description available" }}
                </p>
                <p class="text-sm text-gray-500 mt-2">
                  Triggered: {{ alert.timestamp | date : "short" }}
                </p>
              </div>
              <button
                (click)="acknowledgeAlert(alert.id)"
                class="ml-4 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
              >
                Acknowledge
              </button>
            </div>
          </div>
          }
        </div>
      </div>
      }

      <!-- Alert Rules -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Alert Rules</h2>
        </div>
        <div class="p-6">
          @if (alertRules().length === 0) {
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
            <p class="mt-2 text-sm text-gray-500">No alert rules configured</p>
            <button
              (click)="showCreateAlert.set(true)"
              class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            >
              Create Your First Alert Rule
            </button>
          </div>
          } @else {
          <div class="space-y-4">
            @for (rule of alertRules(); track rule.id) {
            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <h3 class="text-lg font-medium text-gray-900">{{ rule.name }}</h3>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="{
                        'bg-red-100 text-red-800': rule.severity === 'critical',
                        'bg-orange-100 text-orange-800': rule.severity === 'high',
                        'bg-yellow-100 text-yellow-800': rule.severity === 'medium',
                        'bg-blue-100 text-blue-800': rule.severity === 'low'
                      }"
                    >
                      {{ rule.severity.toUpperCase() }}
                    </span>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="{
                        'bg-green-100 text-green-800': rule.enabled,
                        'bg-gray-100 text-gray-800': !rule.enabled
                      }"
                    >
                      {{ rule.enabled ? "ENABLED" : "DISABLED" }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ rule.description || "No description" }}
                  </p>
                  <p class="text-sm text-gray-500 mt-2">
                    Condition: {{ rule.metric }} {{ rule.operator }} {{ rule.threshold }}
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    (click)="toggleRule(rule.id)"
                    class="px-3 py-1 text-sm rounded"
                    [ngClass]="{
                      'bg-red-100 hover:bg-red-200 text-red-700': rule.enabled,
                      'bg-green-100 hover:bg-green-200 text-green-700': !rule.enabled
                    }"
                  >
                    {{ rule.enabled ? "Disable" : "Enable" }}
                  </button>
                  <button
                    (click)="editRule(rule)"
                    class="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    (click)="deleteRule(rule.id)"
                    class="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            }
          </div>
          }
        </div>
      </div>

      <!-- Create/Edit Alert Modal -->
      @if (showCreateAlert()) {
      <div
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      >
        <div
          class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        >
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ editingRule() ? "Edit Alert Rule" : "Create Alert Rule" }}
            </h3>
            <form (ngSubmit)="saveRule()" #alertForm="ngForm">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Rule Name</label
                  >
                  <input
                    type="text"
                    [ngModel]="currentRule().name"
                    (ngModelChange)="updateCurrentRule('name', $event)"
                    name="name"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Metric</label
                  >
                  <select
                    [ngModel]="currentRule().metric"
                    (ngModelChange)="updateCurrentRule('metric', $event)"
                    name="metric"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cpuUsage">CPU Usage (%)</option>
                    <option value="memoryUsage">Memory Usage (%)</option>
                    <option value="networkLatency">Network Latency (ms)</option>
                    <option value="responseTime">Response Time (ms)</option>
                    <option value="errorCount">Error Count</option>
                  </select>
                </div>

                <div class="flex space-x-2">
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                      >Operator</label
                    >
                    <select
                      [ngModel]="currentRule().operator"
                      (ngModelChange)="updateCurrentRule('operator', $event)"
                      name="operator"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value=">">Greater than (>)</option>
                      <option value=">=">Greater than or equal (>=)</option>
                      <option value="<">Less than (<)</option>
                      <option value="<=">Less than or equal (<=)</option>
                      <option value="==">Equal to (==)</option>
                    </select>
                  </div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                      >Threshold</label
                    >
                    <input
                      type="number"
                      [ngModel]="currentRule().threshold"
                      (ngModelChange)="updateCurrentRule('threshold', $event)"
                      name="threshold"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Severity</label
                  >
                  <select
                    [ngModel]="currentRule().severity"
                    (ngModelChange)="updateCurrentRule('severity', $event)"
                    name="severity"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Description</label
                  >
                  <textarea
                    [ngModel]="currentRule().description"
                    (ngModelChange)="updateCurrentRule('description', $event)"
                    name="description"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div class="flex items-center">
                  <input
                    type="checkbox"
                    [ngModel]="currentRule().enabled"
                    (ngModelChange)="updateCurrentRule('enabled', $event)"
                    name="enabled"
                    id="enabled"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="enabled" class="ml-2 block text-sm text-gray-900">
                    Enable this rule
                  </label>
                </div>
              </div>

              <div class="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  (click)="cancelEdit()"
                  class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="!alertForm.valid"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm disabled:opacity-50"
                >
                  {{ editingRule() ? "Update" : "Create" }} Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .monitoring-alerts {
        font-family: "Inter", sans-serif;
      }
    `,
  ],
})
export class MonitoringAlertsComponent implements OnInit, OnDestroy {
  private monitoringStore = inject(MonitoringStore);
  private monitoringService = inject(MonitoringService);
  private subscriptions = new Subscription();

  // Computed signals từ store
  readonly alertsEnabled = this.monitoringStore.alertsEnabled;
  readonly metrics = this.monitoringStore.metrics;
  readonly criticalErrors = this.monitoringStore.criticalErrors;

  // Local state using signals
  alertRules = signal<AlertRule[]>([
    {
      id: "1",
      name: "High CPU Usage",
      metric: "cpuUsage",
      operator: ">",
      threshold: 80,
      severity: "high",
      enabled: true,
      description: "Alert when CPU usage exceeds 80%",
    },
    {
      id: "2",
      name: "High Memory Usage",
      metric: "memoryUsage",
      operator: ">",
      threshold: 85,
      severity: "critical",
      enabled: true,
      description: "Alert when memory usage exceeds 85%",
    },
    {
      id: "3",
      name: "High Network Latency",
      metric: "networkLatency",
      operator: ">",
      threshold: 1000,
      severity: "medium",
      enabled: true,
      description: "Alert when network latency exceeds 1000ms",
    },
  ]);

  activeAlerts = signal<any[]>([]);
  showCreateAlert = signal(false);
  editingRule = signal<AlertRule | null>(null);
  currentRule = signal<Partial<AlertRule>>(this.getEmptyRule());

  // Computed signals
  hasActiveAlerts = computed(() => this.activeAlerts().length > 0);
  alertsCount = computed(() => this.activeAlerts().length);
  rulesCount = computed(() => this.alertRules().length);
  isEditing = computed(() => this.editingRule() !== null);

  ngOnInit(): void {
    // Subscribe to metrics changes to check alert conditions
    this.subscriptions.add(
      this.monitoringService.metrics$.subscribe(metrics => {
        if (this.alertsEnabled()) {
          this.checkAlertConditions(metrics);
        }
      })
    );

    // Load saved alert rules from localStorage
    this.loadAlertRules();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleAlerts(): void {
    this.monitoringStore.toggleAlerts();
  }

  checkAlertConditions(metrics: any): void {
    const enabledRules = this.alertRules().filter(rule => rule.enabled);

    enabledRules.forEach(rule => {
      const metricValue = metrics[rule.metric];
      let conditionMet = false;

      switch (rule.operator) {
        case ">":
          conditionMet = metricValue > rule.threshold;
          break;
        case ">=":
          conditionMet = metricValue >= rule.threshold;
          break;
        case "<":
          conditionMet = metricValue < rule.threshold;
          break;
        case "<=":
          conditionMet = metricValue <= rule.threshold;
          break;
        case "==":
          conditionMet = metricValue === rule.threshold;
          break;
      }

      if (conditionMet) {
        // Check if alert already exists
        const existingAlert = this.activeAlerts().find(
          alert => alert.ruleId === rule.id && !alert.acknowledged
        );

        if (!existingAlert) {
          this.triggerAlert(rule, metricValue);
        }
      }
    });
  }

  triggerAlert(rule: AlertRule, currentValue: number): void {
    const alert = {
      id: Date.now().toString(),
      ruleId: rule.id,
      name: rule.name,
      severity: rule.severity,
      description: `${rule.name}: ${rule.metric} is ${currentValue} (threshold: ${rule.threshold})`,
      timestamp: new Date(),
      acknowledged: false,
      currentValue,
    };

    const currentAlerts = this.activeAlerts();
    this.activeAlerts.set([...currentAlerts, alert]);

    // Also log to monitoring store
    this.monitoringStore.logError({
      message: alert.description,
      severity: rule.severity,
      component: "AlertSystem",
    });
  }

  acknowledgeAlert(alertId: string): void {
    const currentAlerts = this.activeAlerts();
    const updatedAlerts = currentAlerts.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    );
    this.activeAlerts.set(updatedAlerts);
  }

  toggleRule(ruleId: string): void {
    const currentRules = this.alertRules();
    const updatedRules = currentRules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );
    this.alertRules.set(updatedRules);
    this.saveAlertRules();
  }

  editRule(rule: AlertRule): void {
    this.editingRule.set(rule);
    this.currentRule.set({ ...rule });
    this.showCreateAlert.set(true);
  }

  deleteRule(ruleId: string): void {
    if (confirm("Are you sure you want to delete this alert rule?")) {
      const filteredRules = this.alertRules().filter(r => r.id !== ruleId);
      this.alertRules.set(filteredRules);
      this.saveAlertRules();
    }
  }

  saveRule(): void {
    const editingRule = this.editingRule();
    const currentRules = this.alertRules();

    if (editingRule) {
      // Update existing rule
      const index = currentRules.findIndex(r => r.id === editingRule.id);
      if (index !== -1) {
        const updatedRules = [...currentRules];
        updatedRules[index] = { ...(this.currentRule() as AlertRule) };
        this.alertRules.set(updatedRules);
      }
    } else {
      // Create new rule
      const newRule: AlertRule = {
        ...(this.currentRule() as AlertRule),
        id: Date.now().toString(),
      };
      this.alertRules.set([...currentRules, newRule]);
    }

    this.saveAlertRules();
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.showCreateAlert.set(false);
    this.editingRule.set(null);
    this.currentRule.set(this.getEmptyRule());
  }

  private getEmptyRule(): Partial<AlertRule> {
    return {
      name: "",
      metric: "cpuUsage",
      operator: ">",
      threshold: 0,
      severity: "medium",
      enabled: true,
      description: "",
    };
  }

  private loadAlertRules(): void {
    const saved = localStorage.getItem("monitoring-alert-rules");
    if (saved) {
      try {
        this.alertRules.set(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load alert rules:", e);
      }
    }
  }

  private saveAlertRules(): void {
    localStorage.setItem("monitoring-alert-rules", JSON.stringify(this.alertRules()));
  }

  // Getter methods for template
  getActiveAlerts(): any[] {
    return this.activeAlerts().filter(alert => !alert.acknowledged);
  }

  updateCurrentRule(field: keyof AlertRule, value: any): void {
    const current = this.currentRule();
    this.currentRule.set({ ...current, [field]: value });
  }
}
