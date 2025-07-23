# Troubleshooting Guide - Hướng dẫn xử lý sự cố

## 🚨 Tổng quan

Tài liệu này cung cấp hướng dẫn chi tiết để xử lý các sự cố thường gặp trong ứng dụng My Collection, bao gồm cả frontend (Angular) và backend (NestJS).

## 🔧 Công cụ Debug

### Frontend Debugging Tools

```typescript
// src/app/core/services/debug.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private readonly isDebugMode = !environment.production;

  log(message: string, data?: any): void {
    if (this.isDebugMode) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error);
    
    // Gửi error lên monitoring service
    this.sendErrorToMonitoring(message, error);
  }

  warn(message: string, data?: any): void {
    if (this.isDebugMode) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  performance(label: string, fn: () => void): void {
    if (this.isDebugMode) {
      console.time(label);
      fn();
      console.timeEnd(label);
    } else {
      fn();
    }
  }

  private sendErrorToMonitoring(message: string, error: any): void {
    // Tích hợp với Sentry hoặc monitoring service khác
    if (environment.production) {
      // Sentry.captureException(error);
    }
  }
}
```

### Backend Debugging Tools

```typescript
// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;

    this.logger.log(
      `${method} ${url} - ${userAgent} ${ip} - Request: ${JSON.stringify({
        body,
        query,
        params,
      })}`
    );

    const now = Date.now();
    return next.handle().pipe(
      tap((response) => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `${method} ${url} - ${responseTime}ms - Response: ${JSON.stringify(response)}`
        );
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        this.logger.error(
          `${method} ${url} - ${responseTime}ms - Error: ${error.message}`,
          error.stack
        );
        throw error;
      })
    );
  }
}
```

## 🐛 Frontend Issues

### 1. Angular Build Errors

#### Lỗi: "Cannot find module" hoặc "Module not found"

**Nguyên nhân:**
- Import path không đúng
- Module chưa được khai báo
- TypeScript configuration issues

**Giải pháp:**

```bash
# 1. Kiểm tra và cài đặt lại dependencies
npm ci

# 2. Clear cache
npm run ng cache clean
rm -rf node_modules/.cache

# 3. Rebuild
npm run build
```

```typescript
// Kiểm tra tsconfig.json paths
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@app/*": ["src/app/*"],
      "@shared/*": ["src/app/shared/*"],
      "@core/*": ["src/app/core/*"]
    }
  }
}
```

#### Lỗi: "Property does not exist on type"

**Nguyên nhân:**
- TypeScript strict mode
- Interface/type definition thiếu

**Giải pháp:**

```typescript
// Sử dụng optional chaining và type guards
interface User {
  id: string;
  name?: string;
  email: string;
}

// Thay vì
// user.name.toUpperCase() // Error

// Sử dụng
user.name?.toUpperCase() // Safe
```

### 2. NgRx Signals Issues

#### Lỗi: Signal không update UI

**Nguyên nhân:**
- Signal không được computed đúng cách
- Component không subscribe signal

**Giải pháp:**

```typescript
// ❌ Sai
export class BookmarkStore {
  private _bookmarks = signal<Bookmark[]>([]);
  
  // Không reactive
  get bookmarks() {
    return this._bookmarks();
  }
}

// ✅ Đúng
export class BookmarkStore {
  private _bookmarks = signal<Bookmark[]>([]);
  
  // Reactive signal
  readonly bookmarks = this._bookmarks.asReadonly();
  
  // Computed signal
  readonly bookmarkCount = computed(() => this.bookmarks().length);
}
```

#### Lỗi: "ExpressionChangedAfterItHasBeenCheckedError"

**Nguyên nhân:**
- Signal thay đổi trong lifecycle hook
- Async operations trong template

**Giải pháp:**

```typescript
@Component({
  template: `
    <div>{{ bookmarkCount() }}</div>
  `
})
export class BookmarkComponent {
  private bookmarkStore = inject(BookmarkStore);
  
  // ❌ Sai - gọi trong constructor
  constructor() {
    this.bookmarkStore.loadBookmarks(); // Có thể gây lỗi
  }
  
  // ✅ Đúng - gọi trong ngOnInit
  ngOnInit() {
    this.bookmarkStore.loadBookmarks();
  }
  
  readonly bookmarkCount = computed(() => 
    this.bookmarkStore.bookmarks().length
  );
}
```

### 3. HTTP Client Issues

#### Lỗi: CORS (Cross-Origin Resource Sharing)

**Nguyên nhân:**
- Backend không cấu hình CORS đúng
- Request từ domain khác

**Giải pháp:**

```typescript
// Backend - main.ts
app.enableCors({
  origin: [
    'http://localhost:4200',
    'https://my-collection.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

#### Lỗi: HTTP Interceptor không hoạt động

**Nguyên nhân:**
- Interceptor không được provide đúng cách
- Thứ tự interceptor không đúng

**Giải pháp:**

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        loadingInterceptor
      ])
    )
  ]
};
```

### 4. Routing Issues

#### Lỗi: "Cannot match any routes"

**Nguyên nhân:**
- Route configuration sai
- Lazy loading module không load được

**Giải pháp:**

```typescript
// Kiểm tra route configuration
const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'bookmarks',
    loadChildren: () => import('./features/bookmarks/bookmarks.routes')
      .then(m => m.BOOKMARK_ROUTES)
  },
  {
    path: '**',
    component: NotFoundComponent // Wildcard route
  }
];
```

#### Lỗi: Route Guards không hoạt động

**Nguyên nhân:**
- Guard return type không đúng
- Async guard không handle promise

**Giải pháp:**

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.isAuthenticated().pipe(
    map(isAuth => {
      if (isAuth) {
        return true;
      } else {
        router.navigate(['/auth/login']);
        return false;
      }
    })
  );
};
```

## 🔧 Backend Issues

### 1. NestJS Application Startup

#### Lỗi: "Cannot resolve dependency"

**Nguyên nhân:**
- Circular dependency
- Provider không được import đúng module

**Giải pháp:**

```typescript
// ❌ Circular dependency
@Injectable()
export class UserService {
  constructor(private bookmarkService: BookmarkService) {}
}

@Injectable()
export class BookmarkService {
  constructor(private userService: UserService) {} // Circular!
}

// ✅ Sử dụng forwardRef
@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => BookmarkService))
    private bookmarkService: BookmarkService
  ) {}
}
```

#### Lỗi: Database connection failed

**Nguyên nhân:**
- Database credentials sai
- Database server không chạy
- Network connectivity issues

**Giải pháp:**

```typescript
// database.config.ts
export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  retryAttempts: 3,
  retryDelay: 3000,
});

// Health check
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource
  ) {}

  @Get('db')
  async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      throw new ServiceUnavailableException('Database connection failed');
    }
  }
}
```

### 2. Authentication & Authorization

#### Lỗi: JWT Token Invalid

**Nguyên nhân:**
- Token expired
- Secret key không đúng
- Token format sai

**Giải pháp:**

```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Validate user exists
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is disabled');
    }
    
    return user;
  }
}

// Debug JWT issues
@Injectable()
export class AuthService {
  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      console.log('Token decoded:', decoded);
      return decoded;
    } catch (error) {
      console.error('Token validation error:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

#### Lỗi: Permission Denied

**Nguyên nhân:**
- Role-based access control không đúng
- Resource ownership không được check

**Giải pháp:**

```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    console.log('Required roles:', requiredRoles);
    console.log('User roles:', user.roles);
    
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### 3. Database Issues

#### Lỗi: Query Performance

**Nguyên nhân:**
- N+1 query problem
- Missing indexes
- Inefficient queries

**Giải pháp:**

```typescript
// ❌ N+1 Problem
async getBookmarksWithTags() {
  const bookmarks = await this.bookmarkRepository.find();
  
  for (const bookmark of bookmarks) {
    bookmark.tags = await this.tagRepository.findByBookmarkId(bookmark.id);
  }
  
  return bookmarks;
}

// ✅ Eager loading
async getBookmarksWithTags() {
  return this.bookmarkRepository.find({
    relations: ['tags', 'collection', 'user']
  });
}

// ✅ Query builder với join
async getBookmarksWithTags() {
  return this.bookmarkRepository
    .createQueryBuilder('bookmark')
    .leftJoinAndSelect('bookmark.tags', 'tag')
    .leftJoinAndSelect('bookmark.collection', 'collection')
    .leftJoinAndSelect('bookmark.user', 'user')
    .getMany();
}
```

#### Lỗi: Migration Issues

**Nguyên nhân:**
- Schema changes không compatible
- Data migration thất bại

**Giải pháp:**

```typescript
// Safe migration example
export class AddBookmarkMetadata1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add column with default value
    await queryRunner.addColumn('bookmarks', new TableColumn({
      name: 'metadata',
      type: 'jsonb',
      isNullable: true,
      default: "'{}'::jsonb"
    }));
    
    // Update existing records
    await queryRunner.query(`
      UPDATE bookmarks 
      SET metadata = '{}'::jsonb 
      WHERE metadata IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('bookmarks', 'metadata');
  }
}
```

### 4. API Performance Issues

#### Lỗi: Slow Response Times

**Nguyên nhân:**
- Database queries không optimize
- Không có caching
- Blocking operations

**Giải pháp:**

```typescript
// Caching với Redis
@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async findAll(userId: string, query: BookmarkQuery) {
    const cacheKey = `bookmarks:${userId}:${JSON.stringify(query)}`;
    
    // Check cache first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Query database
    const result = await this.bookmarkRepository.find({
      where: { userId },
      ...query
    });
    
    // Cache result for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300);
    
    return result;
  }
}

// Pagination để giảm data load
async findAll(query: BookmarkQuery) {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  
  const [data, total] = await this.bookmarkRepository.findAndCount({
    skip,
    take: limit,
    order: { createdAt: 'DESC' }
  });
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

## 🔍 Debugging Strategies

### 1. Frontend Debugging

```typescript
// Debug service usage
@Component({})
export class BookmarkComponent implements OnInit {
  private debug = inject(DebugService);
  
  ngOnInit() {
    this.debug.log('BookmarkComponent initialized');
    
    this.debug.performance('Load bookmarks', () => {
      this.loadBookmarks();
    });
  }
  
  private loadBookmarks() {
    this.bookmarkService.getBookmarks().subscribe({
      next: (bookmarks) => {
        this.debug.log('Bookmarks loaded', { count: bookmarks.length });
      },
      error: (error) => {
        this.debug.error('Failed to load bookmarks', error);
      }
    });
  }
}
```

### 2. Backend Debugging

```typescript
// Request/Response logging
@Controller('bookmarks')
export class BookmarkController {
  private readonly logger = new Logger(BookmarkController.name);
  
  @Get()
  async findAll(@Query() query: BookmarkQuery, @Req() req: Request) {
    this.logger.log(`GET /bookmarks - User: ${req.user?.id}, Query: ${JSON.stringify(query)}`);
    
    try {
      const result = await this.bookmarkService.findAll(req.user.id, query);
      this.logger.log(`GET /bookmarks - Success: ${result.data.length} items`);
      return result;
    } catch (error) {
      this.logger.error(`GET /bookmarks - Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

## 📊 Monitoring & Alerting

### 1. Health Checks

```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private readonly httpHealthIndicator: HttpHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.typeOrmHealthIndicator.pingCheck('database'),
      () => this.httpHealthIndicator.pingCheck('redis', 'redis://localhost:6379'),
    ]);
  }
}
```

### 2. Error Tracking

```typescript
// error-tracking.service.ts
@Injectable()
export class ErrorTrackingService {
  async captureException(error: Error, context?: any) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    };
    
    // Log to console
    console.error('Error captured:', errorData);
    
    // Send to external service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      // await this.sentryService.captureException(error);
    }
  }
}
```

## 🚀 Performance Optimization

### 1. Frontend Performance

```typescript
// Lazy loading components
const LazyBookmarkComponent = lazy(() => import('./bookmark.component'));

// Virtual scrolling for large lists
@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let bookmark of bookmarks">
        {{ bookmark.title }}
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
export class BookmarkListComponent {}

// OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookmarkComponent {}
```

### 2. Backend Performance

```typescript
// Database connection pooling
TypeOrmModule.forRoot({
  // ...other config
  extra: {
    max: 20, // Maximum connections
    min: 5,  // Minimum connections
    acquire: 30000,
    idle: 10000
  }
});

// Query optimization
@Entity()
@Index(['userId', 'createdAt'])
@Index(['tags'])
export class Bookmark {
  // ...entity definition
}
```

## 📝 Common Error Messages

### Frontend Errors

| Error | Nguyên nhân | Giải pháp |
|-------|-------------|-----------|
| `ExpressionChangedAfterItHasBeenCheckedError` | Signal/data thay đổi sau khi check | Sử dụng `setTimeout` hoặc `ChangeDetectorRef.detectChanges()` |
| `Cannot read property of undefined` | Null/undefined access | Sử dụng optional chaining `?.` |
| `HttpErrorResponse` | API call thất bại | Kiểm tra network, CORS, authentication |
| `Router outlet not found` | Route configuration sai | Kiểm tra router-outlet trong template |

### Backend Errors

| Error | Nguyên nhân | Giải pháp |
|-------|-------------|-----------|
| `Cannot resolve dependency` | DI configuration sai | Kiểm tra providers, imports |
| `QueryFailedError` | SQL query lỗi | Kiểm tra entity, relations, query syntax |
| `UnauthorizedException` | Authentication thất bại | Kiểm tra JWT token, user permissions |
| `ValidationError` | Input validation thất bại | Kiểm tra DTO, validation pipes |

## 🔧 Development Tools

### 1. Browser DevTools

```typescript
// Console debugging
console.log('Bookmark data:', bookmark);
console.table(bookmarks); // Table format
console.group('API Calls');
console.log('Request:', request);
console.log('Response:', response);
console.groupEnd();

// Performance profiling
console.time('Load bookmarks');
// ... code execution
console.timeEnd('Load bookmarks');
```

### 2. Angular DevTools

```bash
# Install Angular DevTools extension
# Chrome: https://chrome.google.com/webstore/detail/angular-devtools/
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/angular-devtools/

# Features:
# - Component tree inspection
# - Signal debugging
# - Performance profiling
# - Change detection analysis
```

### 3. NestJS CLI Debugging

```bash
# Debug mode
npm run start:debug

# Watch mode with debugging
npm run start:dev

# Production debugging
NODE_ENV=production npm run start:prod
```

## 📞 Support & Resources

### 1. Log Analysis

```bash
# View application logs
tail -f logs/application.log

# Filter error logs
grep "ERROR" logs/application.log

# Search for specific patterns
grep -i "bookmark" logs/application.log | tail -20
```

### 2. Database Debugging

```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check active connections
SELECT * FROM pg_stat_activity;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 3. Network Debugging

```bash
# Check API endpoints
curl -X GET http://localhost:3000/api/health

# Test with authentication
curl -X GET http://localhost:3000/api/bookmarks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check CORS
curl -X OPTIONS http://localhost:3000/api/bookmarks \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization"
```

---

**Cập nhật lần cuối**: 2024-12-19  
**Phiên bản**: 1.0.0  
**Tác giả**: My Collection Team