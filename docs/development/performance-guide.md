# Performance Guide - Hướng dẫn tối ưu hiệu suất

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Frontend Performance](#frontend-performance)
3. [Backend Performance](#backend-performance)
4. [Database Optimization](#database-optimization)
5. [Caching Strategies](#caching-strategies)
6. [Monitoring & Metrics](#monitoring--metrics)
7. [Performance Testing](#performance-testing)
8. [Best Practices](#best-practices)

## 🎯 Tổng quan

Tài liệu này cung cấp hướng dẫn chi tiết về tối ưu hiệu suất cho ứng dụng My Collection, bao gồm frontend Angular, backend NestJS, và database optimization.

### Performance Goals

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 1.5s | 1.2s |
| Largest Contentful Paint (LCP) | < 2.5s | 2.1s |
| Cumulative Layout Shift (CLS) | < 0.1 | 0.08 |
| First Input Delay (FID) | < 100ms | 85ms |
| Time to Interactive (TTI) | < 3.5s | 3.1s |
| API Response Time | < 200ms | 150ms |

## 🚀 Frontend Performance

### 1. Bundle Optimization

#### Code Splitting và Lazy Loading

```typescript
// app.routes.ts - Route-based code splitting
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'bookmarks',
    loadChildren: () => import('./features/bookmarks/bookmarks.routes')
      .then(m => m.bookmarkRoutes)
  },
  {
    path: 'collections',
    loadChildren: () => import('./features/collections/collections.routes')
      .then(m => m.collectionRoutes)
  }
];
```

#### Tree Shaking Configuration

```typescript
// angular.json - Build optimization
{
  "projects": {
    "my-collection": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true,
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
              ]
            }
          }
        }
      }
    }
  }
}
```

### 2. Component Optimization

#### OnPush Change Detection

```typescript
// bookmark-card.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Bookmark } from '../../models/bookmark.model';

@Component({
  selector: 'app-bookmark-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bookmark-card" [class.favorite]="bookmark().isFavorite">
      <div class="bookmark-header">
        <h3>{{ bookmark().title }}</h3>
        <button 
          type="button"
          (click)="onToggleFavorite()"
          [attr.aria-label]="bookmark().isFavorite ? 'Remove from favorites' : 'Add to favorites'">
          <i [class]="favoriteIcon()"></i>
        </button>
      </div>
      
      <p class="bookmark-description">{{ bookmark().description }}</p>
      
      <div class="bookmark-tags">
        @for (tag of bookmark().tags; track tag.id) {
          <span class="tag" [style.background-color]="tag.color">
            {{ tag.name }}
          </span>
        }
      </div>
      
      <div class="bookmark-actions">
        <button type="button" (click)="onEdit()">Edit</button>
        <button type="button" (click)="onDelete()">Delete</button>
      </div>
    </div>
  `,
  styles: [`
    .bookmark-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      transition: box-shadow 0.2s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      &.favorite {
        border-color: #f59e0b;
      }
    }
    
    .bookmark-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    
    .bookmark-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin: 12px 0;
    }
    
    .tag {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      color: white;
    }
    
    .bookmark-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
  `]
})
export class BookmarkCardComponent {
  bookmark = input.required<Bookmark>();
  
  edit = output<Bookmark>();
  delete = output<string>();
  toggleFavorite = output<string>();
  
  favoriteIcon = computed(() => 
    this.bookmark().isFavorite ? 'fas fa-heart' : 'far fa-heart'
  );
  
  onEdit(): void {
    this.edit.emit(this.bookmark());
  }
  
  onDelete(): void {
    this.delete.emit(this.bookmark().id);
  }
  
  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.bookmark().id);
  }
}
```

#### Virtual Scrolling

```typescript
// bookmark-list.component.ts
import { Component, computed, signal } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BookmarkCardComponent } from './bookmark-card.component';

@Component({
  selector: 'app-bookmark-list',
  standalone: true,
  imports: [ScrollingModule, BookmarkCardComponent],
  template: `
    <div class="bookmark-list-container">
      <div class="list-header">
        <h2>Bookmarks ({{ totalCount() }})</h2>
        <div class="view-controls">
          <button 
            type="button"
            [class.active]="viewMode() === 'grid'"
            (click)="setViewMode('grid')">
            Grid
          </button>
          <button 
            type="button"
            [class.active]="viewMode() === 'list'"
            (click)="setViewMode('list')">
            List
          </button>
        </div>
      </div>
      
      <cdk-virtual-scroll-viewport 
        itemSize="200" 
        class="bookmark-viewport"
        [class.grid-view]="viewMode() === 'grid'">
        
        @for (bookmark of bookmarks(); track bookmark.id) {
          <app-bookmark-card
            [bookmark]="bookmark"
            (edit)="onEditBookmark($event)"
            (delete)="onDeleteBookmark($event)"
            (toggleFavorite)="onToggleFavorite($event)" />
        }
      </cdk-virtual-scroll-viewport>
    </div>
  `,
  styles: [`
    .bookmark-list-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .bookmark-viewport {
      flex: 1;
      padding: 16px;
    }
    
    .bookmark-viewport.grid-view {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    
    .view-controls button {
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      background: white;
      cursor: pointer;
      
      &.active {
        background: #3b82f6;
        color: white;
      }
      
      &:first-child {
        border-radius: 4px 0 0 4px;
      }
      
      &:last-child {
        border-radius: 0 4px 4px 0;
        border-left: none;
      }
    }
  `]
})
export class BookmarkListComponent {
  bookmarks = signal<Bookmark[]>([]);
  viewMode = signal<'grid' | 'list'>('grid');
  totalCount = computed(() => this.bookmarks().length);
  
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }
  
  onEditBookmark(bookmark: Bookmark): void {
    // Handle edit
  }
  
  onDeleteBookmark(id: string): void {
    // Handle delete
  }
  
  onToggleFavorite(id: string): void {
    // Handle toggle favorite
  }
}
```

### 3. Image Optimization

#### Responsive Images với NgOptimizedImage

```typescript
// image-with-fallback.component.ts
import { Component, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-image-with-fallback',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    @if (!imageError()) {
      <img 
        [ngSrc]="src()"
        [alt]="alt()"
        [width]="width()"
        [height]="height()"
        [priority]="priority()"
        [sizes]="sizes()"
        (error)="onImageError()"
        [class]="class()" />
    } @else {
      <div class="image-fallback" [style.width.px]="width()" [style.height.px]="height()">
        <i class="fas fa-image"></i>
        <span>Image not available</span>
      </div>
    }
  `,
  styles: [`
    .image-fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      color: #6b7280;
      border-radius: 4px;
      
      i {
        font-size: 24px;
        margin-bottom: 8px;
      }
      
      span {
        font-size: 12px;
      }
    }
  `]
})
export class ImageWithFallbackComponent {
  src = input.required<string>();
  alt = input.required<string>();
  width = input.required<number>();
  height = input.required<number>();
  priority = input<boolean>(false);
  sizes = input<string>('100vw');
  class = input<string>('');
  
  imageError = signal(false);
  
  onImageError(): void {
    this.imageError.set(true);
  }
}
```

### 4. Service Worker & Caching

```typescript
// sw-update.service.ts
import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SwUpdateService {
  constructor(private swUpdate: SwUpdate) {
    if (swUpdate.isEnabled) {
      this.checkForUpdates();
    }
  }
  
  private checkForUpdates(): void {
    // Check for updates every 6 hours
    setInterval(() => {
      this.swUpdate.checkForUpdate();
    }, 6 * 60 * 60 * 1000);
    
    // Listen for version updates
    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        if (confirm('New version available. Load new version?')) {
          window.location.reload();
        }
      });
  }
}
```

## ⚡ Backend Performance

### 1. Database Query Optimization

#### Efficient Queries với TypeORM

```typescript
// bookmark.repository.ts
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';

@Injectable()
export class BookmarkRepository {
  constructor(
    @InjectRepository(Bookmark)
    private readonly repository: Repository<Bookmark>
  ) {}
  
  async findWithPagination(
    userId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    tags?: string[]
  ): Promise<{ data: Bookmark[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder('bookmark')
      .leftJoinAndSelect('bookmark.tags', 'tag')
      .leftJoinAndSelect('bookmark.collection', 'collection')
      .where('bookmark.userId = :userId', { userId })
      .orderBy('bookmark.createdAt', 'DESC');
    
    // Search optimization
    if (search) {
      queryBuilder.andWhere(
        '(bookmark.title ILIKE :search OR bookmark.description ILIKE :search OR bookmark.url ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    // Tag filtering optimization
    if (tags && tags.length > 0) {
      queryBuilder
        .andWhere('tag.name IN (:...tags)', { tags })
        .groupBy('bookmark.id, tag.id, collection.id')
        .having('COUNT(DISTINCT tag.name) = :tagCount', { tagCount: tags.length });
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    // Execute queries
    const [data, total] = await Promise.all([
      queryBuilder.getMany(),
      queryBuilder.getCount()
    ]);
    
    return { data, total };
  }
  
  async findPopularTags(userId: string, limit: number = 10): Promise<any[]> {
    return this.repository
      .createQueryBuilder('bookmark')
      .innerJoin('bookmark.tags', 'tag')
      .select('tag.name', 'name')
      .addSelect('tag.color', 'color')
      .addSelect('COUNT(bookmark.id)', 'count')
      .where('bookmark.userId = :userId', { userId })
      .groupBy('tag.id, tag.name, tag.color')
      .orderBy('COUNT(bookmark.id)', 'DESC')
      .limit(limit)
      .getRawMany();
  }
  
  async findSimilarBookmarks(bookmarkId: string, limit: number = 5): Promise<Bookmark[]> {
    // Use full-text search for similarity
    return this.repository
      .createQueryBuilder('bookmark')
      .leftJoinAndSelect('bookmark.tags', 'tag')
      .where('bookmark.id != :bookmarkId', { bookmarkId })
      .andWhere(`
        EXISTS (
          SELECT 1 FROM bookmark_tags bt1
          INNER JOIN bookmark_tags bt2 ON bt1.tag_id = bt2.tag_id
          WHERE bt1.bookmark_id = :bookmarkId AND bt2.bookmark_id = bookmark.id
        )
      `, { bookmarkId })
      .orderBy('bookmark.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }
}
```

### 2. Caching Implementation

#### Redis Caching Service

```typescript
// cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  
  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }
  
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
  
  async delPattern(pattern: string): Promise<void> {
    const keys = await this.cacheManager.store.keys(pattern);
    if (keys.length > 0) {
      await this.cacheManager.store.mdel(...keys);
    }
  }
  
  // Cache keys generators
  getUserBookmarksKey(userId: string, page: number, limit: number, filters?: any): string {
    const filterHash = filters ? JSON.stringify(filters) : '';
    return `user:${userId}:bookmarks:${page}:${limit}:${filterHash}`;
  }
  
  getUserTagsKey(userId: string): string {
    return `user:${userId}:tags`;
  }
  
  getBookmarkKey(id: string): string {
    return `bookmark:${id}`;
  }
}
```

#### Caching Decorator

```typescript
// decorators/cache.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);

// cache.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector
  ) {}
  
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>('cache_key', context.getHandler());
    const cacheTTL = this.reflector.get<number>('cache_ttl', context.getHandler());
    
    if (!cacheKey) {
      return next.handle();
    }
    
    // Generate dynamic cache key
    const request = context.switchToHttp().getRequest();
    const dynamicKey = this.generateCacheKey(cacheKey, request);
    
    // Try to get from cache
    const cachedResult = await this.cacheService.get(dynamicKey);
    if (cachedResult) {
      return of(cachedResult);
    }
    
    // Execute and cache result
    return next.handle().pipe(
      tap(async (result) => {
        await this.cacheService.set(dynamicKey, result, cacheTTL);
      })
    );
  }
  
  private generateCacheKey(template: string, request: any): string {
    return template
      .replace(':userId', request.user?.id || 'anonymous')
      .replace(':id', request.params?.id || '')
      .replace(':query', JSON.stringify(request.query || {}));
  }
}
```

### 3. API Response Optimization

#### Response Compression

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable compression
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024, // Only compress responses > 1KB
  }));
  
  await app.listen(3000);
}
bootstrap();
```

#### Response Serialization

```typescript
// dto/bookmark-response.dto.ts
import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class BookmarkResponseDto {
  @Expose()
  id: string;
  
  @Expose()
  title: string;
  
  @Expose()
  url: string;
  
  @Expose()
  description?: string;
  
  @Expose()
  @Transform(({ value }) => value || '/assets/default-favicon.ico')
  favicon?: string;
  
  @Expose()
  isFavorite: boolean;
  
  @Expose()
  @Type(() => TagResponseDto)
  tags: TagResponseDto[];
  
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: Date;
  
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  updatedAt: Date;
  
  // Exclude sensitive data
  @Exclude()
  userId: string;
  
  @Exclude()
  deletedAt?: Date;
}

export class TagResponseDto {
  @Expose()
  id: string;
  
  @Expose()
  name: string;
  
  @Expose()
  color?: string;
}
```

## 🗄️ Database Optimization

### 1. Index Strategy

```sql
-- Database indexes for optimal query performance

-- Bookmarks table indexes
CREATE INDEX CONCURRENTLY idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX CONCURRENTLY idx_bookmarks_created_at ON bookmarks(created_at DESC);
CREATE INDEX CONCURRENTLY idx_bookmarks_user_created ON bookmarks(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_bookmarks_favorite ON bookmarks(user_id, is_favorite) WHERE is_favorite = true;

-- Full-text search index
CREATE INDEX CONCURRENTLY idx_bookmarks_search ON bookmarks 
USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || url));

-- Tags table indexes
CREATE INDEX CONCURRENTLY idx_tags_user_id ON tags(user_id);
CREATE INDEX CONCURRENTLY idx_tags_name ON tags(user_id, name);

-- Bookmark-Tags junction table indexes
CREATE INDEX CONCURRENTLY idx_bookmark_tags_bookmark ON bookmark_tags(bookmark_id);
CREATE INDEX CONCURRENTLY idx_bookmark_tags_tag ON bookmark_tags(tag_id);
CREATE INDEX CONCURRENTLY idx_bookmark_tags_composite ON bookmark_tags(bookmark_id, tag_id);

-- Collections table indexes
CREATE INDEX CONCURRENTLY idx_collections_user_id ON collections(user_id);
CREATE INDEX CONCURRENTLY idx_collections_user_created ON collections(user_id, created_at DESC);
```

### 2. Query Optimization

```typescript
// Advanced query optimization
export class OptimizedBookmarkRepository {
  async findBookmarksWithStats(userId: string): Promise<any> {
    return this.repository.query(`
      WITH bookmark_stats AS (
        SELECT 
          b.id,
          b.title,
          b.url,
          b.description,
          b.is_favorite,
          b.created_at,
          COUNT(bt.tag_id) as tag_count,
          ARRAY_AGG(
            JSON_BUILD_OBJECT(
              'id', t.id,
              'name', t.name,
              'color', t.color
            )
          ) FILTER (WHERE t.id IS NOT NULL) as tags
        FROM bookmarks b
        LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
        LEFT JOIN tags t ON bt.tag_id = t.id
        WHERE b.user_id = $1
        GROUP BY b.id, b.title, b.url, b.description, b.is_favorite, b.created_at
      )
      SELECT * FROM bookmark_stats
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);
  }
  
  async getTagUsageStats(userId: string): Promise<any> {
    return this.repository.query(`
      SELECT 
        t.id,
        t.name,
        t.color,
        COUNT(bt.bookmark_id) as usage_count,
        COUNT(bt.bookmark_id) * 100.0 / (
          SELECT COUNT(*) FROM bookmarks WHERE user_id = $1
        ) as usage_percentage
      FROM tags t
      LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
      LEFT JOIN bookmarks b ON bt.bookmark_id = b.id
      WHERE t.user_id = $1
      GROUP BY t.id, t.name, t.color
      ORDER BY usage_count DESC
    `, [userId]);
  }
}
```

## 📊 Monitoring & Metrics

### 1. Performance Monitoring

```typescript
// performance.service.ts
import { Injectable } from '@nestjs/common';
import { performance } from 'perf_hooks';

@Injectable()
export class PerformanceService {
  private metrics = new Map<string, number[]>();
  
  startTimer(label: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
      return duration;
    };
  }
  
  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 1000 measurements
    if (values.length > 1000) {
      values.shift();
    }
  }
  
  getMetrics(label: string): any {
    const values = this.metrics.get(label) || [];
    if (values.length === 0) {
      return null;
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
  
  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [label] of this.metrics) {
      result[label] = this.getMetrics(label);
    }
    return result;
  }
}
```

### 2. Health Check

```typescript
// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { PerformanceService } from './performance.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private performance: PerformanceService
  ) {}
  
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.checkPerformance()
    ]);
  }
  
  @Get('metrics')
  getMetrics() {
    return {
      performance: this.performance.getAllMetrics(),
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
  }
  
  private async checkPerformance() {
    const metrics = this.performance.getMetrics('api_response_time');
    const isHealthy = !metrics || metrics.avg < 500; // 500ms threshold
    
    return {
      'performance': {
        status: isHealthy ? 'up' : 'down',
        metrics
      }
    };
  }
}
```

## 🧪 Performance Testing

### 1. Load Testing với Artillery

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"
    - duration: 60
      arrivalRate: 100
      name: "Stress test"
  defaults:
    headers:
      Authorization: 'Bearer {{ $randomString() }}'

scenarios:
  - name: "Get bookmarks"
    weight: 70
    flow:
      - get:
          url: "/api/bookmarks"
          qs:
            page: "{{ $randomInt(1, 10) }}"
            limit: "20"
      - think: 2
      
  - name: "Search bookmarks"
    weight: 20
    flow:
      - get:
          url: "/api/bookmarks"
          qs:
            search: "{{ $randomString() }}"
            page: "1"
            limit: "10"
      - think: 3
      
  - name: "Create bookmark"
    weight: 10
    flow:
      - post:
          url: "/api/bookmarks"
          json:
            title: "Test Bookmark {{ $randomString() }}"
            url: "https://example.com/{{ $randomString() }}"
            description: "Test description"
            tags: ["test", "performance"]
      - think: 1
```

### 2. Frontend Performance Testing

```typescript
// performance-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load bookmarks page within performance budget', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/bookmarks');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });
    
    // Assert performance budgets
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1500); // 1.5s
    expect(performanceMetrics.totalLoadTime).toBeLessThan(3000); // 3s
    expect(performanceMetrics.domContentLoaded).toBeLessThan(1000); // 1s
  });
  
  test('should handle large bookmark lists efficiently', async ({ page }) => {
    // Mock large dataset
    await page.route('/api/bookmarks*', async route => {
      const bookmarks = Array.from({ length: 1000 }, (_, i) => ({
        id: `bookmark-${i}`,
        title: `Bookmark ${i}`,
        url: `https://example${i}.com`,
        description: `Description for bookmark ${i}`,
        tags: [`tag${i % 10}`, `category${i % 5}`],
        createdAt: new Date().toISOString()
      }));
      
      await route.fulfill({
        json: {
          data: bookmarks.slice(0, 20),
          total: 1000,
          page: 1,
          limit: 20
        }
      });
    });
    
    await page.goto('/bookmarks');
    
    // Measure rendering time
    const renderTime = await page.evaluate(() => {
      const start = performance.now();
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          resolve(performance.now() - start);
        });
      });
    });
    
    expect(renderTime).toBeLessThan(100); // 100ms render budget
  });
});
```

## 📋 Best Practices

### 1. Frontend Best Practices

- **Lazy Loading**: Implement route-based và component-based lazy loading
- **OnPush Strategy**: Sử dụng OnPush change detection cho tất cả components
- **Virtual Scrolling**: Implement cho danh sách lớn (>100 items)
- **Image Optimization**: Sử dụng NgOptimizedImage và responsive images
- **Bundle Analysis**: Thường xuyên analyze bundle size với webpack-bundle-analyzer
- **Service Worker**: Implement caching strategy cho static assets

### 2. Backend Best Practices

- **Database Indexing**: Tạo indexes cho tất cả query patterns thường dùng
- **Query Optimization**: Sử dụng query builder thay vì raw queries khi có thể
- **Caching Strategy**: Implement multi-level caching (memory, Redis, CDN)
- **Connection Pooling**: Configure database connection pool appropriately
- **Response Compression**: Enable gzip compression cho API responses
- **Rate Limiting**: Implement rate limiting để protect against abuse

### 3. Monitoring Best Practices

- **Real User Monitoring (RUM)**: Track actual user performance metrics
- **Synthetic Monitoring**: Regular automated performance tests
- **Error Tracking**: Implement comprehensive error tracking và alerting
- **Performance Budgets**: Set và enforce performance budgets trong CI/CD
- **Regular Audits**: Schedule regular performance audits và optimizations

---

*Tài liệu này cung cấp hướng dẫn comprehensive về performance optimization cho My Collection. Thường xuyên review và update based on actual performance metrics và user feedback.*