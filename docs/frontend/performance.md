# Performance Optimization - Frontend Performance Best Practices

## 📋 Tổng quan

Tài liệu này mô tả các chiến lược tối ưu hóa hiệu suất cho ứng dụng My Collection, bao gồm lazy loading, caching, bundle optimization, và runtime performance.

## 🎯 Performance Metrics

### Core Web Vitals Targets

```typescript
// core/services/performance.service.ts
@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private performanceObserver?: PerformanceObserver;
  
  constructor() {
    this.initializePerformanceMonitoring();
  }
  
  private initializePerformanceMonitoring() {
    // Largest Contentful Paint (LCP) - Target: < 2.5s
    this.observeMetric('largest-contentful-paint', (entry) => {
      console.log('LCP:', entry.startTime);
      this.reportMetric('lcp', entry.startTime);
    });
    
    // First Input Delay (FID) - Target: < 100ms
    this.observeMetric('first-input', (entry) => {
      console.log('FID:', entry.processingStart - entry.startTime);
      this.reportMetric('fid', entry.processingStart - entry.startTime);
    });
    
    // Cumulative Layout Shift (CLS) - Target: < 0.1
    this.observeMetric('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        console.log('CLS:', entry.value);
        this.reportMetric('cls', entry.value);
      }
    });
  }
  
  private observeMetric(type: string, callback: (entry: any) => void) {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ type, buffered: true });
    }
  }
  
  private reportMetric(name: string, value: number) {
    // Send to analytics service
    gtag('event', 'web_vitals', {
      metric_name: name,
      metric_value: Math.round(value),
      metric_rating: this.getRating(name, value)
    });
  }
  
  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      lcp: [2500, 4000],
      fid: [100, 300],
      cls: [0.1, 0.25]
    };
    
    const [good, poor] = thresholds[metric as keyof typeof thresholds];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }
}
```

## 🚀 Bundle Optimization

### Webpack Configuration

```typescript
// webpack.config.js (for custom builds)
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        },
        spartan: {
          test: /[\\/]node_modules[\\/]@spartan-ng[\\/]/,
          name: 'spartan-ui',
          chunks: 'all',
          priority: 15
        }
      }
    }
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
};
```

### Angular Build Optimization

```json
// angular.json
{
  "projects": {
    "my-collection": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "budgets": [
              {
                "type": "initial",
                "maximumWarning": "500kb",
                "maximumError": "1mb"
              },
              {
                "type": "anyComponentStyle",
                "maximumWarning": "2kb",
                "maximumError": "4kb"
              }
            ],
            "optimization": {
              "scripts": true,
              "styles": true,
              "fonts": true
            },
            "outputHashing": "all",
            "sourceMap": false,
            "namedChunks": false,
            "aot": true,
            "extractLicenses": true,
            "vendorChunk": false,
            "buildOptimizer": true
          }
        }
      }
    }
  }
}
```

## 📦 Lazy Loading Strategies

### Feature Module Lazy Loading

```typescript
// Lazy load entire feature modules
const routes: Routes = [
  {
    path: 'bookmarks',
    loadChildren: () => import('./features/bookmarks/bookmarks.module').then(m => m.BookmarksModule)
  },
  {
    path: 'collections',
    loadChildren: () => import('./features/collections/collections.module').then(m => m.CollectionsModule)
  }
];

// Component-level lazy loading
{
  path: 'dashboard',
  loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
}
```

### Dynamic Component Loading

```typescript
// core/services/dynamic-loader.service.ts
@Injectable({ providedIn: 'root' })
export class DynamicLoaderService {
  private componentCache = new Map<string, Type<any>>();
  
  async loadComponent<T>(componentPath: string): Promise<Type<T>> {
    if (this.componentCache.has(componentPath)) {
      return this.componentCache.get(componentPath)!;
    }
    
    const module = await import(componentPath);
    const component = Object.values(module)[0] as Type<T>;
    
    this.componentCache.set(componentPath, component);
    return component;
  }
  
  async loadAndCreateComponent<T>(
    componentPath: string,
    viewContainer: ViewContainerRef,
    injector?: Injector
  ): Promise<ComponentRef<T>> {
    const component = await this.loadComponent<T>(componentPath);
    return viewContainer.createComponent(component, { injector });
  }
}

// Usage in component
@Component({
  template: `
    <div #dynamicContainer></div>
    <button (click)="loadWidget()">Load Widget</button>
  `
})
export class DashboardComponent {
  @ViewChild('dynamicContainer', { read: ViewContainerRef }) 
  container!: ViewContainerRef;
  
  private dynamicLoader = inject(DynamicLoaderService);
  
  async loadWidget() {
    const componentRef = await this.dynamicLoader.loadAndCreateComponent(
      './widgets/stats-widget.component',
      this.container
    );
    
    // Configure component
    componentRef.instance.data = this.widgetData;
  }
}
```

### Image Lazy Loading

```typescript
// shared/directives/lazy-image.directive.ts
@Directive({
  selector: 'img[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements OnInit, OnDestroy {
  @Input() src!: string;
  @Input() placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+';
  
  private observer?: IntersectionObserver;
  
  constructor(private el: ElementRef<HTMLImageElement>) {}
  
  ngOnInit() {
    this.el.nativeElement.src = this.placeholder;
    this.createObserver();
  }
  
  ngOnDestroy() {
    this.observer?.disconnect();
  }
  
  private createObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px' }
    );
    
    this.observer.observe(this.el.nativeElement);
  }
  
  private loadImage() {
    const img = new Image();
    img.onload = () => {
      this.el.nativeElement.src = this.src;
      this.el.nativeElement.classList.add('loaded');
    };
    img.onerror = () => {
      this.el.nativeElement.src = this.placeholder;
      this.el.nativeElement.classList.add('error');
    };
    img.src = this.src;
  }
}

// Usage
<img 
  appLazyImage 
  [src]="bookmark.thumbnail" 
  [placeholder]="defaultThumbnail"
  alt="Bookmark thumbnail"
  class="transition-opacity duration-300 opacity-0 loaded:opacity-100" />
```

## 💾 Caching Strategies

### HTTP Caching

```typescript
// core/interceptors/cache.interceptor.ts
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, { response: HttpResponse<any>, timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }
    
    // Check if request should be cached
    if (!this.shouldCache(req)) {
      return next.handle(req);
    }
    
    const cacheKey = this.getCacheKey(req);
    const cached = this.cache.get(cacheKey);
    
    // Return cached response if valid
    if (cached && this.isCacheValid(cached.timestamp)) {
      return of(cached.response);
    }
    
    // Make request and cache response
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.set(cacheKey, {
            response: event,
            timestamp: Date.now()
          });
        }
      })
    );
  }
  
  private shouldCache(req: HttpRequest<any>): boolean {
    // Cache static data endpoints
    const cacheableEndpoints = [
      '/api/tags',
      '/api/collections',
      '/api/user/profile'
    ];
    
    return cacheableEndpoints.some(endpoint => req.url.includes(endpoint));
  }
  
  private getCacheKey(req: HttpRequest<any>): string {
    return `${req.method}:${req.urlWithParams}`;
  }
  
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }
  
  clearCache() {
    this.cache.clear();
  }
}
```

### Service Worker Caching

```typescript
// ngsw-config.json
{
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)"
        ]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-cache",
      "urls": [
        "/api/bookmarks",
        "/api/collections",
        "/api/tags"
      ],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 100,
        "maxAge": "1h",
        "timeout": "10s"
      }
    }
  ]
}
```

### Memory Caching Service

```typescript
// core/services/memory-cache.service.ts
@Injectable({ providedIn: 'root' })
export class MemoryCacheService {
  private cache = new Map<string, CacheItem>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  
  set<T>(key: string, value: T, ttl = this.DEFAULT_TTL): void {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
    
    // Clean up expired items periodically
    this.scheduleCleanup();
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  private scheduleCleanup(): void {
    setTimeout(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }
}

interface CacheItem {
  value: any;
  expiresAt: number;
}

// Usage in service
@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private cache = inject(MemoryCacheService);
  
  getBookmarks(): Observable<Bookmark[]> {
    const cacheKey = 'bookmarks';
    const cached = this.cache.get<Bookmark[]>(cacheKey);
    
    if (cached) {
      return of(cached);
    }
    
    return this.http.get<Bookmark[]>('/api/bookmarks').pipe(
      tap(bookmarks => this.cache.set(cacheKey, bookmarks))
    );
  }
}
```

## 🔄 Virtual Scrolling

### Virtual Scroll Implementation

```typescript
// shared/components/virtual-scroll.component.ts
@Component({
  selector: 'app-virtual-scroll',
  standalone: true,
  imports: [CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll],
  template: `
    <cdk-virtual-scroll-viewport 
      [itemSize]="itemSize"
      [minBufferPx]="minBufferPx"
      [maxBufferPx]="maxBufferPx"
      class="h-full">
      
      <div 
        *cdkVirtualFor="let item of items; trackBy: trackByFn"
        class="virtual-item">
        <ng-container 
          [ngTemplateOutlet]="itemTemplate"
          [ngTemplateOutletContext]="{ $implicit: item, index: i }">
        </ng-container>
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
export class VirtualScrollComponent<T> {
  @Input() items: T[] = [];
  @Input() itemSize = 60;
  @Input() minBufferPx = 200;
  @Input() maxBufferPx = 400;
  @Input() itemTemplate!: TemplateRef<any>;
  @Input() trackByFn: TrackByFunction<T> = (index) => index;
}

// Usage
@Component({
  template: `
    <app-virtual-scroll
      [items]="bookmarks()"
      [itemSize]="80"
      [itemTemplate]="bookmarkTemplate">
    </app-virtual-scroll>
    
    <ng-template #bookmarkTemplate let-bookmark>
      <app-bookmark-card [bookmark]="bookmark" />
    </ng-template>
  `
})
export class BookmarkListComponent {
  bookmarks = signal<Bookmark[]>([]);
}
```

### Infinite Scroll

```typescript
// shared/directives/infinite-scroll.directive.ts
@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  @Input() threshold = 200;
  @Input() debounceTime = 300;
  @Output() loadMore = new EventEmitter<void>();
  
  private observer?: IntersectionObserver;
  private sentinel?: HTMLElement;
  
  constructor(private el: ElementRef) {}
  
  ngOnInit() {
    this.createSentinel();
    this.createObserver();
  }
  
  ngOnDestroy() {
    this.observer?.disconnect();
    this.sentinel?.remove();
  }
  
  private createSentinel() {
    this.sentinel = document.createElement('div');
    this.sentinel.style.height = '1px';
    this.sentinel.style.position = 'absolute';
    this.sentinel.style.bottom = `${this.threshold}px`;
    this.sentinel.style.width = '100%';
    this.el.nativeElement.appendChild(this.sentinel);
  }
  
  private createObserver() {
    this.observer = new IntersectionObserver(
      debounce((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadMore.emit();
          }
        });
      }, this.debounceTime)
    );
    
    this.observer.observe(this.sentinel!);
  }
}

// Usage
@Component({
  template: `
    <div 
      appInfiniteScroll 
      (loadMore)="loadMoreBookmarks()"
      class="relative">
      
      @for (bookmark of bookmarks(); track bookmark.id) {
        <app-bookmark-card [bookmark]="bookmark" />
      }
      
      @if (loading()) {
        <div class="flex justify-center p-4">
          <app-spinner />
        </div>
      }
    </div>
  `
})
export class BookmarkListComponent {
  bookmarks = signal<Bookmark[]>([]);
  loading = signal(false);
  hasMore = signal(true);
  
  private page = 0;
  private readonly pageSize = 20;
  
  loadMoreBookmarks() {
    if (this.loading() || !this.hasMore()) return;
    
    this.loading.set(true);
    this.page++;
    
    this.bookmarkService.getBookmarks(this.page, this.pageSize)
      .subscribe({
        next: (newBookmarks) => {
          this.bookmarks.update(current => [...current, ...newBookmarks]);
          this.hasMore.set(newBookmarks.length === this.pageSize);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.page--; // Rollback page on error
        }
      });
  }
}
```

## 🎨 CSS Optimization

### Critical CSS

```typescript
// tools/critical-css.js
const critical = require('critical');

critical.generate({
  inline: true,
  base: 'dist/',
  src: 'index.html',
  dest: 'index.html',
  width: 1300,
  height: 900,
  minify: true,
  extract: true,
  ignore: {
    atrule: ['@font-face'],
    rule: [/some-unused-class/],
    decl: (node, value) => /url\(/.test(value)
  }
});
```

### CSS Purging

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/@spartan-ng/**/*.{html,ts,js}"
  ],
  theme: {
    extend: {}
  },
  plugins: [],
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './src/**/*.{html,ts}',
      './projects/**/*.{html,ts}'
    ],
    options: {
      safelist: [
        /hlm-/,
        /data-/,
        'dark',
        'light'
      ]
    }
  }
}
```

## 🔧 Runtime Optimization

### Change Detection Optimization

```typescript
// Optimize change detection with OnPush strategy
@Component({
  selector: 'app-bookmark-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bookmark-card">
      <h3>{{ bookmark().title }}</h3>
      <p>{{ bookmark().description }}</p>
      <div class="actions">
        <button (click)="onEdit()">Edit</button>
        <button (click)="onDelete()">Delete</button>
      </div>
    </div>
  `
})
export class BookmarkCardComponent {
  bookmark = input.required<Bookmark>();
  
  private cdr = inject(ChangeDetectorRef);
  
  onEdit() {
    // Trigger change detection manually when needed
    this.cdr.markForCheck();
  }
  
  onDelete() {
    this.cdr.markForCheck();
  }
}

// Use trackBy functions for ngFor
@Component({
  template: `
    @for (bookmark of bookmarks(); track trackByBookmark($index, bookmark)) {
      <app-bookmark-card [bookmark]="bookmark" />
    }
  `
})
export class BookmarkListComponent {
  bookmarks = signal<Bookmark[]>([]);
  
  trackByBookmark(index: number, bookmark: Bookmark): string {
    return bookmark.id;
  }
}
```

### Memory Leak Prevention

```typescript
// Use takeUntilDestroyed for automatic subscription cleanup
@Component({
  template: `<div>Component content</div>`
})
export class MyComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  
  ngOnInit() {
    // Automatically unsubscribes when component is destroyed
    this.dataService.getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        // Handle data
      });
  }
}

// Manual cleanup for complex scenarios
@Component({})
export class ComplexComponent implements OnDestroy {
  private subscriptions = new Subscription();
  private observers: ResizeObserver[] = [];
  
  ngOnInit() {
    // Add subscriptions to composite subscription
    this.subscriptions.add(
      this.service1.data$.subscribe(data => {})
    );
    
    this.subscriptions.add(
      this.service2.events$.subscribe(event => {})
    );
    
    // Track observers for cleanup
    const observer = new ResizeObserver(entries => {});
    this.observers.push(observer);
    observer.observe(this.elementRef.nativeElement);
  }
  
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.observers.forEach(observer => observer.disconnect());
  }
}
```

## 📊 Performance Monitoring

### Performance Budget

```typescript
// core/services/performance-budget.service.ts
@Injectable({ providedIn: 'root' })
export class PerformanceBudgetService {
  private budgets = {
    bundleSize: 1024 * 1024, // 1MB
    loadTime: 3000, // 3 seconds
    memoryUsage: 50 * 1024 * 1024, // 50MB
    domNodes: 1500
  };
  
  checkBudgets() {
    this.checkBundleSize();
    this.checkLoadTime();
    this.checkMemoryUsage();
    this.checkDOMComplexity();
  }
  
  private checkBundleSize() {
    if ('performance' in window) {
      const entries = performance.getEntriesByType('navigation');
      const totalSize = entries.reduce((sum, entry: any) => {
        return sum + (entry.transferSize || 0);
      }, 0);
      
      if (totalSize > this.budgets.bundleSize) {
        console.warn(`Bundle size exceeded: ${totalSize} > ${this.budgets.bundleSize}`);
      }
    }
  }
  
  private checkLoadTime() {
    if ('performance' in window) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      
      if (loadTime > this.budgets.loadTime) {
        console.warn(`Load time exceeded: ${loadTime}ms > ${this.budgets.loadTime}ms`);
      }
    }
  }
  
  private checkMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      if (memory.usedJSHeapSize > this.budgets.memoryUsage) {
        console.warn(`Memory usage exceeded: ${memory.usedJSHeapSize} > ${this.budgets.memoryUsage}`);
      }
    }
  }
  
  private checkDOMComplexity() {
    const nodeCount = document.querySelectorAll('*').length;
    
    if (nodeCount > this.budgets.domNodes) {
      console.warn(`DOM complexity exceeded: ${nodeCount} > ${this.budgets.domNodes}`);
    }
  }
}
```

### Real User Monitoring

```typescript
// core/services/rum.service.ts
@Injectable({ providedIn: 'root' })
export class RealUserMonitoringService {
  constructor() {
    this.initializeRUM();
  }
  
  private initializeRUM() {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.reportMetrics({
          dns: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcp: perfData.connectEnd - perfData.connectStart,
          ttfb: perfData.responseStart - perfData.requestStart,
          download: perfData.responseEnd - perfData.responseStart,
          dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          load: perfData.loadEventEnd - perfData.loadEventStart
        });
      }, 0);
    });
    
    // Track user interactions
    this.trackUserInteractions();
    
    // Track errors
    this.trackErrors();
  }
  
  private trackUserInteractions() {
    ['click', 'keydown', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        const startTime = performance.now();
        
        requestAnimationFrame(() => {
          const duration = performance.now() - startTime;
          
          if (duration > 16) { // > 1 frame at 60fps
            this.reportInteractionDelay(eventType, duration);
          }
        });
      }, { passive: true });
    });
  }
  
  private trackErrors() {
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: 'Unhandled Promise Rejection',
        reason: event.reason
      });
    });
  }
  
  private reportMetrics(metrics: any) {
    // Send to analytics
    gtag('event', 'performance_metrics', metrics);
  }
  
  private reportInteractionDelay(type: string, duration: number) {
    gtag('event', 'interaction_delay', {
      interaction_type: type,
      delay: Math.round(duration)
    });
  }
  
  private reportError(error: any) {
    gtag('event', 'javascript_error', error);
  }
}
```

---

**Cập nhật lần cuối**: 2024-12-19  
**Phiên bản**: 1.0.0  
**Tác giả**: My Collection Team