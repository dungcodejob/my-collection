import { JsonPipe } from "@angular/common";
import { Component, Injectable, inject } from "@angular/core";
import { UnifiedMonitoringService } from "../data-access/unified-monitoring.service";
import { ErrorLog } from "../models";

/**
 * Demo Component để test component detection trong UnifiedErrorHandler
 */
@Component({
  selector: "app-user-profile",
  imports: [JsonPipe],
  template: `
    <div class="user-profile">
      <h2>User Profile Component</h2>
      <button (click)="triggerComponentError()">Test Component Error</button>
      <button (click)="triggerServiceError()">Test Service Error</button>
      <button (click)="triggerAsyncError()">Test Async Error</button>
      <button (click)="triggerNetworkError()">Test Network Error</button>

      <div class="error-logs">
        <h3>Recent Error Logs:</h3>
        <pre>{{ errorLogs | json }}</pre>
      </div>
    </div>
  `,
  styles: [
    `
      .user-profile {
        padding: 20px;
        max-width: 600px;
      }
      button {
        margin: 5px;
        padding: 10px 15px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:hover {
        background: #0056b3;
      }
      .error-logs {
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 4px;
      }
      pre {
        background: #e9ecef;
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
      }
    `,
  ],
})
export class UserProfileComponent {
  private monitoring = inject(UnifiedMonitoringService);
  private userService = inject(UserService);

  errorLogs: ErrorLog[] = [];

  ngOnInit() {
    // Subscribe to error logs để hiển thị
    this.monitoring.errorLogs$.subscribe((logs: ErrorLog[]) => {
      this.errorLogs = logs.slice(-5); // Chỉ hiển thị 5 lỗi gần nhất
    });
  }

  /**
   * Test 1: Component method error
   * Expected component detection: "UserProfileComponent"
   */
  triggerComponentError(): void {
    console.log("🧪 Testing component error detection...");

    // Simulate component error
    throw new Error("Error from UserProfileComponent.triggerComponentError()");
  }

  /**
   * Test 2: Service method error
   * Expected component detection: "UserService"
   */
  triggerServiceError(): void {
    console.log("🧪 Testing service error detection...");

    try {
      this.userService.getUserData();
    } catch (error) {
      // Error will be caught by ErrorHandler
      throw error;
    }
  }

  /**
   * Test 3: Async error
   * Expected component detection: "UserProfileComponent" (from stack trace)
   */
  async triggerAsyncError(): Promise<void> {
    console.log("🧪 Testing async error detection...");

    await new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Async error from UserProfileComponent"));
      }, 100);
    });
  }

  /**
   * Test 4: Network error simulation
   * Expected component detection: "UserProfileComponent"
   */
  triggerNetworkError(): void {
    console.log("🧪 Testing network error detection...");

    // Simulate network error
    fetch("/api/non-existent-endpoint")
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .catch(error => {
        // This will be caught by global error handler
        throw new Error(`Network error in UserProfileComponent: ${error.message}`);
      });
  }
}

/**
 * Demo Service để test service error detection
 */
@Injectable({
  providedIn: "root",
})
export class UserService {
  private monitoring = inject(UnifiedMonitoringService);

  /**
   * Method that throws error to test service detection
   * Expected component detection: "UserService"
   */
  getUserData(): any {
    console.log("🧪 UserService.getUserData() called");

    // Simulate service error
    throw new Error("Database connection failed in UserService.getUserData()");
  }

  /**
   * Method with manual error logging
   */
  updateUserProfile(userData: any): void {
    try {
      // Simulate validation error
      if (!userData.email) {
        throw new Error("Email is required");
      }

      // Simulate processing...
      console.log("Processing user data:", userData);
    } catch (error) {
      // Manual error logging với component context
      this.monitoring.captureException(error as Error, {
        component: "UserService",
        level: "warning",
        extra: {
          method: "updateUserProfile",
          userData: userData,
          manual: true,
        },
      });

      throw error;
    }
  }
}

/**
 * Demo Component khác để test route-based detection
 */
@Component({
  selector: "app-product-list",
  template: `
    <div class="product-list">
      <h2>Product List Component</h2>
      <p>URL: {{ currentUrl }}</p>
      <button (click)="triggerRouteBasedError()">Test Route-based Detection</button>
    </div>
  `,
})
export class ProductListComponent {
  private monitoring = inject(UnifiedMonitoringService);

  currentUrl = window.location.pathname;

  /**
   * Test route-based component detection
   * Nếu URL là /products, expected detection: "ProductsComponent"
   * Nếu URL là /product-list, expected detection: "ProductListComponent"
   */
  triggerRouteBasedError(): void {
    console.log("🧪 Testing route-based error detection...");
    console.log("Current URL:", this.currentUrl);

    // Clear stack trace để force route-based detection
    const error = new Error("Route-based error detection test");
    error.stack = ""; // Clear stack to test fallback

    throw error;
  }
}

/**
 * Test utility để kiểm tra component detection
 */
export class ComponentDetectionTester {
  static async runAllTests(): Promise<void> {
    console.log("🧪 Starting Component Detection Tests...");

    // Test 1: Direct component error
    console.log("\n📋 Test 1: Component Error");
    try {
      const component = new UserProfileComponent();
      component.triggerComponentError();
    } catch (error) {
      console.log("✅ Component error triggered");
    }

    // Test 2: Service error
    console.log("\n📋 Test 2: Service Error");
    try {
      const service = new UserService();
      service.getUserData();
    } catch (error) {
      console.log("✅ Service error triggered");
    }

    // Test 3: Stack trace patterns
    console.log("\n📋 Test 3: Stack Trace Patterns");
    ComponentDetectionTester.testStackTracePatterns();

    console.log("\n🎉 All tests completed!");
  }

  static testStackTracePatterns(): void {
    const testCases = [
      {
        name: "Component method",
        stack: `Error: Test error\n    at UserProfileComponent.triggerError (user-profile.component.ts:45:11)\n    at HTMLButtonElement.<anonymous>`,
        expected: "UserProfileComponent",
      },
      {
        name: "Service method",
        stack: `Error: Test error\n    at UserService.getData (user.service.ts:23:9)\n    at UserProfileComponent.loadData`,
        expected: "UserService",
      },
      {
        name: "Kebab-case component file",
        stack: `Error: Test error\n    at Object.eval (product-detail.component.ts:67:15)`,
        expected: "ProductDetailComponent",
      },
      {
        name: "Directive error",
        stack: `Error: Test error\n    at HighlightDirective.onMouseEnter (highlight.directive.ts:34:7)`,
        expected: "HighlightDirective",
      },
    ];

    testCases.forEach(testCase => {
      console.log(`\n  🔍 Testing: ${testCase.name}`);
      console.log(`     Stack: ${testCase.stack.split("\n")[1]}`);
      console.log(`     Expected: ${testCase.expected}`);

      // Simulate component detection logic
      const result = ComponentDetectionTester.simulateDetection(testCase.stack);
      console.log(`     Result: ${result}`);
      console.log(`     Status: ${result === testCase.expected ? "✅ PASS" : "❌ FAIL"}`);
    });
  }

  static simulateDetection(stack: string): string {
    const lines = stack.split("\n");

    for (const line of lines) {
      // Pattern 1: ComponentName.methodName
      const componentMatch = line.match(/at\s+(\w+Component)\./i);
      if (componentMatch) {
        return componentMatch[1];
      }

      // Pattern 2: file.component.ts
      const fileMatch = line.match(/([\w-]+)\.component\.ts/);
      if (fileMatch) {
        const componentName =
          fileMatch[1]
            .split("-")
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("") + "Component";
        return componentName;
      }

      // Pattern 3: Service/Directive
      const serviceMatch = line.match(/at\s+(\w+(?:Service|Directive|Pipe))\./i);
      if (serviceMatch) {
        return serviceMatch[1];
      }
    }

    return "UnknownComponent";
  }
}

/**
 * Usage Examples:
 *
 * 1. Trong component template:
 * ```html
 * <button (click)="triggerComponentError()">Test Error</button>
 * ```
 *
 * 2. Trong browser console:
 * ```javascript
 * // Run all tests
 * ComponentDetectionTester.runAllTests();
 *
 * // Test specific pattern
 * ComponentDetectionTester.testStackTracePatterns();
 * ```
 *
 * 3. Check error logs:
 * ```javascript
 * // Get recent errors
 * const monitoring = inject(UnifiedMonitoringService);
 * monitoring.getErrorLogs().subscribe(logs => {
 *   console.log('Recent errors:', logs);
 * });
 * ```
 */
