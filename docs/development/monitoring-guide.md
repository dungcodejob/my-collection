# Monitoring & Observability Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Application Monitoring](#application-monitoring)
3. [Infrastructure Monitoring](#infrastructure-monitoring)
4. [Log Management](#log-management)
5. [Performance Monitoring](#performance-monitoring)
6. [Error Tracking](#error-tracking)
7. [Health Checks](#health-checks)
8. [Alerting](#alerting)
9. [Dashboards](#dashboards)
10. [Troubleshooting](#troubleshooting)

## 📊 Overview

Monitoring and observability are essential components for maintaining reliability, performance, and security of the My Collection application. This document provides a comprehensive guide to implement an effective monitoring strategy.

### Monitoring Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Dashboards                           │
│              (Grafana, Custom UI)                       │
├─────────────────────────────────────────────────────────┤
│                   Alerting                              │
│            (AlertManager, PagerDuty)                    │
├─────────────────────────────────────────────────────────┤
│                 Metrics Storage                         │
│              (Prometheus, InfluxDB)                     │
├─────────────────────────────────────────────────────────┤
│                 Log Aggregation                         │
│            (ELK Stack, Fluentd)                         │
├─────────────────────────────────────────────────────────┤
│                Application Layer                        │
│         (NestJS, Angular, Database)                     │
└─────────────────────────────────────────────────────────┘
```

### Key Metrics Categories

1. **Golden Signals**
   - Latency (response times)
   - Traffic (request rates)
   - Errors (error rates)
   - Saturation (resource utilization)

2. **Business Metrics**
   - User registrations
   - Bookmark creation rates
   - Collection usage
   - Search performance

3. **Technical Metrics**
   - Database performance
   - Memory usage
   - CPU utilization
   - Network I/O

## 🔧 Application Monitoring

### 1. NestJS Monitoring Setup

```typescript
// monitoring/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
  });

  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
    registers: [register]
  });

  private readonly activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    registers: [register]
  });

  private readonly databaseQueries = new Counter({
    name: 'database_queries_total',
    help: 'Total number of database queries',
    labelNames: ['operation', 'table'],
    registers: [register]
  });

  private readonly databaseQueryDuration = new Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
    registers: [register]
  });

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  recordDatabaseQuery(operation: string, table: string, duration: number): void {
    this.databaseQueries.inc({ operation, table });
    this.databaseQueryDuration.observe({ operation, table }, duration);
  }

  setActiveConnections(count: number): void {
    this.activeConnections.set(count);
  }

  getMetrics(): string {
    return register.metrics();
  }
}

// monitoring/metrics.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - startTime) / 1000;
        const method = request.method;
        const route = request.route?.path || request.url;
        const statusCode = response.statusCode;

        this.metricsService.recordHttpRequest(method, route, statusCode, duration);
      })
    );
  }
}
```

### 2. Database Monitoring

```typescript
// monitoring/database.interceptor.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MetricsService } from './metrics.service';

@Injectable()
export class DatabaseMonitoringService {
  constructor(
    private dataSource: DataSource,
    private metricsService: MetricsService
  ) {
    this.setupQueryLogging();
  }

  private setupQueryLogging(): void {
    const originalQuery = this.dataSource.query.bind(this.dataSource);
    
    this.dataSource.query = async (query: string, parameters?: any[]) => {
      const startTime = Date.now();
      const operation = this.extractOperation(query);
      const table = this.extractTable(query);

      try {
        const result = await originalQuery(query, parameters);
        const duration = (Date.now() - startTime) / 1000;
        
        this.metricsService.recordDatabaseQuery(operation, table, duration);
        
        return result;
      } catch (error) {
        const duration = (Date.now() - startTime) / 1000;
        this.metricsService.recordDatabaseQuery(`${operation}_error`, table, duration);
        throw error;
      }
    };
  }

  private extractOperation(query: string): string {
    const operation = query.trim().split(' ')[0].toUpperCase();
    return ['SELECT', 'INSERT', 'UPDATE', 'DELETE'].includes(operation) ? operation : 'OTHER';
  }

  private extractTable(query: string): string {
    const match = query.match(/(?:FROM|INTO|UPDATE|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
    return match ? match[1] : 'unknown';
  }
}
```

### 3. Business Metrics Tracking

```typescript
// monitoring/business-metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Gauge } from 'prom-client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from '../users/user.service';
import { BookmarkService } from '../bookmarks/bookmark.service';

@Injectable()
export class BusinessMetricsService {
  private readonly userRegistrations = new Counter({
    name: 'user_registrations_total',
    help: 'Total number of user registrations'
  });

  private readonly bookmarkCreations = new Counter({
    name: 'bookmark_creations_total',
    help: 'Total number of bookmarks created'
  });

  private readonly activeUsers = new Gauge({
    name: 'active_users',
    help: 'Number of active users',
    labelNames: ['period']
  });

  private readonly searchQueries = new Counter({
    name: 'search_queries_total',
    help: 'Total number of search queries',
    labelNames: ['type']
  });

  constructor(
    private userService: UserService,
    private bookmarkService: BookmarkService
  ) {}

  recordUserRegistration(): void {
    this.userRegistrations.inc();
  }

  recordBookmarkCreation(): void {
    this.bookmarkCreations.inc();
  }

  recordSearchQuery(type: 'text' | 'tag' | 'advanced'): void {
    this.searchQueries.inc({ type });
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateActiveUsers(): Promise<void> {
    const now = new Date();
    
    // Users active in last 5 minutes
    const last5Min = new Date(now.getTime() - 5 * 60 * 1000);
    const active5Min = await this.userService.countActiveUsers(last5Min);
    this.activeUsers.set({ period: '5m' }, active5Min);

    // Users active in last hour
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const activeHour = await this.userService.countActiveUsers(lastHour);
    this.activeUsers.set({ period: '1h' }, activeHour);

    // Users active in last day
    const lastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const activeDay = await this.userService.countActiveUsers(lastDay);
    this.activeUsers.set({ period: '24h' }, activeDay);
  }
}
```

## 🖥️ Infrastructure Monitoring

### 1. System Metrics Collection

```typescript
// monitoring/system-metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Gauge } from 'prom-client';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as os from 'os';
import * as process from 'process';

@Injectable()
export class SystemMetricsService {
  private readonly cpuUsage = new Gauge({
    name: 'cpu_usage_percent',
    help: 'CPU usage percentage'
  });

  private readonly memoryUsage = new Gauge({
    name: 'memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type']
  });

  private readonly diskUsage = new Gauge({
    name: 'disk_usage_bytes',
    help: 'Disk usage in bytes',
    labelNames: ['type']
  });

  private readonly networkConnections = new Gauge({
    name: 'network_connections',
    help: 'Number of network connections'
  });

  @Cron(CronExpression.EVERY_30_SECONDS)
  async collectSystemMetrics(): Promise<void> {
    // CPU Usage
    const cpuUsagePercent = await this.getCpuUsage();
    this.cpuUsage.set(cpuUsagePercent);

    // Memory Usage
    const memUsage = process.memoryUsage();
    this.memoryUsage.set({ type: 'rss' }, memUsage.rss);
    this.memoryUsage.set({ type: 'heap_used' }, memUsage.heapUsed);
    this.memoryUsage.set({ type: 'heap_total' }, memUsage.heapTotal);
    this.memoryUsage.set({ type: 'external' }, memUsage.external);

    // System Memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    this.memoryUsage.set({ type: 'system_total' }, totalMem);
    this.memoryUsage.set({ type: 'system_free' }, freeMem);
    this.memoryUsage.set({ type: 'system_used' }, totalMem - freeMem);
  }

  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = process.hrtime();

      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = process.hrtime(startTime);

        const totalTime = endTime[0] * 1000000 + endTime[1] / 1000; // microseconds
        const cpuTime = endUsage.user + endUsage.system; // microseconds

        const cpuPercent = (cpuTime / totalTime) * 100;
        resolve(cpuPercent);
      }, 100);
    });
  }
}
```

### 2. Docker Container Monitoring

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro

volumes:
  prometheus_data:
  grafana_data:
```

## 📝 Log Management

### 1. Structured Logging

```typescript
// logging/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            context,
            trace,
            ...meta,
            service: 'my-collection-api',
            version: process.env.APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'development'
          });
        })
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error'
        }),
        new winston.transports.File({
          filename: 'logs/combined.log'
        })
      ]
    });

    // Add Elasticsearch transport in production
    if (process.env.NODE_ENV === 'production') {
      this.logger.add(new ElasticsearchTransport({
        level: 'info',
        clientOpts: {
          node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
        },
        index: 'my-collection-logs'
      }));
    }
  }

  log(message: string, context?: string, meta?: any): void {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: any): void {
    this.logger.error(message, { context, trace, ...meta });
  }

  warn(message: string, context?: string, meta?: any): void {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: any): void {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any): void {
    this.logger.verbose(message, { context, ...meta });
  }

  // Business event logging
  logBusinessEvent(event: string, userId?: string, data?: any): void {
    this.logger.info('Business Event', {
      context: 'BusinessEvent',
      event,
      userId,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Security event logging
  logSecurityEvent(event: string, ip: string, userId?: string, data?: any): void {
    this.logger.warn('Security Event', {
      context: 'SecurityEvent',
      event,
      ip,
      userId,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Performance logging
  logPerformance(operation: string, duration: number, metadata?: any): void {
    this.logger.info('Performance Metric', {
      context: 'Performance',
      operation,
      duration,
      metadata,
      timestamp: new Date().toISOString()
    });
  }
}
```

### 2. Request Logging Middleware

```typescript
// logging/request-logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from './logger.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private logger: CustomLoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = uuidv4();
    const startTime = Date.now();

    // Add request ID to request object
    req['requestId'] = requestId;

    // Log incoming request
    this.logger.log('Incoming Request', 'RequestLogger', {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req['user']?.id
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk: any, encoding?: any) {
      const duration = Date.now() - startTime;
      
      // Log response
      this.logger.log('Request Completed', 'RequestLogger', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        contentLength: res.get('Content-Length')
      });

      // Log slow requests
      if (duration > 1000) {
        this.logger.warn('Slow Request', 'RequestLogger', {
          requestId,
          method: req.method,
          url: req.url,
          duration
        });
      }

      originalEnd.call(this, chunk, encoding);
    }.bind(this);

    next();
  }
}
```

## ⚡ Performance Monitoring

### 1. Application Performance Monitoring

```typescript
// monitoring/apm.service.ts
import { Injectable } from '@nestjs/common';
import { Histogram, Counter } from 'prom-client';
import { CustomLoggerService } from '../logging/logger.service';

@Injectable()
export class APMService {
  private readonly responseTime = new Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in milliseconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [1, 5, 15, 50, 100, 500, 1000, 5000]
  });

  private readonly throughput = new Counter({
    name: 'http_requests_per_second',
    help: 'Number of HTTP requests per second',
    labelNames: ['method', 'route']
  });

  private readonly errorRate = new Counter({
    name: 'http_errors_total',
    help: 'Total number of HTTP errors',
    labelNames: ['method', 'route', 'error_type']
  });

  constructor(private logger: CustomLoggerService) {}

  recordRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
    error?: Error
  ): void {
    // Record response time
    this.responseTime
      .labels(method, route, statusCode.toString())
      .observe(duration);

    // Record throughput
    this.throughput.labels(method, route).inc();

    // Record errors
    if (statusCode >= 400) {
      const errorType = error ? error.constructor.name : 'HttpError';
      this.errorRate.labels(method, route, errorType).inc();
    }

    // Log performance issues
    if (duration > 1000) {
      this.logger.logPerformance('slow_request', duration, {
        method,
        route,
        statusCode
      });
    }
  }

  // Database performance monitoring
  recordDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    rowCount?: number
  ): void {
    this.logger.logPerformance('database_operation', duration, {
      operation,
      table,
      rowCount
    });

    // Alert on slow queries
    if (duration > 500) {
      this.logger.warn('Slow Database Query', 'APM', {
        operation,
        table,
        duration,
        rowCount
      });
    }
  }

  // Memory usage monitoring
  recordMemoryUsage(): void {
    const memUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    this.logger.logPerformance('memory_usage', 0, memoryUsageMB);

    // Alert on high memory usage
    if (memoryUsageMB.heapUsed > 512) { // 512MB threshold
      this.logger.warn('High Memory Usage', 'APM', memoryUsageMB);
    }
  }
}
```

### 2. Frontend Performance Monitoring

```typescript
// frontend/monitoring/performance.service.ts
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private observer?: PerformanceObserver;

  constructor(private router: Router) {
    this.initializePerformanceObserver();
    this.monitorRouteChanges();
  }

  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(entry.name, entry.duration, {
            entryType: entry.entryType,
            startTime: entry.startTime
          });
        }
      });

      this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    }
  }

  private monitorRouteChanges(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Measure route change performance
        performance.mark('route-change-start');
        
        setTimeout(() => {
          performance.mark('route-change-end');
          performance.measure('route-change', 'route-change-start', 'route-change-end');
          
          this.recordMetric('route_change', performance.getEntriesByName('route-change')[0].duration, {
            route: event.url
          });
        }, 0);
      });
  }

  recordMetric(name: string, value: number, metadata?: any): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);
    this.sendMetricToBackend(metric);

    // Keep only last 100 metrics in memory
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // Core Web Vitals monitoring
  measureCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('fid', entry.processingStart - entry.startTime);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.recordMetric('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  // API call performance
  measureApiCall(url: string, method: string, startTime: number, endTime: number, status: number): void {
    const duration = endTime - startTime;
    this.recordMetric('api_call', duration, {
      url,
      method,
      status
    });

    // Alert on slow API calls
    if (duration > 2000) {
      console.warn('Slow API call detected:', { url, method, duration });
    }
  }

  private sendMetricToBackend(metric: PerformanceMetric): void {
    // Send metrics to backend for aggregation
    fetch('/api/metrics/frontend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metric)
    }).catch(error => {
      console.error('Failed to send metric to backend:', error);
    });
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}
```

## 🚨 Error Tracking

### 1. Global Error Handler

```typescript
// error-tracking/global-error.handler.ts
import { Injectable, Inject } from '@nestjs/common';
import { CustomLoggerService } from '../logging/logger.service';
import * as Sentry from '@sentry/node';

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  body?: any;
  query?: any;
  params?: any;
}

@Injectable()
export class GlobalErrorHandler {
  constructor(private logger: CustomLoggerService) {
    this.initializeSentry();
  }

  private initializeSentry(): void {
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        release: process.env.APP_VERSION,
        tracesSampleRate: 1.0,
        beforeSend(event) {
          // Filter out sensitive information
          if (event.request?.data) {
            delete event.request.data.password;
            delete event.request.data.token;
          }
          return event;
        }
      });
    }
  }

  handleError(error: Error, context?: ErrorContext): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      timestamp: new Date().toISOString()
    };

    // Log error
    this.logger.error('Application Error', error.stack, 'GlobalErrorHandler', errorInfo);

    // Send to Sentry
    if (process.env.SENTRY_DSN) {
      Sentry.withScope((scope) => {
        if (context?.userId) {
          scope.setUser({ id: context.userId });
        }
        
        scope.setContext('request', {
          url: context?.url,
          method: context?.method,
          ip: context?.ip,
          userAgent: context?.userAgent
        });

        scope.setLevel('error');
        Sentry.captureException(error);
      });
    }

    // Custom error notifications
    this.sendErrorNotification(error, context);
  }

  handleBusinessError(error: string, severity: 'low' | 'medium' | 'high', context?: ErrorContext): void {
    const errorInfo = {
      type: 'business_error',
      message: error,
      severity,
      context,
      timestamp: new Date().toISOString()
    };

    this.logger.warn('Business Error', 'GlobalErrorHandler', errorInfo);

    if (severity === 'high') {
      this.sendErrorNotification(new Error(error), context);
    }
  }

  private sendErrorNotification(error: Error, context?: ErrorContext): void {
    // Send notifications to Slack, email, etc.
    // Implementation depends on your notification system
    console.error('Error notification:', {
      error: error.message,
      context
    });
  }
}

// error-tracking/error.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { GlobalErrorHandler } from './global-error.handler';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private errorHandler: GlobalErrorHandler) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    // Handle error
    if (status >= 500) {
      this.errorHandler.handleError(exception as Error, {
        userId: request['user']?.id,
        requestId: request['requestId'],
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        url: request.url,
        method: request.method,
        body: request.body,
        query: request.query,
        params: request.params
      });
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      requestId: request['requestId']
    });
  }
}
```

## 🏥 Health Checks

### 1. Comprehensive Health Check System

```typescript
// health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis-health.indicator';
import { ExternalServiceHealthIndicator } from './external-service-health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private redis: RedisHealthIndicator,
    private externalService: ExternalServiceHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),   // 300MB
      () => this.redis.isHealthy('redis'),
      () => this.externalService.checkExternalServices()
    ]);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.isHealthy('redis')
    ]);
  }

  @Get('live')
  @HealthCheck()
  liveness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 400 * 1024 * 1024)
    ]);
  }
}

// health/redis-health.indicator.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private redisService: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.redisService.ping();
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError('Redis check failed', this.getStatus(key, false));
    }
  }
}

// health/external-service-health.indicator.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class ExternalServiceHealthIndicator extends HealthIndicator {
  constructor(private httpService: HttpService) {
    super();
  }

  async checkExternalServices(): Promise<HealthIndicatorResult> {
    const services = [
      { name: 'auth_service', url: process.env.AUTH_SERVICE_URL },
      { name: 'email_service', url: process.env.EMAIL_SERVICE_URL }
    ];

    const results = await Promise.allSettled(
      services.map(service => this.checkService(service.name, service.url))
    );

    const healthyServices = results.filter(result => result.status === 'fulfilled').length;
    const isHealthy = healthyServices === services.length;

    return this.getStatus('external_services', isHealthy, {
      total: services.length,
      healthy: healthyServices,
      details: results.map((result, index) => ({
        service: services[index].name,
        status: result.status,
        ...(result.status === 'rejected' && { error: result.reason.message })
      }))
    });
  }

  private async checkService(name: string, url: string): Promise<void> {
    if (!url) return;

    await firstValueFrom(
      this.httpService.get(`${url}/health`).pipe(
        timeout(5000) // 5 second timeout
      )
    );
  }
}
```

## 🔔 Alerting

### 1. Alert Manager Configuration

```yaml
# monitoring/alertmanager.yml
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@my-collection.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'
  - match:
      severity: warning
    receiver: 'warning-alerts'

receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://localhost:3000/api/alerts/webhook'

- name: 'critical-alerts'
  email_configs:
  - to: 'team@my-collection.com'
    subject: 'CRITICAL: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      {{ end }}
  slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK_URL'
    channel: '#alerts'
    title: 'Critical Alert'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

- name: 'warning-alerts'
  email_configs:
  - to: 'team@my-collection.com'
    subject: 'WARNING: {{ .GroupLabels.alertname }}'
```

### 2. Prometheus Alert Rules

```yaml
# monitoring/alert-rules.yml
groups:
- name: my-collection-alerts
  rules:
  # High error rate
  - alert: HighErrorRate
    expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} errors per second"

  # High response time
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is {{ $value }} seconds"

  # Database connection issues
  - alert: DatabaseConnectionFailed
    expr: up{job="database"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Database connection failed"
      description: "Database is not responding"

  # High memory usage
  - alert: HighMemoryUsage
    expr: (memory_usage_bytes{type="heap_used"} / memory_usage_bytes{type="heap_total"}) > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage"
      description: "Memory usage is {{ $value }}%"

  # Low disk space
  - alert: LowDiskSpace
    expr: (disk_usage_bytes{type="used"} / disk_usage_bytes{type="total"}) > 0.9
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Low disk space"
      description: "Disk usage is {{ $value }}%"
```

### 3. Custom Alert Service

```typescript
// alerting/alert.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CustomLoggerService } from '../logging/logger.service';
import { firstValueFrom } from 'rxjs';

export interface Alert {
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata?: any;
  timestamp: Date;
}

@Injectable()
export class AlertService {
  constructor(
    private httpService: HttpService,
    private logger: CustomLoggerService
  ) {}

  async sendAlert(alert: Alert): Promise<void> {
    this.logger.warn('Alert Triggered', 'AlertService', alert);

    // Send to different channels based on severity
    switch (alert.severity) {
      case 'critical':
        await this.sendSlackAlert(alert);
        await this.sendEmailAlert(alert);
        await this.sendPagerDutyAlert(alert);
        break;
      case 'high':
        await this.sendSlackAlert(alert);
        await this.sendEmailAlert(alert);
        break;
      case 'medium':
        await this.sendSlackAlert(alert);
        break;
      case 'low':
        // Log only
        break;
    }
  }

  private async sendSlackAlert(alert: Alert): Promise<void> {
    try {
      const slackWebhook = process.env.SLACK_WEBHOOK_URL;
      if (!slackWebhook) return;

      const payload = {
        text: `🚨 ${alert.severity.toUpperCase()} Alert: ${alert.name}`,
        attachments: [
          {
            color: this.getSeverityColor(alert.severity),
            fields: [
              {
                title: 'Message',
                value: alert.message,
                short: false
              },
              {
                title: 'Severity',
                value: alert.severity,
                short: true
              },
              {
                title: 'Timestamp',
                value: alert.timestamp.toISOString(),
                short: true
              }
            ]
          }
        ]
      };

      await firstValueFrom(this.httpService.post(slackWebhook, payload));
    } catch (error) {
      this.logger.error('Failed to send Slack alert', error.stack, 'AlertService');
    }
  }

  private async sendEmailAlert(alert: Alert): Promise<void> {
    try {
      // Implementation depends on your email service
      const emailPayload = {
        to: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
        subject: `${alert.severity.toUpperCase()} Alert: ${alert.name}`,
        html: `
          <h2>Alert: ${alert.name}</h2>
          <p><strong>Severity:</strong> ${alert.severity}</p>
          <p><strong>Message:</strong> ${alert.message}</p>
          <p><strong>Timestamp:</strong> ${alert.timestamp.toISOString()}</p>
          ${alert.metadata ? `<p><strong>Metadata:</strong> <pre>${JSON.stringify(alert.metadata, null, 2)}</pre></p>` : ''}
        `
      };

      // Send email using your email service
      // await this.emailService.send(emailPayload);
    } catch (error) {
      this.logger.error('Failed to send email alert', error.stack, 'AlertService');
    }
  }

  private async sendPagerDutyAlert(alert: Alert): Promise<void> {
    try {
      const pagerDutyKey = process.env.PAGERDUTY_INTEGRATION_KEY;
      if (!pagerDutyKey) return;

      const payload = {
        routing_key: pagerDutyKey,
        event_action: 'trigger',
        payload: {
          summary: `${alert.name}: ${alert.message}`,
          severity: alert.severity,
          source: 'my-collection-api',
          timestamp: alert.timestamp.toISOString(),
          custom_details: alert.metadata
        }
      };

      await firstValueFrom(
        this.httpService.post('https://events.pagerduty.com/v2/enqueue', payload)
      );
    } catch (error) {
      this.logger.error('Failed to send PagerDuty alert', error.stack, 'AlertService');
    }
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      low: '#36a64f',      // Green
      medium: '#ff9500',   // Orange
      high: '#ff0000',     // Red
      critical: '#8b0000'  // Dark Red
    };
    return colors[severity] || '#808080';
  }
}
```

## 📊 Dashboards

### 1. Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "My Collection - Application Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          },
          {
            "expr": "rate(http_requests_total{status_code=~\"4..\"}[5m])",
            "legendFormat": "4xx errors"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "singlestat",
        "targets": [
          {
            "expr": "active_users{period=\"5m\"}",
            "legendFormat": "Last 5 minutes"
          }
        ]
      }
    ]
  }
}
```

## 🔧 Troubleshooting

### Common Monitoring Issues

1. **High Memory Usage**
   ```bash
   # Check memory usage
   kubectl top pods
   
   # Check for memory leaks
   curl http://localhost:3000/metrics | grep memory_usage
   ```

2. **Slow Database Queries**
   ```sql
   -- PostgreSQL slow query analysis
   SELECT query, mean_time, calls, total_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

3. **High Error Rates**
   ```bash
   # Check error logs
   kubectl logs -f deployment/my-collection-api | grep ERROR
   
   # Check error metrics
   curl http://localhost:3000/metrics | grep http_errors_total
   ```

### Monitoring Best Practices

1. **Set Appropriate Thresholds**
   - Response time: < 2 seconds for 95th percentile
   - Error rate: < 1% for 5xx errors
   - Memory usage: < 80% of allocated memory
   - CPU usage: < 70% average

2. **Monitor Business Metrics**
   - User registration rates
   - Feature usage patterns
   - Revenue-impacting metrics

3. **Implement Gradual Alerting**
   - Warning alerts for early detection
   - Critical alerts for immediate action
   - Escalation procedures for unresolved issues

4. **Regular Review and Optimization**
   - Weekly monitoring review meetings
   - Monthly dashboard optimization
   - Quarterly alerting rule updates

---

*This document provides a comprehensive monitoring and observability strategy for My Collection. Effective monitoring is key to maintaining high availability and performance.*