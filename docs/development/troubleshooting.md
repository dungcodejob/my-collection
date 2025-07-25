# Troubleshooting Guide - Hướng dẫn Xử lý Sự cố

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Common Issues](#common-issues)
3. [Frontend Issues](#frontend-issues)
4. [Backend Issues](#backend-issues)
5. [Database Issues](#database-issues)
6. [Performance Issues](#performance-issues)
7. [Deployment Issues](#deployment-issues)
8. [Development Tools](#development-tools)

## 🎯 Tổng quan

Tài liệu này cung cấp hướng dẫn xử lý các vấn đề thường gặp trong quá trình development và deployment của My Collection project.

### Quick Diagnostics

```bash
# Health check script
#!/bin/bash
echo "=== My Collection Health Check ==="

# Check Node.js version
echo "Node.js version: $(node --version)"

# Check npm version
echo "npm version: $(npm --version)"

# Check Angular CLI
echo "Angular CLI: $(ng version --skip-git 2>/dev/null | head -1)"

# Check database connection
echo "Database status:"
npm run db:check

# Check Redis connection
echo "Redis status:"
npm run redis:check

# Check environment variables
echo "Environment check:"
npm run env:check
```

## 🔧 Common Issues

### Issue: Application Won't Start

**Symptoms:**
- `npm start` fails
- Port already in use errors
- Module not found errors

**Solutions:**

```bash
# 1. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Check port availability
lsof -ti:4200 | xargs kill -9  # Frontend
lsof -ti:3000 | xargs kill -9  # Backend

# 3. Clear npm cache
npm cache clean --force

# 4. Reset Angular CLI cache
ng cache clean

# 5. Check Node.js version compatibility
node --version  # Should be >= 18.x
```

### Issue: Environment Variables Not Loading

**Symptoms:**
- Configuration errors
- Database connection failures
- API endpoints not working

**Solutions:**

```bash
# 1. Check .env file exists and has correct format
ls -la .env*

# 2. Validate environment variables
cat > scripts/check-env.js << 'EOF'
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REDIS_URL',
  'FRONTEND_URL',
  'BACKEND_URL'
];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing: ${varName}`);
  } else {
    console.log(`✅ Found: ${varName}`);
  }
});
EOF

node scripts/check-env.js

# 3. Copy from example if needed
cp .env.example .env
```

### Issue: Build Failures

**Symptoms:**
- TypeScript compilation errors
- Missing dependencies
- Build process hangs

**Solutions:**

```bash
# 1. Clean build artifacts
npm run clean
rm -rf dist/ .angular/

# 2. Update dependencies
npm update
npm audit fix

# 3. Check TypeScript configuration
npx tsc --noEmit

# 4. Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build
```

## 🎨 Frontend Issues

### Issue: Angular Standalone Components Not Working

**Symptoms:**
- Component import errors
- Dependency injection failures
- Routing issues

**Solutions:**

```typescript
// 1. Ensure proper imports in standalone component
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bookmark-card',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add required imports
  template: `...`
})
export class BookmarkCardComponent {
  // Use inject() for dependency injection
  private bookmarkService = inject(BookmarkService);
}

// 2. Check main.ts bootstrap
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));

// 3. Verify app.config.ts providers
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Add all required providers
  ]
};
```

### Issue: NgRx Signals State Not Updating

**Symptoms:**
- State changes not reflected in UI
- Signal values not updating
- Computed signals not recomputing

**Solutions:**

```typescript
// 1. Check signal store implementation
import { signalStore, withState, withMethods, withComputed } from '@ngrx/signals';

export const BookmarkStore = signalStore(
  { providedIn: 'root' },
  withState<BookmarkState>({
    bookmarks: [],
    loading: false,
    error: null
  }),
  withComputed((store) => ({
    // Ensure computed signals are properly defined
    bookmarkCount: computed(() => store.bookmarks().length),
    hasBookmarks: computed(() => store.bookmarks().length > 0)
  })),
  withMethods((store) => ({
    // Use patchState for updates
    setBookmarks: (bookmarks: Bookmark[]) => {
      patchState(store, { bookmarks, loading: false });
    },
    
    // Ensure async operations handle errors
    async loadBookmarks() {
      patchState(store, { loading: true, error: null });
      try {
        const bookmarks = await firstValueFrom(bookmarkService.getBookmarks());
        patchState(store, { bookmarks, loading: false });
      } catch (error) {
        patchState(store, { 
          error: error.message, 
          loading: false 
        });
      }
    }
  }))
);

// 2. Check component signal usage
@Component({
  template: `
    <!-- Use signal() syntax -->
    <div *ngIf="store.loading()">Loading...</div>
    <div *ngFor="let bookmark of store.bookmarks()">
      {{ bookmark.title }}
    </div>
  `
})
export class BookmarkListComponent {
  store = inject(BookmarkStore);
  
  ngOnInit() {
    // Trigger initial load
    this.store.loadBookmarks();
  }
}
```

### Issue: Spartan UI Components Not Styling Correctly

**Symptoms:**
- Components appear unstyled
- CSS classes not applied
- Theme not working

**Solutions:**

```typescript
// 1. Check Spartan UI setup in app.config.ts
import { provideSpartanUI } from '@spartan-ng/ui-core';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideSpartanUI(),
  ]
};

// 2. Verify CSS imports in styles.css
@import '@spartan-ng/ui-core/hlm-base.css';
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

// 3. Check component imports
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';

@Component({
  imports: [HlmButtonDirective, HlmCardDirective],
  template: `
    <div hlmCard>
      <button hlmBtn>Click me</button>
    </div>
  `
})
export class MyComponent {}

// 4. Verify Tailwind configuration
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/@spartan-ng/**/*.{html,ts,js}"
  ],
  // ... rest of config
};
```

### Issue: Service Worker Not Updating

**Symptoms:**
- Old version of app cached
- New features not appearing
- Update notifications not showing

**Solutions:**

```typescript
// 1. Check service worker registration
import { isDevMode } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  imports: [
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
})
export class AppModule {}

// 2. Implement update check service
@Injectable({ providedIn: 'root' })
export class UpdateService {
  constructor(private swUpdate: SwUpdate) {
    if (swUpdate.isEnabled) {
      // Check for updates every 6 hours
      interval(6 * 60 * 60 * 1000).subscribe(() => {
        swUpdate.checkForUpdate();
      });
    }
  }

  checkForUpdates() {
    this.swUpdate.versionUpdates.subscribe(event => {
      switch (event.type) {
        case 'VERSION_DETECTED':
          console.log('New version available');
          break;
        case 'VERSION_READY':
          if (confirm('New version available. Load?')) {
            window.location.reload();
          }
          break;
      }
    });
  }
}

// 3. Force cache clear in development
// In browser console:
// navigator.serviceWorker.getRegistrations().then(registrations => {
//   registrations.forEach(registration => registration.unregister());
// });
```

## 🔧 Backend Issues

### Issue: NestJS Module Dependencies

**Symptoms:**
- Circular dependency errors
- Provider not found errors
- Module import issues

**Solutions:**

```typescript
// 1. Fix circular dependencies with forwardRef
@Module({
  imports: [
    forwardRef(() => BookmarkModule),
    forwardRef(() => UserModule)
  ],
  providers: [CollectionService],
  exports: [CollectionService]
})
export class CollectionModule {}

// 2. Use proper provider injection
@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    
    @Inject(forwardRef(() => CollectionService))
    private collectionService: CollectionService
  ) {}
}

// 3. Check module imports order
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        // database config
      }),
      inject: [ConfigService]
    }),
    // Feature modules after core modules
    AuthModule,
    UserModule,
    BookmarkModule
  ]
})
export class AppModule {}
```

### Issue: TypeORM Database Connection

**Symptoms:**
- Connection timeout errors
- Entity not found errors
- Migration failures

**Solutions:**

```typescript
// 1. Check database configuration
// app.module.ts
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development',
    // Connection pool settings
    extra: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    }
  }),
  inject: [ConfigService]
})

// 2. Test database connection
import { DataSource } from 'typeorm';

async function testConnection() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection successful');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

// 3. Fix entity relationships
@Entity()
export class Bookmark {
  @ManyToOne(() => User, user => user.bookmarks, { 
    onDelete: 'CASCADE',
    eager: false // Avoid circular loading
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany(() => Tag, tag => tag.bookmarks, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  @JoinTable({
    name: 'bookmark_tags',
    joinColumn: { name: 'bookmarkId' },
    inverseJoinColumn: { name: 'tagId' }
  })
  tags: Tag[];
}
```

### Issue: JWT Authentication Problems

**Symptoms:**
- Token validation failures
- Unauthorized errors
- Token expiration issues

**Solutions:**

```typescript
// 1. Check JWT configuration
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
          issuer: configService.get('JWT_ISSUER', 'my-collection'),
          audience: configService.get('JWT_AUDIENCE', 'my-collection-users')
        },
        verifyOptions: {
          issuer: configService.get('JWT_ISSUER', 'my-collection'),
          audience: configService.get('JWT_AUDIENCE', 'my-collection-users')
        }
      }),
      inject: [ConfigService]
    })
  ]
})
export class AuthModule {}

// 2. Implement proper token validation
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      issuer: configService.get('JWT_ISSUER'),
      audience: configService.get('JWT_AUDIENCE')
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}

// 3. Handle token refresh
@Injectable()
export class AuthService {
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET')
      });
      
      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

### Issue: API Rate Limiting

**Symptoms:**
- Too many requests errors
- Rate limit exceeded messages
- Slow API responses

**Solutions:**

```typescript
// 1. Configure rate limiting
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('THROTTLE_TTL', 60),
        limit: configService.get('THROTTLE_LIMIT', 100),
        storage: new ThrottlerStorageRedisService(
          new Redis(configService.get('REDIS_URL'))
        )
      }),
      inject: [ConfigService]
    })
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}

// 2. Custom rate limiting per endpoint
@Controller('bookmarks')
@UseGuards(ThrottlerGuard)
export class BookmarkController {
  @Post()
  @Throttle(10, 60) // 10 requests per minute
  async createBookmark(@Body() dto: CreateBookmarkDto) {
    return this.bookmarkService.create(dto);
  }

  @Get()
  @Throttle(100, 60) // 100 requests per minute for reads
  async getBookmarks() {
    return this.bookmarkService.findAll();
  }
}

// 3. Implement custom rate limiting logic
@Injectable()
export class CustomRateLimitService {
  constructor(private redis: Redis) {}

  async checkRateLimit(
    key: string, 
    limit: number, 
    window: number
  ): Promise<boolean> {
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    
    return current <= limit;
  }
}
```

## 🗄️ Database Issues

### Issue: Migration Failures

**Symptoms:**
- Migration rollback errors
- Schema sync issues
- Data loss during migrations

**Solutions:**

```bash
# 1. Check migration status
npm run migration:show

# 2. Create backup before migration
pg_dump my_collection > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Run migrations step by step
npm run migration:run -- --transaction=each

# 4. Rollback if needed
npm run migration:revert

# 5. Generate new migration
npm run migration:generate -- --name=FixBookmarkSchema
```

```typescript
// Safe migration example
import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class AddBookmarkIndexes1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add indexes for better performance
    await queryRunner.createIndex('bookmarks', new Index({
      name: 'IDX_BOOKMARK_USER_CREATED',
      columnNames: ['userId', 'createdAt']
    }));

    await queryRunner.createIndex('bookmarks', new Index({
      name: 'IDX_BOOKMARK_TITLE_SEARCH',
      columnNames: ['title']
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('bookmarks', 'IDX_BOOKMARK_USER_CREATED');
    await queryRunner.dropIndex('bookmarks', 'IDX_BOOKMARK_TITLE_SEARCH');
  }
}
```

### Issue: Query Performance Problems

**Symptoms:**
- Slow database queries
- High CPU usage
- Connection pool exhaustion

**Solutions:**

```typescript
// 1. Add proper indexes
@Entity()
@Index(['userId', 'createdAt'])
@Index(['title'])
@Index(['tags'])
export class Bookmark {
  // ... entity definition
}

// 2. Optimize queries with proper relations
async findUserBookmarks(userId: string, options: FindOptions) {
  return this.bookmarkRepository.find({
    where: { userId },
    relations: ['tags'], // Only load needed relations
    select: ['id', 'title', 'url', 'createdAt'], // Select specific fields
    order: { createdAt: 'DESC' },
    take: options.limit,
    skip: (options.page - 1) * options.limit
  });
}

// 3. Use query builder for complex queries
async searchBookmarks(userId: string, searchTerm: string) {
  return this.bookmarkRepository
    .createQueryBuilder('bookmark')
    .leftJoinAndSelect('bookmark.tags', 'tag')
    .where('bookmark.userId = :userId', { userId })
    .andWhere(
      '(bookmark.title ILIKE :search OR bookmark.description ILIKE :search)',
      { search: `%${searchTerm}%` }
    )
    .orderBy('bookmark.createdAt', 'DESC')
    .getMany();
}

// 4. Implement caching for frequent queries
@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    private cacheManager: Cache
  ) {}

  async findPopularTags(userId: string): Promise<Tag[]> {
    const cacheKey = `popular-tags:${userId}`;
    
    let tags = await this.cacheManager.get<Tag[]>(cacheKey);
    if (!tags) {
      tags = await this.bookmarkRepository
        .createQueryBuilder('bookmark')
        .leftJoin('bookmark.tags', 'tag')
        .select('tag.name', 'name')
        .addSelect('COUNT(tag.id)', 'count')
        .where('bookmark.userId = :userId', { userId })
        .groupBy('tag.name')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();
      
      await this.cacheManager.set(cacheKey, tags, 300); // 5 minutes
    }
    
    return tags;
  }
}
```

### Issue: Connection Pool Problems

**Symptoms:**
- Connection timeout errors
- Pool exhaustion warnings
- Database connection leaks

**Solutions:**

```typescript
// 1. Configure connection pool properly
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    // ... other config
    extra: {
      max: 20, // Maximum connections
      min: 5,  // Minimum connections
      acquire: 30000, // Maximum time to get connection
      idle: 10000,    // Maximum idle time
      evict: 1000,    // Eviction run interval
      handleDisconnects: true,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200
    }
  }),
  inject: [ConfigService]
})

// 2. Monitor connection usage
@Injectable()
export class DatabaseHealthService {
  constructor(private dataSource: DataSource) {}

  async getConnectionStats() {
    const pool = this.dataSource.driver.pool;
    return {
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingClients: pool.waitingCount,
      maxConnections: pool.options.max
    };
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// 3. Implement connection monitoring
@Injectable()
export class ConnectionMonitorService {
  private readonly logger = new Logger(ConnectionMonitorService.name);

  constructor(private dataSource: DataSource) {
    this.startMonitoring();
  }

  private startMonitoring() {
    setInterval(async () => {
      const stats = await this.getConnectionStats();
      
      if (stats.waitingClients > 5) {
        this.logger.warn('High number of waiting clients', stats);
      }
      
      if (stats.idleConnections < 2) {
        this.logger.warn('Low number of idle connections', stats);
      }
    }, 30000); // Check every 30 seconds
  }
}
```

## ⚡ Performance Issues

### Issue: Slow Page Load Times

**Symptoms:**
- High Time to First Byte (TTFB)
- Large bundle sizes
- Slow API responses

**Solutions:**

```typescript
// 1. Implement lazy loading
const routes: Routes = [
  {
    path: 'bookmarks',
    loadComponent: () => import('./bookmarks/bookmark-list.component')
      .then(m => m.BookmarkListComponent)
  },
  {
    path: 'collections',
    loadChildren: () => import('./collections/collections.routes')
      .then(m => m.COLLECTION_ROUTES)
  }
];

// 2. Use OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class BookmarkCardComponent {
  @Input() bookmark = input.required<Bookmark>();
  
  private cdr = inject(ChangeDetectorRef);
  
  onBookmarkUpdate() {
    // Manually trigger change detection when needed
    this.cdr.markForCheck();
  }
}

// 3. Implement virtual scrolling for large lists
@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="100" class="viewport">
      <div *cdkVirtualFor="let bookmark of bookmarks">
        <app-bookmark-card [bookmark]="bookmark"></app-bookmark-card>
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
export class BookmarkListComponent {
  bookmarks = signal<Bookmark[]>([]);
}

// 4. Add service worker for caching
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
    }
  ],
  "dataGroups": [
    {
      "name": "api-cache",
      "urls": ["/api/**"],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 100,
        "maxAge": "1h"
      }
    }
  ]
}
```

### Issue: Memory Leaks

**Symptoms:**
- Increasing memory usage over time
- Browser tab crashes
- Slow performance after extended use

**Solutions:**

```typescript
// 1. Proper subscription management
@Component({
  template: `...`
})
export class BookmarkListComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    // Use takeUntil to automatically unsubscribe
    this.bookmarkService.getBookmarks()
      .pipe(takeUntil(this.destroy$))
      .subscribe(bookmarks => {
        this.bookmarks.set(bookmarks);
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// 2. Use async pipe when possible
@Component({
  template: `
    <div *ngFor="let bookmark of bookmarks$ | async">
      {{ bookmark.title }}
    </div>
  `
})
export class BookmarkListComponent {
  bookmarks$ = this.bookmarkService.getBookmarks();
}

// 3. Implement proper cleanup in services
@Injectable()
export class WebSocketService implements OnDestroy {
  private socket: WebSocket;
  private reconnectTimer: any;
  
  connect() {
    this.socket = new WebSocket('ws://localhost:3000');
    // ... socket setup
  }
  
  ngOnDestroy() {
    if (this.socket) {
      this.socket.close();
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
  }
}

// 4. Monitor memory usage
@Injectable()
export class PerformanceMonitorService {
  private memoryCheckInterval: any;
  
  startMonitoring() {
    this.memoryCheckInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576),
          total: Math.round(memory.totalJSHeapSize / 1048576),
          limit: Math.round(memory.jsHeapSizeLimit / 1048576)
        });
      }
    }, 30000);
  }
  
  stopMonitoring() {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
    }
  }
}
```

## 🚀 Deployment Issues

### Issue: Docker Build Failures

**Symptoms:**
- Docker build process fails
- Image size too large
- Container startup errors

**Solutions:**

```dockerfile
# Optimized Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build optimization commands
# 1. Use .dockerignore
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
.vscode
EOF

# 2. Multi-stage build for smaller images
docker build --target production -t my-collection:latest .

# 3. Check image size
docker images my-collection:latest

# 4. Analyze image layers
docker history my-collection:latest
```

### Issue: Environment Configuration

**Symptoms:**
- Wrong environment variables in production
- Configuration not loading
- Service connection failures

**Solutions:**

```bash
# 1. Environment-specific configuration
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/my_collection
REDIS_URL=redis://prod-redis:6379
JWT_SECRET=your-production-secret
FRONTEND_URL=https://my-collection.com
BACKEND_URL=https://api.my-collection.com

# 2. Docker Compose for production
version: '3.8'
services:
  app:
    image: my-collection:latest
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - database
      - redis
    
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: my_collection
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:

# 3. Health checks
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Issue: SSL/HTTPS Configuration

**Symptoms:**
- SSL certificate errors
- Mixed content warnings
- HTTPS redirect issues

**Solutions:**

```nginx
# nginx.conf for HTTPS
server {
    listen 80;
    server_name my-collection.com www.my-collection.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name my-collection.com www.my-collection.com;

    ssl_certificate /etc/ssl/certs/my-collection.crt;
    ssl_certificate_key /etc/ssl/private/my-collection.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🛠️ Development Tools

### Debug Scripts

```bash
#!/bin/bash
# debug.sh - Comprehensive debugging script

echo "=== My Collection Debug Information ==="

# System information
echo "System Info:"
echo "OS: $(uname -s)"
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "Angular CLI: $(ng version --skip-git 2>/dev/null | head -1)"

# Project status
echo -e "\nProject Status:"
echo "Current directory: $(pwd)"
echo "Git branch: $(git branch --show-current 2>/dev/null || echo 'Not a git repo')"
echo "Git status: $(git status --porcelain 2>/dev/null | wc -l) modified files"

# Dependencies
echo -e "\nDependency Check:"
npm ls --depth=0 2>/dev/null | grep -E "(WARN|ERR)" || echo "Dependencies OK"

# Environment
echo -e "\nEnvironment Variables:"
env | grep -E "(NODE_ENV|DATABASE_URL|REDIS_URL)" | sed 's/=.*/=***/'

# Ports
echo -e "\nPort Usage:"
lsof -i :3000 2>/dev/null && echo "Port 3000 in use" || echo "Port 3000 available"
lsof -i :4200 2>/dev/null && echo "Port 4200 in use" || echo "Port 4200 available"

# Database
echo -e "\nDatabase Status:"
npm run db:check 2>/dev/null || echo "Database check failed"

# Logs
echo -e "\nRecent Errors:"
tail -n 10 logs/error.log 2>/dev/null || echo "No error logs found"
```

### Performance Monitoring

```typescript
// performance-monitor.service.ts
@Injectable({ providedIn: 'root' })
export class PerformanceMonitorService {
  private metrics: Map<string, number[]> = new Map();

  measureTime<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordMetric(name, end - start);
    return result;
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordMetric(name, end - start);
    return result;
  }

  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1]
    };
  }

  getAllMetrics() {
    const result: Record<string, any> = {};
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name);
    }
    return result;
  }
}
```

---

*Tài liệu này cung cấp hướng dẫn comprehensive về troubleshooting các vấn đề thường gặp trong My Collection project. Để biết thêm chi tiết về specific issues, vui lòng tham khảo logs và documentation tương ứng.*