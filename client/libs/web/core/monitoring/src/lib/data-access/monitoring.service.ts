import { Injectable, inject } from "@angular/core";
import { BehaviorSubject, Observable, Subject, interval, of } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";
import { ErrorLog, MonitoringPerformanceData, SystemMetrics } from "../models";
import { MonitoringStore } from "./monitoring.store";

/**
 * Service giám sát hệ thống
 * Cung cấp các phương thức để thu thập, quản lý và cung cấp dữ liệu giám sát
 */
@Injectable({
  providedIn: "root",
})
export class MonitoringService {
  private monitoringStore = inject(MonitoringStore);

  // Subjects để phát dữ liệu
  private metricsSubject = new BehaviorSubject<SystemMetrics>(this.getInitialMetrics());
  private errorsSubject = new Subject<ErrorLog[]>();
  private performanceSubject = new Subject<MonitoringPerformanceData[]>();
  private stopMonitoring$ = new Subject<void>();

  // Observables công khai
  readonly metrics$ = this.metricsSubject.asObservable();
  readonly errors$ = this.errorsSubject.asObservable();
  readonly performance$ = this.performanceSubject.asObservable();

  // Dữ liệu lưu trữ
  private errors: ErrorLog[] = [];
  private performance: MonitoringPerformanceData[] = [];
  private jsHeapHistory: number[] = [];

  constructor() {
    // Khởi tạo dữ liệu mẫu
    this.initializePerformanceData();
  }

  /**
   * Bắt đầu giám sát hệ thống
   * @param refreshInterval Thời gian làm mới (ms)
   */
  startMonitoring(refreshInterval = 5000): void {
    // Dừng bất kỳ giám sát nào đang chạy
    this.stopMonitoring();

    // Cập nhật khoảng thời gian làm mới trong store
    this.monitoringStore.setRefreshInterval(refreshInterval);

    // Bắt đầu thu thập metrics theo khoảng thời gian
    interval(refreshInterval)
      .pipe(
        takeUntil(this.stopMonitoring$),
        switchMap(() => this.collectMetrics())
      )
      .subscribe(metrics => {
        this.metricsSubject.next(metrics);
        this.collectPerformanceData();
      });
  }

  /**
   * Dừng giám sát hệ thống
   */
  stopMonitoring(): void {
    this.stopMonitoring$.next();
  }

  /**
   * Ghi log lỗi
   * @param error Thông tin lỗi
   */
  logError(error: Partial<ErrorLog>): void {
    const newError: ErrorLog = {
      id: Date.now().toString(),
      message: error.message || "Unknown error",
      severity: error.severity || "medium",
      timestamp: new Date(),
      component: error.component,
      type: error.type,
      source: error.source,
      stackTrace: error.stackTrace,
      userId: error.userId,
    };

    // Log error to console (Sentry integration removed)
    console.error("Monitoring Error:", {
      id: newError.id,
      message: newError.message,
      severity: newError.severity,
      component: newError.component,
      type: newError.type,
      source: newError.source,
      timestamp: newError.timestamp,
      userId: newError.userId,
      stackTrace: newError.stackTrace,
    });

    this.errors.unshift(newError);
    // Giới hạn số lượng lỗi lưu trữ
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(0, 100);
    }

    this.errorsSubject.next([newError]);

    // Cập nhật store
    this.monitoringStore.addError(newError);
  }

  /**
   * Ghi nhận metrics hiệu suất
   * @param metric Thông tin metrics
   */
  recordPerformance(metric: Partial<MonitoringPerformanceData>): void {
    const newMetric: MonitoringPerformanceData = {
      id: Date.now().toString(),
      name: metric.name || "Unknown metric",
      value: metric.value || 0,
      unit: metric.unit || "",
      timestamp: new Date(),
      type: metric.type || "custom",
      threshold: metric.threshold,
      component: metric.component,
      metadata: metric.metadata,
    };

    // Log performance metric to console
    console.log("Performance Metric:", {
      name: newMetric.name,
      value: newMetric.value,
      unit: newMetric.unit,
      component: newMetric.component,
      threshold: newMetric.threshold,
      timestamp: newMetric.timestamp,
      isOverThreshold: newMetric.threshold
        ? newMetric.value > newMetric.threshold
        : false,
    });

    // Nếu vượt ngưỡng, ghi cảnh báo
    if (newMetric.threshold && newMetric.value > newMetric.threshold) {
      const exceedancePercentage = (
        ((newMetric.value - newMetric.threshold) / newMetric.threshold) *
        100
      ).toFixed(2);
      console.warn(
        `Performance threshold exceeded: ${newMetric.name} (${newMetric.value}${newMetric.unit} > ${newMetric.threshold}${newMetric.unit}) - ${exceedancePercentage}% over threshold`
      );
    }

    this.performance.unshift(newMetric);
    // Giới hạn số lượng metrics lưu trữ
    if (this.performance.length > 100) {
      this.performance = this.performance.slice(0, 100);
    }

    this.performanceSubject.next([newMetric]);

    // Cập nhật store
    this.monitoringStore.recordPerformance(
      newMetric.name,
      newMetric.value,
      newMetric.unit,
      newMetric.threshold
    );
  }

  /**
   * Xóa tất cả lỗi đã ghi nhận
   */
  clearErrors(): void {
    this.errors = [];
    this.errorsSubject.next([]);
  }

  /**
   * Thu thập metrics hệ thống
   * @returns Observable<SystemMetrics>
   */
  private collectMetrics(): Observable<SystemMetrics> {
    // Trong môi trường thực tế, đây sẽ là API call hoặc WebSocket
    // Ở đây chúng ta mô phỏng dữ liệu

    // Tạo biến động ngẫu nhiên
    const randomVariation = (base: number, variance: number) => {
      return Math.max(0, Math.min(100, base + (Math.random() * variance * 2 - variance)));
    };

    // Lấy metrics cuối cùng
    const lastMetrics = this.metricsSubject.getValue();

    // Tạo metrics mới với biến động ngẫu nhiên
    const newMetrics: SystemMetrics = {
      cpuUsage: randomVariation(lastMetrics.cpuUsage, 5),
      memoryUsage: randomVariation(lastMetrics.memoryUsage, 3),
      networkLatency: Math.max(10, randomVariation(lastMetrics.networkLatency, 20)),
      responseTime: Math.max(20, randomVariation(lastMetrics.responseTime, 30)),
      activeUsers: Math.round(randomVariation(lastMetrics.activeUsers, 2)),
      errorCount: this.errors.length,
      timestamp: new Date(),
    };

    // Đôi khi tạo lỗi ngẫu nhiên để demo
    if (Math.random() < 0.1) {
      // 10% chance
      this.generateRandomError();
    }

    return of(newMetrics);
  }

  /**
   * Thu thập dữ liệu hiệu suất
   */
  private collectPerformanceData(): void {
    // Mô phỏng thu thập JS Heap size
    const lastHeapSize =
      this.jsHeapHistory.length > 0
        ? this.jsHeapHistory[this.jsHeapHistory.length - 1]
        : 20;

    const newHeapSize = Math.max(
      10,
      Math.min(100, lastHeapSize + (Math.random() * 10 - 5))
    );
    this.jsHeapHistory.push(newHeapSize);

    if (this.jsHeapHistory.length > 20) {
      this.jsHeapHistory.shift();
    }

    // Ghi nhận metrics hiệu suất
    this.recordPerformance({
      name: "JS Heap Size",
      value: newHeapSize,
      unit: "MB",
      threshold: 80,
      component: "Browser",
    });

    // Mô phỏng thời gian tải trang
    if (Math.random() < 0.3) {
      // 30% chance
      const pageLoadTime = 200 + Math.random() * 800;
      this.recordPerformance({
        name: "Page Load Time",
        value: pageLoadTime,
        unit: "ms",
        threshold: 500,
        component: "Router",
      });
    }
  }

  /**
   * Tạo lỗi ngẫu nhiên để demo
   */
  private generateRandomError(): void {
    const errorTypes = [
      {
        message: "Failed to fetch data from API",
        severity: "medium",
        component: "DataService",
      },
      {
        message: "Authentication token expired",
        severity: "high",
        component: "AuthService",
      },
      {
        message: "Database connection timeout",
        severity: "critical",
        component: "DatabaseService",
      },
      { message: "Invalid user input", severity: "low", component: "FormComponent" },
      { message: "Resource not found", severity: "medium", component: "HttpClient" },
      { message: "Memory leak detected", severity: "high", component: "MemoryService" },
      { message: "Unhandled exception", severity: "medium", component: "ErrorHandler" },
      {
        message: "Network connection lost",
        severity: "high",
        component: "NetworkService",
      },
    ] as const;

    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];

    this.logError({
      message: randomError.message,
      severity: randomError.severity as "low" | "medium" | "high" | "critical",
      component: randomError.component,
      stackTrace: `Error: ${randomError.message}\n    at ${randomError.component}.processRequest (${randomError.component}.ts:42:23)\n    at Observable.subscribe (observable.ts:93:31)`,
    });
  }

  /**
   * Khởi tạo dữ liệu hiệu suất mẫu
   */
  private initializePerformanceData(): void {
    const initialPerformance: Partial<MonitoringPerformanceData>[] = [
      {
        name: "API Response Time",
        value: 120,
        unit: "ms",
        threshold: 300,
        component: "ApiService",
        type: "custom",
      },
      {
        name: "Component Render Time",
        value: 45,
        unit: "ms",
        threshold: 100,
        component: "DashboardComponent",
        type: "custom",
      },
      {
        name: "Database Query Time",
        value: 85,
        unit: "ms",
        threshold: 200,
        component: "DatabaseService",
        type: "custom",
      },
      {
        name: "Authentication Time",
        value: 230,
        unit: "ms",
        threshold: 500,
        component: "AuthService",
        type: "custom",
      },
    ];

    initialPerformance.forEach(metric => this.recordPerformance(metric));
  }

  /**
   * Tạo metrics ban đầu
   */
  private getInitialMetrics(): SystemMetrics {
    return {
      cpuUsage: 35 + Math.random() * 15,
      memoryUsage: 40 + Math.random() * 10,
      networkLatency: 80 + Math.random() * 40,
      responseTime: 150 + Math.random() * 50,
      activeUsers: Math.floor(5 + Math.random() * 10),
      errorCount: 0,
      timestamp: new Date(),
    };
  }
}
