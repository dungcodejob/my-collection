import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, tap } from "rxjs";
import { ErrorLog, MonitoringPerformanceData, SystemMetrics } from "../models";
import { MonitoringService } from "./monitoring.service";

export type MonitoringState = {
  metrics: SystemMetrics | null;
  errors: ErrorLog[];
  performance: MonitoringPerformanceData[];
  isMonitoring: boolean;
  alertsEnabled: boolean;
  refreshInterval: number;
}

export const initialMonitoringState: MonitoringState = {
  metrics: null,
  errors: [],
  performance: [],
  isMonitoring: false,
  alertsEnabled: true,
  refreshInterval: 5000,
};

export const MonitoringStore = signalStore(
  { providedIn: "root" },
  withState(initialMonitoringState),
  withComputed((store, monitoringService = inject(MonitoringService)) => ({
    healthStatus: computed(() => {
      const metrics = store.metrics();
      if (!metrics) {return "unknown";}

      if (metrics.cpuUsage > 90 || metrics.memoryUsage > 90 || metrics.errorCount > 10) {
        return "critical";
      }
      if (metrics.cpuUsage > 70 || metrics.memoryUsage > 70 || metrics.errorCount > 5) {
        return "warning";
      }
      return "healthy";
    }),

    criticalErrors: computed(() =>
      store.errors().filter(error => error.severity === "critical")
    ),

    recentErrors: computed(() => store.errors().slice(0, 10)),

    performanceIssues: computed(() =>
      store
        .performance()
        .filter(metric => metric.threshold && metric.value > metric.threshold)
    ),

    systemLoad: computed(() => {
      const metrics = store.metrics();
      if (!metrics) {return 0;}
      return (metrics.cpuUsage + metrics.memoryUsage) / 2;
    }),
  })),
  withMethods((store, monitoringService = inject(MonitoringService)) => ({
    startMonitoring: () => {
      patchState(store, { isMonitoring: true });
      monitoringService.startMonitoring();
    },

    stopMonitoring: () => {
      patchState(store, { isMonitoring: false });
      monitoringService.stopMonitoring();
    },

    updateMetrics: (metrics: SystemMetrics) => {
      patchState(store, { metrics });
    },

    addError: (error: ErrorLog) => {
      const currentErrors = store.errors();
      const updatedErrors = [error, ...currentErrors].slice(0, 100);
      patchState(store, { errors: updatedErrors });
    },

    clearErrors: () => {
      patchState(store, { errors: [] });
      monitoringService.clearErrors();
    },

    updatePerformance: (performance: MonitoringPerformanceData[]) => {
      patchState(store, { performance });
    },

    toggleAlerts: () => {
      patchState(store, { alertsEnabled: !store.alertsEnabled() });
    },

    setRefreshInterval: (interval: number) => {
      patchState(store, { refreshInterval: interval });
    },

    logError: rxMethod<{
      message: string;
      severity: "low" | "medium" | "high" | "critical";
      component?: string;
    }>(
      pipe(
        tap(({ message, severity, component }) => {
          monitoringService.logError({
            message,
            severity,
            component,
          });
        })
      )
    ),

    recordPerformance: (
      name: string,
      value: number,
      unit: string,
      threshold?: number
    ) => {
      const metric: MonitoringPerformanceData = {
        id: Date.now().toString(),
        name,
        value,
        unit,
        timestamp: new Date(),
        type: "custom",
        threshold,
      };

      patchState(store, {
        performance: [metric, ...store.performance()].slice(0, 50),
      });
    },
  }))
);
