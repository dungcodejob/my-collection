/**
 * Migration Example: From Legacy to Abstract Monitoring
 *
 * This file shows how to migrate from the legacy MonitoringService
 * to the new abstract monitoring architecture
 */

// ============================================================================
// BEFORE: Legacy Monitoring Usage
// ============================================================================

/*
// Legacy imports
import { MonitoringService } from '../data-access/monitoring.service';
import { ErrorLog, MonitoringPerformanceData } from '../data-access/models';
import * as Sentry from '@sentry/angular';

@Component({
  selector: 'app-legacy-example',
  template: '...'
})
export class LegacyExampleComponent {
  constructor(private monitoring: MonitoringService) {}

  // Legacy error logging
  handleError(error: Error) {
    this.monitoring.logError({
      message: error.message,
      severity: 'high',
      component: 'LegacyExampleComponent',
      stackTrace: error.stack
    });

    // Direct Sentry usage (tight coupling)
    Sentry.captureException(error);
  }

  // Legacy performance recording
  recordPerformance() {
    this.monitoring.recordPerformance({
      name: 'api-call',
      value: 250,
      unit: 'ms',
      threshold: 500
    });
  }

  // Direct Sentry calls (tight coupling)
  setUserContext(user: any) {
    Sentry.setUser({
      id: user.id,
      email: user.email
    });
  }
}
*/

// ============================================================================
// AFTER: Abstract Monitoring Usage
// ============================================================================

import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import {
  UnifiedMonitoringService,
  MonitoringErrorLevel,
  MonitoringPerformanceType,
  MonitoringUserContext,
} from "../data-access";

@Component({
  selector: "app-migrated-example",
  standalone: true,
  template: `
    <div class="migration-example">
      <h3>Migrated Component Example</h3>

      <div class="actions">
        <button (click)="handleError()">Test Error</button>
        <button (click)="recordPerformance()">Record Performance</button>
        <button (click)="setUserContext()">Set User Context</button>
        <button (click)="trackUserAction()">Track Action</button>
        <button (click)="testTransaction()">Test Transaction</button>
      </div>

      <div class="status">
        <h4>Monitoring Status</h4>
        <pre>{{ monitoringStatusString }}</pre>
      </div>
    </div>
  `,
  styles: [
    `
      .migration-example {
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin: 20px 0;
      }

      .actions {
        display: flex;
        gap: 10px;
        margin: 20px 0;
        flex-wrap: wrap;
      }

      button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background: #007bff;
        color: white;
        cursor: pointer;
      }

      button:hover {
        background: #0056b3;
      }

      .status {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 4px;
        margin-top: 20px;
      }

      pre {
        font-size: 12px;
        max-height: 200px;
        overflow-y: auto;
      }
    `,
  ],
})
export class MigratedExampleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // New: Inject abstract monitoring service
  private monitoring = inject(UnifiedMonitoringService);

  monitoringStatus: any = {};

  get monitoringStatusString(): string {
    return JSON.stringify(this.monitoringStatus, null, 2);
  }

  ngOnInit(): void {
    this.updateStatus();
    this.subscribeToMonitoringUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========================================================================
  // MIGRATION EXAMPLES
  // ========================================================================

  /**
   * BEFORE: Legacy error handling
   * this.monitoring.logError({ message: error.message, severity: 'high' });
   *
   * AFTER: Abstract error handling with better typing and context
   */
  handleError(): void {
    try {
      throw new Error("Example error for migration demo");
    } catch (error) {
      // New approach: Better error levels and automatic context
      this.monitoring.logErrorWithContext(
        (error as Error).message,
        "error", // Better typed error levels
        "MigratedExampleComponent",
        {
          migrationExample: true,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        }
      );

      // Or capture the full exception with context
      this.monitoring.captureException(error as Error, {
        component: "MigratedExampleComponent",
        level: "error",
        extra: {
          migrationDemo: true,
          action: "handleError",
        },
      });
    }
  }

  /**
   * BEFORE: Legacy performance recording
   * this.monitoring.recordPerformance({ name: 'api-call', value: 250, unit: 'ms' });
   *
   * AFTER: Better typed performance metrics with categories
   */
  recordPerformance(): void {
    // Simulate API call timing
    const start = performance.now();

    setTimeout(() => {
      const duration = performance.now() - start;

      // New approach: Better typed with performance categories
      this.monitoring.recordPerformance({
        name: "simulated-api-call",
        value: duration,
        unit: "ms",
        type: "api",
        timestamp: new Date(),
        threshold: 500,
      });
    }, Math.random() * 300 + 100);
  }

  /**
   * BEFORE: Direct Sentry calls (tight coupling)
   * Sentry.setUser({ id: user.id, email: user.email });
   *
   * AFTER: Provider-agnostic user context
   */
  setUserContext(): void {
    const user: MonitoringUserContext = {
      id: "migration-user-" + Date.now(),
      email: "migration@example.com",
      username: "migration-demo",
      segment: "demo-users",
    };

    // New approach: Works with any provider
    this.monitoring.setUserWithContext(user);
  }

  /**
   * NEW: Enhanced user action tracking (not available in legacy)
   */
  trackUserAction(): void {
    this.monitoring.trackUserAction("Migration demo button clicked", "user-interaction", {
      component: "MigratedExampleComponent",
      timestamp: Date.now(),
    });
  }

  /**
   * NEW: Transaction tracking (not available in legacy)
   */
  testTransaction(): void {
    const transaction = this.monitoring.startTransaction("migration-demo-transaction", {
      description: "Demo transaction for migration example",
      tags: { demo: "true", migration: "true" },
    });

    if (transaction) {
      // Simulate some work
      setTimeout(() => {
        transaction.setStatus("ok");
        transaction.finish();
      }, 1000);
    }
  }

  /**
   * NEW: Reactive monitoring status (not available in legacy)
   */
  private subscribeToMonitoringUpdates(): void {
    // Subscribe to monitoring status changes
    this.monitoring.status$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateStatus();
    });

    // Subscribe to errors
    this.monitoring.errors$.pipe(takeUntil(this.destroy$)).subscribe(errors => {
      console.log("New errors:", errors);
    });

    // Subscribe to performance metrics
    this.monitoring.performance$.pipe(takeUntil(this.destroy$)).subscribe(metrics => {
      console.log("New performance metrics:", metrics);
    });
  }

  private updateStatus(): void {
    this.monitoringStatus = this.monitoring.getHealthStatus();
  }
}

// ============================================================================
// MIGRATION CHECKLIST
// ============================================================================

/*
✅ MIGRATION CHECKLIST:

1. IMPORTS
   ❌ Before: import { MonitoringService } from './monitoring.service';
   ❌ Before: import * as Sentry from '@sentry/angular';
   ✅ After:  import { UnifiedMonitoringService } from './unified-monitoring.service';

2. DEPENDENCY INJECTION
   ❌ Before: constructor(private monitoring: MonitoringService)
   ✅ After:  private monitoring = inject(UnifiedMonitoringService);

3. ERROR LOGGING
   ❌ Before: this.monitoring.logError({ message, severity: 'high' })
   ✅ After:  this.monitoring.logErrorWithContext(message, 'error', component)

4. PERFORMANCE RECORDING
   ❌ Before: this.monitoring.recordPerformance({ name, value, unit })
   ✅ After:  this.monitoring.recordPerformance(performanceData)

5. USER CONTEXT
   ❌ Before: Sentry.setUser(user)
   ✅ After:  this.monitoring.setUserWithContext(user)

6. DIRECT SENTRY CALLS
   ❌ Before: Sentry.captureException(error)
   ✅ After:  this.monitoring.captureException(error, context)

7. CONFIGURATION
   ❌ Before: Sentry.init() in main.ts
   ✅ After:  provideAbstractMonitoring() in app.config.ts

8. NEW FEATURES AVAILABLE
   ✅ Reactive monitoring (errors$, performance$, status$)
   ✅ Multiple providers support
   ✅ Better error categorization
   ✅ Transaction tracking
   ✅ User action tracking
   ✅ Health status monitoring
   ✅ Debug data export
   ✅ Provider management
*/

// ============================================================================
// STEP-BY-STEP MIGRATION GUIDE
// ============================================================================

/*
STEP 1: Install and setup abstract monitoring
- Add new monitoring files to your project
- Update app.config.ts with abstract monitoring providers
- Keep legacy monitoring service for now

STEP 2: Migrate components one by one
- Replace MonitoringService with UnifiedMonitoringService
- Update error logging calls
- Update performance recording calls
- Remove direct Sentry imports

STEP 3: Update error handling
- Replace custom error handlers to use abstract monitoring
- Update global error handlers

STEP 4: Test thoroughly
- Verify all monitoring functionality works
- Test with different providers (console, sentry)
- Check error reporting and performance metrics

STEP 5: Remove legacy code
- Remove old MonitoringService
- Remove direct Sentry dependencies from components
- Clean up unused imports

STEP 6: Optimize configuration
- Fine-tune provider selection per environment
- Optimize sample rates and thresholds
- Configure advanced features
*/

// ============================================================================
// BENEFITS AFTER MIGRATION
// ============================================================================

/*
BENEFITS:

✅ LOOSE COUPLING
   - No direct dependency on Sentry or any specific provider
   - Easy to switch or add monitoring providers
   - Better testability with mock providers

✅ BETTER TYPE SAFETY
   - Strongly typed interfaces
   - Better error level definitions
   - Typed performance metric categories

✅ ENHANCED FEATURES
   - Reactive monitoring with observables
   - Multiple provider support
   - Transaction tracking
   - User action tracking
   - Health status monitoring

✅ IMPROVED DEVELOPER EXPERIENCE
   - Consistent API across all providers
   - Better debugging tools
   - Comprehensive demo components
   - Detailed documentation

✅ PRODUCTION READY
   - Environment-specific configuration
   - Automatic error handling
   - Performance optimization
   - Security best practices
*/
