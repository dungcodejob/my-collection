# Security Best Practices - Backend Security Implementation

## 📋 Tổng quan

Tài liệu này mô tả các thực hành bảo mật tốt nhất cho backend của ứng dụng My Collection sử dụng NestJS, bao gồm authentication, authorization, data validation, và security headers.

## 🔐 Authentication & Authorization

### JWT Authentication Strategy

```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { sub: userId, iat, exp } = payload;
    
    // Check if token is not expired
    if (Date.now() >= exp * 1000) {
      throw new UnauthorizedException('Token expired');
    }
    
    // Verify user still exists and is active
    const user = await this.userService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    
    // Check if token was issued before password change
    if (user.passwordChangedAt && iat < user.passwordChangedAt.getTime() / 1000) {
      throw new UnauthorizedException('Token invalid due to password change');
    }
    
    return user;
  }
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
```

### Refresh Token Implementation

```typescript
// auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    const tokens = await this.generateTokens(user);
    
    // Store refresh token in Redis with expiration
    await this.redisService.setex(
      `refresh_token:${user.id}`,
      this.configService.get<number>('REFRESH_TOKEN_EXPIRES_IN'),
      tokens.refreshToken,
    );
    
    // Log successful login
    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      ip: this.request.ip,
      userAgent: this.request.headers['user-agent'],
    });
    
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
      
      // Verify refresh token exists in Redis
      const storedToken = await this.redisService.get(`refresh_token:${payload.sub}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      const user = await this.userService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }
      
      const tokens = await this.generateTokens(user);
      
      // Update refresh token in Redis
      await this.redisService.setex(
        `refresh_token:${user.id}`,
        this.configService.get<number>('REFRESH_TOKEN_EXPIRES_IN'),
        tokens.refreshToken,
      );
      
      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // Remove refresh token from Redis
    await this.redisService.del(`refresh_token:${userId}`);
    
    // Add access token to blacklist
    const token = this.extractTokenFromRequest();
    if (token) {
      const decoded = this.jwtService.decode(token) as any;
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      
      if (expiresIn > 0) {
        await this.redisService.setex(`blacklist:${token}`, expiresIn, 'true');
      }
    }
    
    await this.auditService.log({
      userId,
      action: 'LOGOUT',
      ip: this.request.ip,
    });
  }

  private async generateTokens(user: User): Promise<Tokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
```

### Role-Based Access Control (RBAC)

```typescript
// auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// auth/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}

// Usage in controller
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles('admin', 'moderator')
  async getUsers() {
    // Only admin and moderator can access
  }

  @Delete('users/:id')
  @Roles('admin')
  async deleteUser(@Param('id') id: string) {
    // Only admin can delete users
  }
}
```

### Resource-Based Authorization

```typescript
// auth/guards/resource.guard.ts
@Injectable()
export class ResourceGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params } = request;
    
    const resourceType = this.reflector.get<string>('resource', context.getHandler());
    const action = this.reflector.get<string>('action', context.getHandler());
    
    if (!resourceType || !action) {
      return true;
    }
    
    return this.checkPermission(user, resourceType, action, params);
  }
  
  private async checkPermission(
    user: User,
    resourceType: string,
    action: string,
    params: any,
  ): Promise<boolean> {
    switch (resourceType) {
      case 'bookmark':
        return this.checkBookmarkPermission(user, action, params.id);
      case 'collection':
        return this.checkCollectionPermission(user, action, params.id);
      default:
        return false;
    }
  }
  
  private async checkBookmarkPermission(
    user: User,
    action: string,
    bookmarkId: string,
  ): Promise<boolean> {
    if (user.role === 'admin') return true;
    
    const bookmark = await this.bookmarkService.findById(bookmarkId);
    if (!bookmark) return false;
    
    switch (action) {
      case 'read':
        return bookmark.userId === user.id || bookmark.isPublic;
      case 'write':
      case 'delete':
        return bookmark.userId === user.id;
      default:
        return false;
    }
  }
}

// Decorators for resource authorization
export const Resource = (resource: string) => SetMetadata('resource', resource);
export const Action = (action: string) => SetMetadata('action', action);

// Usage
@Controller('bookmarks')
@UseGuards(JwtAuthGuard, ResourceGuard)
export class BookmarkController {
  @Get(':id')
  @Resource('bookmark')
  @Action('read')
  async getBookmark(@Param('id') id: string) {
    // User can read their own bookmarks or public bookmarks
  }

  @Put(':id')
  @Resource('bookmark')
  @Action('write')
  async updateBookmark(@Param('id') id: string, @Body() updateDto: UpdateBookmarkDto) {
    // User can only update their own bookmarks
  }
}
```

## 🛡️ Input Validation & Sanitization

### Advanced Validation Pipes

```typescript
// common/pipes/validation.pipe.ts
@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error for unknown properties
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = this.extractErrorMessages(errors);
        return new BadRequestException({
          message: 'Validation failed',
          errors: messages,
        });
      },
    });
  }

  private extractErrorMessages(errors: ValidationError[]): any {
    return errors.reduce((acc, error) => {
      if (error.constraints) {
        acc[error.property] = Object.values(error.constraints);
      }
      if (error.children && error.children.length > 0) {
        acc[error.property] = this.extractErrorMessages(error.children);
      }
      return acc;
    }, {});
  }
}
```

### Custom Validators

```typescript
// common/validators/custom.validators.ts
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
          const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return strongPasswordRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character';
        },
      },
    });
  };
}

export function IsNotProfane(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotProfane',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return true;
          
          // Simple profanity check (in production, use a proper library)
          const profaneWords = ['spam', 'abuse', 'inappropriate'];
          const lowerValue = value.toLowerCase();
          
          return !profaneWords.some(word => lowerValue.includes(word));
        },
        defaultMessage(args: ValidationArguments) {
          return 'Content contains inappropriate language';
        },
      },
    });
  };
}

// Usage in DTOs
export class CreateBookmarkDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  @IsNotProfane()
  title: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  @IsNotProfane()
  description?: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsStrongPassword()
  newPassword: string;
}
```

### HTML Sanitization

```typescript
// common/pipes/sanitize.pipe.ts
import { Injectable, PipeTransform } from '@nestjs/common';
import * as DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any): any {
    if (typeof value === 'string') {
      return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
        ALLOWED_ATTR: ['href'],
        ALLOW_DATA_ATTR: false,
      });
    }
    
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }
    
    return value;
  }

  private sanitizeObject(obj: any): any {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = DOMPurify.sanitize(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

// Usage
@Post()
async createBookmark(@Body(SanitizePipe) createBookmarkDto: CreateBookmarkDto) {
  return this.bookmarkService.create(createBookmarkDto);
}
```

## 🔒 Data Protection

### Encryption Service

```typescript
// common/services/encryption.service.ts
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  constructor(private configService: ConfigService) {}

  encrypt(text: string): string {
    const key = Buffer.from(this.configService.get<string>('ENCRYPTION_KEY'), 'hex');
    const iv = crypto.randomBytes(this.ivLength);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, tagHex, encrypted] = encryptedText.split(':');
    
    const key = Buffer.from(this.configService.get<string>('ENCRYPTION_KEY'), 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  compareHash(text: string, hash: string): boolean {
    return this.hash(text) === hash;
  }
}
```

### Sensitive Data Handling

```typescript
// user/entities/user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // Exclude from serialization
  password: string;

  @Column({ nullable: true })
  @Transform(({ value }) => value ? '***' : null) // Mask sensitive data
  phoneNumber?: string;

  @Column({ type: 'text', nullable: true })
  @Transform(({ value }) => value ? this.encryptionService.encrypt(value) : null)
  personalNotes?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

// Custom transformer for encrypted fields
export class EncryptedTransformer implements ValueTransformer {
  constructor(private encryptionService: EncryptionService) {}

  to(value: string): string {
    return value ? this.encryptionService.encrypt(value) : value;
  }

  from(value: string): string {
    return value ? this.encryptionService.decrypt(value) : value;
  }
}
```

## 🌐 Security Headers & CORS

### Security Headers Middleware

```typescript
// common/middleware/security.middleware.ts
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://www.google-analytics.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.example.com;"
    );

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Strict Transport Security
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );

    next();
  }
}

// Apply middleware globally
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
```

### CORS Configuration

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:4200',
        'https://my-collection.example.com',
        'https://staging.my-collection.example.com',
      ];

      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  await app.listen(3000);
}
```

## 🚫 Rate Limiting & DDoS Protection

### Rate Limiting

```typescript
// common/guards/rate-limit.guard.ts
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = this.getKey(request);
    
    const limit = this.getLimit(context);
    const window = this.getWindow(context);
    
    const current = await this.redisService.incr(key);
    
    if (current === 1) {
      await this.redisService.expire(key, window);
    }
    
    if (current > limit) {
      throw new ThrottlerException('Rate limit exceeded');
    }
    
    return true;
  }

  private getKey(request: Request): string {
    const ip = request.ip;
    const userId = request.user?.id || 'anonymous';
    const endpoint = request.route?.path || request.url;
    
    return `rate_limit:${ip}:${userId}:${endpoint}`;
  }

  private getLimit(context: ExecutionContext): number {
    const reflector = new Reflector();
    return reflector.get<number>('rateLimit', context.getHandler()) || 100;
  }

  private getWindow(context: ExecutionContext): number {
    const reflector = new Reflector();
    return reflector.get<number>('rateLimitWindow', context.getHandler()) || 3600;
  }
}

// Decorators
export const RateLimit = (limit: number) => SetMetadata('rateLimit', limit);
export const RateLimitWindow = (window: number) => SetMetadata('rateLimitWindow', window);

// Usage
@Controller('auth')
export class AuthController {
  @Post('login')
  @RateLimit(5) // 5 attempts
  @RateLimitWindow(900) // per 15 minutes
  @UseGuards(RateLimitGuard)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

### Advanced DDoS Protection

```typescript
// common/guards/ddos-protection.guard.ts
@Injectable()
export class DDoSProtectionGuard implements CanActivate {
  private readonly suspiciousIPs = new Set<string>();
  
  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    
    // Check if IP is in blacklist
    const isBlacklisted = await this.redisService.get(`blacklist:${ip}`);
    if (isBlacklisted) {
      throw new ForbiddenException('IP address is blacklisted');
    }
    
    // Check request patterns
    await this.analyzeRequestPattern(ip, request);
    
    // Check if IP is suspicious
    if (this.suspiciousIPs.has(ip)) {
      await this.handleSuspiciousIP(ip);
    }
    
    return true;
  }

  private async analyzeRequestPattern(ip: string, request: Request) {
    const key = `request_pattern:${ip}`;
    const window = 60; // 1 minute
    
    // Track request frequency
    const requestCount = await this.redisService.incr(`${key}:count`);
    if (requestCount === 1) {
      await this.redisService.expire(`${key}:count`, window);
    }
    
    // Track unique endpoints
    await this.redisService.sadd(`${key}:endpoints`, request.url);
    await this.redisService.expire(`${key}:endpoints`, window);
    
    const uniqueEndpoints = await this.redisService.scard(`${key}:endpoints`);
    
    // Detect suspicious patterns
    if (requestCount > 100 || uniqueEndpoints > 20) {
      this.suspiciousIPs.add(ip);
      
      // Log suspicious activity
      console.warn(`Suspicious activity detected from IP: ${ip}`, {
        requestCount,
        uniqueEndpoints,
        userAgent: request.headers['user-agent'],
      });
    }
  }

  private async handleSuspiciousIP(ip: string) {
    // Temporary blacklist for 1 hour
    await this.redisService.setex(`blacklist:${ip}`, 3600, 'true');
    
    // Remove from suspicious set
    this.suspiciousIPs.delete(ip);
    
    // Notify administrators
    await this.notifyAdmins(ip);
  }

  private async notifyAdmins(ip: string) {
    // Send notification to admin dashboard or email
    console.log(`IP ${ip} has been temporarily blacklisted due to suspicious activity`);
  }
}
```

## 🔍 Security Auditing

### Audit Logging

```typescript
// audit/audit.service.ts
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(auditData: CreateAuditLogDto): Promise<void> {
    const auditLog = this.auditRepository.create({
      ...auditData,
      timestamp: new Date(),
      sessionId: this.generateSessionId(),
    });

    await this.auditRepository.save(auditLog);
    
    // Also log to external service for compliance
    await this.logToExternalService(auditLog);
  }

  async getAuditTrail(filters: AuditFilters): Promise<AuditLog[]> {
    const query = this.auditRepository.createQueryBuilder('audit');
    
    if (filters.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }
    
    if (filters.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }
    
    if (filters.startDate) {
      query.andWhere('audit.timestamp >= :startDate', { startDate: filters.startDate });
    }
    
    if (filters.endDate) {
      query.andWhere('audit.timestamp <= :endDate', { endDate: filters.endDate });
    }
    
    return query
      .orderBy('audit.timestamp', 'DESC')
      .limit(filters.limit || 100)
      .getMany();
  }

  private generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private async logToExternalService(auditLog: AuditLog): Promise<void> {
    // Send to external logging service (e.g., Splunk, ELK Stack)
    try {
      await this.httpService.post('https://logging-service.example.com/audit', auditLog);
    } catch (error) {
      console.error('Failed to log to external service:', error);
    }
  }
}

// Audit decorator
export function Audit(action: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const auditService = this.auditService || this.moduleRef.get(AuditService);
      const request = this.request;
      
      try {
        const result = await method.apply(this, args);
        
        await auditService.log({
          userId: request.user?.id,
          action,
          resource: target.constructor.name,
          details: { args: this.sanitizeArgs(args) },
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          success: true,
        });
        
        return result;
      } catch (error) {
        await auditService.log({
          userId: request.user?.id,
          action,
          resource: target.constructor.name,
          details: { args: this.sanitizeArgs(args), error: error.message },
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          success: false,
        });
        
        throw error;
      }
    };
  };
}

// Usage
@Controller('bookmarks')
export class BookmarkController {
  @Delete(':id')
  @Audit('DELETE_BOOKMARK')
  async deleteBookmark(@Param('id') id: string) {
    return this.bookmarkService.delete(id);
  }
}
```

### Security Monitoring

```typescript
// security/security-monitor.service.ts
@Injectable()
export class SecurityMonitorService {
  private readonly alerts = new Map<string, number>();
  
  constructor(
    private redisService: RedisService,
    private notificationService: NotificationService,
  ) {
    this.startMonitoring();
  }

  private startMonitoring() {
    // Monitor failed login attempts
    setInterval(() => this.checkFailedLogins(), 60000); // Every minute
    
    // Monitor suspicious activities
    setInterval(() => this.checkSuspiciousActivities(), 300000); // Every 5 minutes
    
    // Monitor system health
    setInterval(() => this.checkSystemHealth(), 600000); // Every 10 minutes
  }

  private async checkFailedLogins() {
    const failedLogins = await this.redisService.keys('failed_login:*');
    
    for (const key of failedLogins) {
      const attempts = await this.redisService.get(key);
      const ip = key.split(':')[1];
      
      if (parseInt(attempts) >= 10) {
        await this.handleSecurityAlert('MULTIPLE_FAILED_LOGINS', {
          ip,
          attempts: parseInt(attempts),
        });
      }
    }
  }

  private async checkSuspiciousActivities() {
    // Check for unusual patterns
    const patterns = await this.analyzeUserBehavior();
    
    for (const pattern of patterns) {
      if (pattern.riskScore > 0.8) {
        await this.handleSecurityAlert('SUSPICIOUS_BEHAVIOR', pattern);
      }
    }
  }

  private async checkSystemHealth() {
    const metrics = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      activeConnections: await this.getActiveConnections(),
    };

    // Check for resource exhaustion attacks
    if (metrics.memoryUsage.heapUsed > 1024 * 1024 * 1024) { // 1GB
      await this.handleSecurityAlert('HIGH_MEMORY_USAGE', metrics);
    }
  }

  private async handleSecurityAlert(type: string, data: any) {
    const alertKey = `alert:${type}`;
    const count = this.alerts.get(alertKey) || 0;
    
    // Prevent alert spam
    if (count > 5) return;
    
    this.alerts.set(alertKey, count + 1);
    
    // Send alert
    await this.notificationService.sendSecurityAlert({
      type,
      data,
      timestamp: new Date(),
      severity: this.getSeverity(type),
    });
    
    // Reset alert count after 1 hour
    setTimeout(() => {
      this.alerts.delete(alertKey);
    }, 3600000);
  }

  private getSeverity(type: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap = {
      MULTIPLE_FAILED_LOGINS: 'medium',
      SUSPICIOUS_BEHAVIOR: 'high',
      HIGH_MEMORY_USAGE: 'critical',
    };
    
    return severityMap[type] || 'low';
  }

  private async analyzeUserBehavior(): Promise<any[]> {
    // Implement behavior analysis logic
    // This could include ML models for anomaly detection
    return [];
  }

  private async getActiveConnections(): Promise<number> {
    // Get active database/Redis connections
    return 0;
  }
}
```

---

**Cập nhật lần cuối**: 2024-12-19  
**Phiên bản**: 1.0.0  
**Tác giả**: My Collection Team