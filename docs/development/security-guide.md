# Security Guide - Hướng dẫn bảo mật

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Authentication & Authorization](#authentication--authorization)
3. [Frontend Security](#frontend-security)
4. [Backend Security](#backend-security)
5. [Database Security](#database-security)
6. [API Security](#api-security)
7. [Infrastructure Security](#infrastructure-security)
8. [Security Testing](#security-testing)
9. [Incident Response](#incident-response)
10. [Compliance](#compliance)

## 🛡️ Tổng quan

Tài liệu này cung cấp hướng dẫn comprehensive về security implementation cho ứng dụng My Collection, covering tất cả layers từ frontend đến infrastructure.

### Security Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Principle of Least Privilege**: Minimum necessary access rights
3. **Zero Trust**: Never trust, always verify
4. **Security by Design**: Security integrated from the beginning
5. **Continuous Monitoring**: Real-time threat detection

### Security Framework

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                       │
├─────────────────────────────────────────────────────────┤
│  Frontend Security (CSP, XSS Protection, CSRF)         │
├─────────────────────────────────────────────────────────┤
│  API Gateway (Rate Limiting, Authentication)           │
├─────────────────────────────────────────────────────────┤
│  Application Security (Authorization, Validation)      │
├─────────────────────────────────────────────────────────┤
│  Database Security (Encryption, Access Control)        │
├─────────────────────────────────────────────────────────┤
│  Infrastructure Security (Network, OS, Container)      │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Authentication & Authorization

### 1. JWT Implementation

#### Secure JWT Configuration

```typescript
// auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      algorithms: ['HS256'], // Specify algorithm explicitly
    });
  }

  async validate(payload: any) {
    // Validate payload structure
    if (!payload.sub || !payload.email || !payload.iat || !payload.exp) {
      throw new UnauthorizedException('Invalid token structure');
    }

    // Check token age (additional security)
    const tokenAge = Date.now() / 1000 - payload.iat;
    const maxAge = this.configService.get<number>('JWT_MAX_AGE', 86400); // 24 hours
    
    if (tokenAge > maxAge) {
      throw new UnauthorizedException('Token too old');
    }

    // Verify user still exists and is active
    const user = await this.userService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Check if user's password was changed after token issuance
    if (user.passwordChangedAt && user.passwordChangedAt.getTime() / 1000 > payload.iat) {
      throw new UnauthorizedException('Token invalidated by password change');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: user.permissions
    };
  }
}
```

#### Token Refresh Security

```typescript
// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService
  ) {}

  async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };

    // Generate access token (short-lived)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
      issuer: this.configService.get<string>('JWT_ISSUER'),
      audience: this.configService.get<string>('JWT_AUDIENCE')
    });

    // Generate refresh token (long-lived, cryptographically secure)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    
    // Store refresh token in Redis with expiration
    const refreshTokenKey = `refresh_token:${user.id}:${refreshToken}`;
    const refreshTokenExpiry = this.configService.get<number>('JWT_REFRESH_EXPIRATION', 604800); // 7 days
    
    await this.redisService.setex(refreshTokenKey, refreshTokenExpiry, JSON.stringify({
      userId: user.id,
      createdAt: new Date().toISOString(),
      userAgent: 'user-agent-here', // Store for security tracking
      ipAddress: 'ip-address-here'
    }));

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string, userAgent: string, ipAddress: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Find refresh token in Redis
    const keys = await this.redisService.keys(`refresh_token:*:${refreshToken}`);
    
    if (keys.length === 0) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenData = await this.redisService.get(keys[0]);
    if (!tokenData) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const parsedData = JSON.parse(tokenData);
    
    // Security checks
    if (parsedData.userAgent !== userAgent || parsedData.ipAddress !== ipAddress) {
      // Potential token theft - invalidate all user sessions
      await this.invalidateAllUserSessions(parsedData.userId);
      throw new UnauthorizedException('Security violation detected');
    }

    // Get user and generate new tokens
    const user = await this.userService.findById(parsedData.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Delete old refresh token
    await this.redisService.del(keys[0]);

    // Generate new token pair
    return this.generateTokens(user);
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    const keys = await this.redisService.keys(`refresh_token:${userId}:*`);
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }
}
```

### 2. Role-Based Access Control (RBAC)

```typescript
// auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export enum Role {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from './roles.decorator';

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
    
    // Check if user has required role
    const hasRole = requiredRoles.some((role) => user.role === role);
    
    // Admin has access to everything
    const isAdmin = user.role === Role.ADMIN;
    
    return hasRole || isAdmin;
  }
}

// Usage in controller
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getUsers() {
    // Only admin and moderator can access
  }
  
  @Delete('users/:id')
  @Roles(Role.ADMIN)
  async deleteUser(@Param('id') id: string) {
    // Only admin can delete users
  }
}
```

### 3. Permission-Based Access Control

```typescript
// auth/permissions.decorator.ts
export enum Permission {
  READ_BOOKMARKS = 'read:bookmarks',
  WRITE_BOOKMARKS = 'write:bookmarks',
  DELETE_BOOKMARKS = 'delete:bookmarks',
  MANAGE_USERS = 'manage:users',
  VIEW_ANALYTICS = 'view:analytics'
}

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

// auth/permissions.guard.ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    return requiredPermissions.every(permission => 
      user.permissions?.includes(permission)
    );
  }
}
```

## 🌐 Frontend Security

### 1. Content Security Policy (CSP)

```typescript
// security/csp.config.ts
export const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Only for development
      "https://cdn.jsdelivr.net",
      "https://unpkg.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
      "https://cdn.jsdelivr.net"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "data:"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "blob:"
    ],
    connectSrc: [
      "'self'",
      "https://api.my-collection.com",
      "wss://api.my-collection.com"
    ],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: []
  }
};

// main.ts (NestJS)
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: cspConfig,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 2. XSS Protection

```typescript
// shared/pipes/sanitize.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Pipe({
  name: 'sanitizeHtml',
  standalone: true
})
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    // Configure DOMPurify
    const cleanHtml = DOMPurify.sanitize(value, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
      ALLOW_DATA_ATTR: false
    });
    
    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }
}

// Usage in template
<div [innerHTML]="userContent | sanitizeHtml"></div>
```

### 3. CSRF Protection

```typescript
// security/csrf.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Get CSRF token from meta tag or cookie
    const csrfToken = this.getCsrfToken();
    
    if (csrfToken && this.isModifyingRequest(req)) {
      const csrfReq = req.clone({
        headers: req.headers.set('X-CSRF-Token', csrfToken)
      });
      return next.handle(csrfReq);
    }
    
    return next.handle(req);
  }
  
  private getCsrfToken(): string | null {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : null;
  }
  
  private isModifyingRequest(req: HttpRequest<any>): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  }
}
```

### 4. Secure Storage

```typescript
// core/services/secure-storage.service.ts
import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private readonly encryptionKey = 'your-encryption-key'; // Should come from environment

  setItem(key: string, value: any, encrypt: boolean = true): void {
    try {
      const stringValue = JSON.stringify(value);
      const finalValue = encrypt ? this.encrypt(stringValue) : stringValue;
      
      // Use sessionStorage for sensitive data, localStorage for non-sensitive
      const storage = encrypt ? sessionStorage : localStorage;
      storage.setItem(key, finalValue);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  getItem<T>(key: string, encrypted: boolean = true): T | null {
    try {
      const storage = encrypted ? sessionStorage : localStorage;
      const value = storage.getItem(key);
      
      if (!value) return null;
      
      const decryptedValue = encrypted ? this.decrypt(value) : value;
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
    localStorage.clear();
  }

  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
  }

  private decrypt(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
```

## 🔒 Backend Security

### 1. Input Validation & Sanitization

```typescript
// validation/validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Sanitize input
    const sanitizedValue = this.sanitizeInput(value);
    
    // Transform and validate
    const object = plainToClass(metatype, sanitizedValue);
    const errors = await validate(object, {
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      transform: true
    });

    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private sanitizeInput(value: any): any {
    if (typeof value === 'string') {
      // Create DOM for DOMPurify
      const window = new JSDOM('').window;
      const purify = DOMPurify(window);
      
      return purify.sanitize(value, { ALLOWED_TAGS: [] }); // Strip all HTML
    }
    
    if (typeof value === 'object' && value !== null) {
      const sanitized = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeInput(value[key]);
        }
      }
      return sanitized;
    }
    
    return value;
  }
}
```

### 2. SQL Injection Prevention

```typescript
// repositories/secure-bookmark.repository.ts
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';

@Injectable()
export class SecureBookmarkRepository {
  constructor(
    @InjectRepository(Bookmark)
    private readonly repository: Repository<Bookmark>
  ) {}

  async findWithSecureSearch(
    userId: string,
    searchTerm: string,
    tags: string[],
    page: number,
    limit: number
  ): Promise<{ data: Bookmark[]; total: number }> {
    // Use parameterized queries to prevent SQL injection
    const queryBuilder = this.repository
      .createQueryBuilder('bookmark')
      .leftJoinAndSelect('bookmark.tags', 'tag')
      .where('bookmark.userId = :userId', { userId });

    // Secure search implementation
    if (searchTerm) {
      // Escape special characters for LIKE query
      const escapedSearch = searchTerm.replace(/[%_]/g, '\\$&');
      queryBuilder.andWhere(
        '(bookmark.title ILIKE :search OR bookmark.description ILIKE :search)',
        { search: `%${escapedSearch}%` }
      );
    }

    // Secure tag filtering
    if (tags && tags.length > 0) {
      // Validate tag names (alphanumeric + hyphen only)
      const validTags = tags.filter(tag => /^[a-zA-Z0-9-]+$/.test(tag));
      
      if (validTags.length > 0) {
        queryBuilder.andWhere('tag.name IN (:...tags)', { tags: validTags });
      }
    }

    // Secure pagination
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit))); // Max 100 items
    const offset = (validPage - 1) * validLimit;

    queryBuilder
      .orderBy('bookmark.createdAt', 'DESC')
      .skip(offset)
      .take(validLimit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findByIdSecure(id: string, userId: string): Promise<Bookmark | null> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      return null;
    }

    return this.repository.findOne({
      where: { id, userId },
      relations: ['tags', 'collection']
    });
  }
}
```

### 3. Rate Limiting

```typescript
// security/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis/redis.service';

export const RATE_LIMIT_KEY = 'rate_limit';
export const RateLimit = (requests: number, windowMs: number) =>
  SetMetadata(RATE_LIMIT_KEY, { requests, windowMs });

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitConfig = this.reflector.get<{ requests: number; windowMs: number }>(
      RATE_LIMIT_KEY,
      context.getHandler()
    );

    if (!rateLimitConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const key = this.generateKey(request, context);
    
    const current = await this.redisService.incr(key);
    
    if (current === 1) {
      await this.redisService.expire(key, Math.ceil(rateLimitConfig.windowMs / 1000));
    }

    if (current > rateLimitConfig.requests) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests',
          retryAfter: await this.redisService.ttl(key)
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }

  private generateKey(request: any, context: ExecutionContext): string {
    const ip = request.ip || request.connection.remoteAddress;
    const userId = request.user?.id || 'anonymous';
    const endpoint = `${request.method}:${request.route?.path || request.url}`;
    
    return `rate_limit:${ip}:${userId}:${endpoint}`;
  }
}

// Usage
@Controller('auth')
export class AuthController {
  @Post('login')
  @RateLimit(5, 15 * 60 * 1000) // 5 requests per 15 minutes
  @UseGuards(RateLimitGuard)
  async login(@Body() loginDto: LoginDto) {
    // Login logic
  }
}
```

### 4. Security Headers

```typescript
// security/security.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    res.setHeader('Server', 'MyCollection');
    
    // HSTS (only in production with HTTPS)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    next();
  }
}
```

## 🗄️ Database Security

### 1. Encryption at Rest

```typescript
// entities/user.entity.ts
import { Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Entity('users')
export class User {
  @Column()
  email: string;

  @Column({ select: false }) // Don't select password by default
  password: string;

  @Column({ type: 'text', nullable: true })
  encryptedData: string; // For sensitive user data

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  encryptSensitiveData(data: any): void {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    this.encryptedData = JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });
  }

  decryptSensitiveData(): any {
    if (!this.encryptedData) return null;
    
    const { encrypted, iv, authTag } = JSON.parse(this.encryptedData);
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}
```

### 2. Database Connection Security

```typescript
// database/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  
  // SSL configuration
  ssl: configService.get('NODE_ENV') === 'production' ? {
    rejectUnauthorized: true,
    ca: configService.get('DB_SSL_CA'),
    cert: configService.get('DB_SSL_CERT'),
    key: configService.get('DB_SSL_KEY')
  } : false,
  
  // Connection pool security
  extra: {
    max: 20, // Maximum connections
    min: 5,  // Minimum connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    
    // Additional security options
    application_name: 'my-collection-api',
    statement_timeout: 30000, // 30 seconds
    query_timeout: 30000,
    
    // Prevent connection string injection
    options: '-c default_transaction_isolation=read_committed'
  },
  
  // Logging (disable in production)
  logging: configService.get('NODE_ENV') !== 'production',
  
  // Migration security
  migrationsRun: false, // Run migrations manually
  synchronize: false,   // Never auto-sync in production
  
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}']
});
```

## 🔐 API Security

### 1. API Key Management

```typescript
// auth/api-key.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    
    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    // Validate API key format
    if (!this.isValidApiKeyFormat(apiKey)) {
      throw new UnauthorizedException('Invalid API key format');
    }

    // Check if API key exists and is active
    const keyData = await this.redisService.get(`api_key:${apiKey}`);
    if (!keyData) {
      throw new UnauthorizedException('Invalid API key');
    }

    const parsedKeyData = JSON.parse(keyData);
    
    // Check expiration
    if (parsedKeyData.expiresAt && new Date() > new Date(parsedKeyData.expiresAt)) {
      throw new UnauthorizedException('API key expired');
    }

    // Check rate limits
    await this.checkApiKeyRateLimit(apiKey, parsedKeyData.rateLimit);

    // Add key info to request
    request.apiKey = parsedKeyData;
    
    return true;
  }

  private isValidApiKeyFormat(apiKey: string): boolean {
    // API key format: prefix_randomstring (e.g., mc_1234567890abcdef)
    return /^mc_[a-zA-Z0-9]{32}$/.test(apiKey);
  }

  private async checkApiKeyRateLimit(apiKey: string, rateLimit: any): Promise<void> {
    if (!rateLimit) return;

    const key = `api_rate_limit:${apiKey}`;
    const current = await this.redisService.incr(key);
    
    if (current === 1) {
      await this.redisService.expire(key, rateLimit.windowSeconds);
    }

    if (current > rateLimit.requests) {
      throw new UnauthorizedException('API rate limit exceeded');
    }
  }
}
```

### 2. Request Signing

```typescript
// auth/request-signature.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class RequestSignatureGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    const signature = request.headers['x-signature'];
    const timestamp = request.headers['x-timestamp'];
    const apiKey = request.headers['x-api-key'];
    
    if (!signature || !timestamp || !apiKey) {
      throw new UnauthorizedException('Missing required headers for signature verification');
    }

    // Check timestamp (prevent replay attacks)
    const requestTime = parseInt(timestamp);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(currentTime - requestTime);
    
    if (timeDiff > 300) { // 5 minutes tolerance
      throw new UnauthorizedException('Request timestamp too old');
    }

    // Get API secret for the key
    const apiSecret = await this.getApiSecret(apiKey);
    if (!apiSecret) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Verify signature
    const expectedSignature = this.generateSignature(
      request.method,
      request.url,
      request.body,
      timestamp,
      apiSecret
    );

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }

  private generateSignature(
    method: string,
    url: string,
    body: any,
    timestamp: string,
    secret: string
  ): string {
    const payload = `${method}${url}${JSON.stringify(body || {})}${timestamp}`;
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  private async getApiSecret(apiKey: string): Promise<string | null> {
    // Retrieve API secret from secure storage
    // Implementation depends on your storage solution
    return 'api-secret-for-key';
  }
}
```

## 🧪 Security Testing

### 1. Automated Security Tests

```typescript
// security/security.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Authentication Security', () => {
    it('should reject requests without authentication', async () => {
      return request(app.getHttpServer())
        .get('/api/bookmarks')
        .expect(401);
    });

    it('should reject invalid JWT tokens', async () => {
      return request(app.getHttpServer())
        .get('/api/bookmarks')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject expired JWT tokens', async () => {
      const expiredToken = 'expired-jwt-token';
      return request(app.getHttpServer())
        .get('/api/bookmarks')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('Input Validation Security', () => {
    it('should sanitize HTML input', async () => {
      const maliciousInput = {
        title: '<script>alert("xss")</script>Test Title',
        description: '<img src=x onerror=alert("xss")>Description'
      };

      const response = await request(app.getHttpServer())
        .post('/api/bookmarks')
        .set('Authorization', 'Bearer valid-token')
        .send(maliciousInput)
        .expect(201);

      expect(response.body.title).not.toContain('<script>');
      expect(response.body.description).not.toContain('<img');
    });

    it('should prevent SQL injection', async () => {
      const sqlInjection = "'; DROP TABLE bookmarks; --";
      
      return request(app.getHttpServer())
        .get('/api/bookmarks')
        .query({ search: sqlInjection })
        .set('Authorization', 'Bearer valid-token')
        .expect(200); // Should not crash
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password' })
      );

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);
      
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });
});
```

### 2. Penetration Testing Checklist

```markdown
# Security Testing Checklist

## Authentication & Authorization
- [ ] Test JWT token validation
- [ ] Test token expiration handling
- [ ] Test refresh token security
- [ ] Test role-based access control
- [ ] Test permission-based access control
- [ ] Test session management
- [ ] Test password policies
- [ ] Test account lockout mechanisms

## Input Validation
- [ ] Test XSS prevention
- [ ] Test SQL injection prevention
- [ ] Test CSRF protection
- [ ] Test file upload security
- [ ] Test parameter pollution
- [ ] Test input length limits
- [ ] Test special character handling

## API Security
- [ ] Test rate limiting
- [ ] Test API key validation
- [ ] Test request signing
- [ ] Test CORS configuration
- [ ] Test HTTP methods allowed
- [ ] Test error message information disclosure

## Infrastructure Security
- [ ] Test HTTPS enforcement
- [ ] Test security headers
- [ ] Test server information disclosure
- [ ] Test directory traversal
- [ ] Test file inclusion vulnerabilities
- [ ] Test dependency vulnerabilities
```

## 🚨 Incident Response

### 1. Security Incident Detection

```typescript
// security/incident-detector.service.ts
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface SecurityIncident {
  type: 'brute_force' | 'sql_injection' | 'xss_attempt' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  details: any;
  timestamp: Date;
}

@Injectable()
export class IncidentDetectorService {
  constructor(private eventEmitter: EventEmitter2) {}

  detectBruteForce(ip: string, failedAttempts: number): void {
    if (failedAttempts >= 5) {
      this.reportIncident({
        type: 'brute_force',
        severity: failedAttempts >= 10 ? 'high' : 'medium',
        source: ip,
        details: { failedAttempts },
        timestamp: new Date()
      });
    }
  }

  detectSqlInjection(query: string, ip: string): void {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
      /(UNION\s+SELECT)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(--|\#|\/\*)/
    ];

    if (sqlPatterns.some(pattern => pattern.test(query))) {
      this.reportIncident({
        type: 'sql_injection',
        severity: 'high',
        source: ip,
        details: { query },
        timestamp: new Date()
      });
    }
  }

  detectXssAttempt(input: string, ip: string): void {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i
    ];

    if (xssPatterns.some(pattern => pattern.test(input))) {
      this.reportIncident({
        type: 'xss_attempt',
        severity: 'medium',
        source: ip,
        details: { input },
        timestamp: new Date()
      });
    }
  }

  private reportIncident(incident: SecurityIncident): void {
    // Log incident
    console.error('Security Incident Detected:', incident);
    
    // Emit event for other services to handle
    this.eventEmitter.emit('security.incident', incident);
    
    // Send to monitoring service
    this.sendToMonitoring(incident);
  }

  private sendToMonitoring(incident: SecurityIncident): void {
    // Send to external monitoring service (Sentry, DataDog, etc.)
    // Implementation depends on your monitoring solution
  }
}
```

### 2. Automated Response

```typescript
// security/incident-response.service.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from '../redis/redis.service';
import { SecurityIncident } from './incident-detector.service';

@Injectable()
export class IncidentResponseService {
  constructor(private redisService: RedisService) {}

  @OnEvent('security.incident')
  async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    switch (incident.type) {
      case 'brute_force':
        await this.handleBruteForce(incident);
        break;
      case 'sql_injection':
        await this.handleSqlInjection(incident);
        break;
      case 'xss_attempt':
        await this.handleXssAttempt(incident);
        break;
      case 'unauthorized_access':
        await this.handleUnauthorizedAccess(incident);
        break;
    }
  }

  private async handleBruteForce(incident: SecurityIncident): Promise<void> {
    // Temporarily block IP
    const blockDuration = incident.severity === 'high' ? 3600 : 1800; // 1 hour or 30 minutes
    await this.redisService.setex(`blocked_ip:${incident.source}`, blockDuration, 'brute_force');
    
    // Alert security team
    await this.alertSecurityTeam(incident);
  }

  private async handleSqlInjection(incident: SecurityIncident): Promise<void> {
    // Immediately block IP
    await this.redisService.setex(`blocked_ip:${incident.source}`, 7200, 'sql_injection'); // 2 hours
    
    // Alert security team immediately
    await this.alertSecurityTeam(incident, true);
  }

  private async handleXssAttempt(incident: SecurityIncident): Promise<void> {
    // Log for analysis
    await this.logForAnalysis(incident);
    
    // Increase monitoring for this IP
    await this.redisService.setex(`monitor_ip:${incident.source}`, 3600, 'xss_attempt');
  }

  private async handleUnauthorizedAccess(incident: SecurityIncident): Promise<void> {
    // Block IP and alert
    await this.redisService.setex(`blocked_ip:${incident.source}`, 3600, 'unauthorized_access');
    await this.alertSecurityTeam(incident);
  }

  private async alertSecurityTeam(incident: SecurityIncident, urgent: boolean = false): Promise<void> {
    // Send alert to security team
    // Implementation depends on your alerting system (Slack, email, PagerDuty, etc.)
    console.log(`${urgent ? 'URGENT ' : ''}Security Alert:`, incident);
  }

  private async logForAnalysis(incident: SecurityIncident): Promise<void> {
    // Store incident for later analysis
    const key = `security_log:${Date.now()}`;
    await this.redisService.setex(key, 86400 * 7, JSON.stringify(incident)); // Keep for 7 days
  }
}
```

## 📋 Security Checklist

### Development Phase
- [ ] Implement secure authentication (JWT with proper expiration)
- [ ] Add input validation and sanitization
- [ ] Implement RBAC/PBAC
- [ ] Add rate limiting
- [ ] Configure security headers
- [ ] Implement CSRF protection
- [ ] Add XSS protection
- [ ] Secure database queries (parameterized)
- [ ] Implement proper error handling
- [ ] Add security logging

### Testing Phase
- [ ] Run automated security tests
- [ ] Perform manual penetration testing
- [ ] Test authentication flows
- [ ] Validate input sanitization
- [ ] Test rate limiting
- [ ] Verify security headers
- [ ] Test error handling
- [ ] Validate access controls

### Deployment Phase
- [ ] Enable HTTPS/TLS
- [ ] Configure WAF rules
- [ ] Set up monitoring and alerting
- [ ] Configure backup and recovery
- [ ] Implement incident response procedures
- [ ] Set up security scanning
- [ ] Configure log aggregation
- [ ] Enable audit logging

### Maintenance Phase
- [ ] Regular security updates
- [ ] Dependency vulnerability scanning
- [ ] Security audit reviews
- [ ] Incident response testing
- [ ] Security training for team
- [ ] Compliance reviews
- [ ] Backup testing
- [ ] Security metrics monitoring

---

*Tài liệu này cung cấp comprehensive security guidelines cho My Collection. Security là ongoing process - thường xuyên review và update based on latest threats và best practices.*