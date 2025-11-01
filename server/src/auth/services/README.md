# 🔒 BacklistService Documentation

## 📋 Overview

`BacklistService` là một service quan trọng trong hệ thống authentication, chịu trách nhiệm quản lý blacklist của tokens và users để đảm bảo bảo mật. Service này sử dụng Redis cache để lưu trữ và kiểm tra trạng thái blacklist với hiệu suất cao.

## 🎯 Main Features

- ✅ **Token Blacklisting**: Blacklist tokens cụ thể
- ✅ **Session Blacklisting**: Blacklist toàn bộ session
- ✅ **User Blacklisting**: Blacklist tất cả sessions của user
- ✅ **TTL Management**: Tự động expire blacklist entries
- ✅ **High Performance**: Sử dụng Redis cache với parallel queries
- ✅ **Hierarchical Check**: Multi-level blacklist validation

## 🏗️ Architecture

### Key Structure Hierarchy

```
Redis Blacklist Keys:
├── blacklist:user:{userId}                    # User-wide blacklist
├── blacklist:session:{sessionId}              # Session-wide blacklist
└── blacklist:session:{sessionId}:token:{tokenId}  # Token-specific blacklist
```

### Check Priority

```
1. User Level (Highest Priority)
   └── If user is blacklisted → DENY ALL

2. Session Level (Medium Priority)
   └── If session is blacklisted → DENY SESSION

3. Token Level (Lowest Priority)
   └── If token is blacklisted → DENY TOKEN
```

## 📚 API Reference

### Methods

#### `addTokenBlacklist(sessionId, tokenId, exp)`

Blacklist một token cụ thể trong session.

**Parameters:**
- `sessionId` (string): ID của session
- `tokenId` (string): ID của token cần blacklist
- `exp` (number): Thời gian expire của token (Unix timestamp)

**Returns:** `Promise<void>`

**Example:**
```typescript
await backlistService.addTokenBlacklist('sess_abc123', 'tok_xyz789', 1640995200000);
```

---

#### `addUserToBlacklist(userId, exp)`

Blacklist tất cả sessions của một user.

**Parameters:**
- `userId` (string): ID của user cần blacklist
- `exp` (number): Thời gian expire (Unix timestamp)

**Returns:** `Promise<void>`

**Example:**
```typescript
// Logout user từ tất cả devices
await backlistService.addUserToBlacklist('user_456def', 1640995200000);
```

---

#### `checkIfTokenIsBlacklisted(sessionId, tokenId)`

Kiểm tra xem token có bị blacklist không (bao gồm cả session-level check).

**Parameters:**
- `sessionId` (string): ID của session
- `tokenId` (string): ID của token cần kiểm tra

**Returns:** `Promise<boolean>`

**Example:**
```typescript
const isBlacklisted = await backlistService.checkIfTokenIsBlacklisted('sess_abc123', 'tok_xyz789');
if (isBlacklisted) {
  throw new UnauthorizedException('Token is blacklisted');
}
```

---

#### `checkIfUserIsBlacklisted(userId)`

Kiểm tra xem user có bị blacklist không.

**Parameters:**
- `userId` (string): ID của user cần kiểm tra

**Returns:** `Promise<boolean>`

**Example:**
```typescript
const isUserBlacklisted = await backlistService.checkIfUserIsBlacklisted('user_456def');
if (isUserBlacklisted) {
  throw new UnauthorizedException('User is blacklisted');
}
```

## 🚀 Usage Examples

### 1. JWT Guard Integration

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly backlistService: BacklistService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { sessionId, tokenId, userId } = this.extractTokenInfo(request);

    // Check blacklist với parallel queries
    const [isTokenBlacklisted, isUserBlacklisted] = await Promise.all([
      this.backlistService.checkIfTokenIsBlacklisted(sessionId, tokenId),
      this.backlistService.checkIfUserIsBlacklisted(userId)
    ]);

    if (isTokenBlacklisted || isUserBlacklisted) {
      throw new UnauthorizedException('Access denied: Token or user is blacklisted');
    }

    return true;
  }
}
```

### 2. Logout Implementation

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly backlistService: BacklistService) {}

  @Post('logout')
  async logout(@Req() request: Request) {
    const { sessionId, tokenId, exp } = this.extractTokenInfo(request);
    
    // Blacklist current token
    await this.backlistService.addTokenBlacklist(sessionId, tokenId, exp);
    
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all-devices')
  async logoutAllDevices(@Req() request: Request) {
    const { userId, exp } = this.extractTokenInfo(request);
    
    // Blacklist all user sessions
    await this.backlistService.addUserToBlacklist(userId, exp);
    
    return { message: 'Logged out from all devices' };
  }
}
```

### 3. Password Change Flow

```typescript
@Controller('user')
export class UserController {
  constructor(
    private readonly backlistService: BacklistService,
    private readonly userService: UserService
  ) {}

  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() request: Request
  ) {
    const { userId } = this.extractTokenInfo(request);
    
    // Update password
    await this.userService.changePassword(userId, changePasswordDto);
    
    // Force logout from all devices
    const futureExp = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    await this.backlistService.addUserToBlacklist(userId, futureExp);
    
    return { message: 'Password changed. Please login again on all devices.' };
  }
}
```

### 4. Token Refresh Flow

```typescript
@Controller('auth')
export class AuthController {
  @Post('refresh')
  async refreshToken(@Body() refreshDto: RefreshTokenDto) {
    const { sessionId, oldTokenId, exp } = this.validateRefreshToken(refreshDto.refreshToken);
    
    // Blacklist old access token
    await this.backlistService.addTokenBlacklist(sessionId, oldTokenId, exp);
    
    // Generate new tokens
    const newTokens = await this.generateTokens(sessionId);
    
    return newTokens;
  }
}
```

## ⚡ Performance Considerations

### 1. Parallel Queries

```typescript
// ✅ Good: Parallel execution
const [tokenCheck, userCheck] = await Promise.all([
  backlistService.checkIfTokenIsBlacklisted(sessionId, tokenId),
  backlistService.checkIfUserIsBlacklisted(userId)
]);

// ❌ Bad: Sequential execution
const tokenCheck = await backlistService.checkIfTokenIsBlacklisted(sessionId, tokenId);
const userCheck = await backlistService.checkIfUserIsBlacklisted(userId);
```

### 2. TTL Optimization

```typescript
// Service tự động tính TTL dựa trên token expiration
private calculateTTL(exp: number): number {
  const now = Date.now();
  return (exp - now) * 1000; // Convert to milliseconds
}
```

### 3. Redis Key Patterns

```typescript
// Optimized key structure cho Redis performance
blacklist:user:{userId}                    // User-wide
blacklist:session:{sessionId}              // Session-wide  
blacklist:session:{sessionId}:token:{tokenId}  // Token-specific
```

## 🔧 Configuration

### Redis Cache Setup

```typescript
// app.module.ts
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: 60 * 60 * 24 * 7, // 7 days default TTL
    }),
  ],
  providers: [BacklistService],
})
export class AppModule {}
```

## 🛡️ Security Best Practices

### 1. Token Rotation

```typescript
// Blacklist old token khi refresh
await backlistService.addTokenBlacklist(sessionId, oldTokenId, exp);
```

### 2. Emergency Logout

```typescript
// Blacklist user khi phát hiện suspicious activity
await backlistService.addUserToBlacklist(suspiciousUserId, futureExp);
```

### 3. Session Management

```typescript
// Blacklist session khi logout từ device cụ thể
await backlistService.addTokenBlacklist(sessionId, tokenId, exp);
```

## 🧪 Testing

### Unit Test Example

```typescript
describe('BacklistService', () => {
  let service: BacklistService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BacklistService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BacklistService>(BacklistService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  describe('addTokenBlacklist', () => {
    it('should add token to blacklist with correct TTL', async () => {
      const sessionId = 'sess_123';
      const tokenId = 'tok_456';
      const exp = Date.now() + 3600000; // 1 hour

      await service.addTokenBlacklist(sessionId, tokenId, exp);

      expect(cacheManager.set).toHaveBeenCalledWith(
        'blacklist:session:sess_123:token:tok_456',
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('checkIfTokenIsBlacklisted', () => {
    it('should return true if token is blacklisted', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(Date.now());

      const result = await service.checkIfTokenIsBlacklisted('sess_123', 'tok_456');

      expect(result).toBe(true);
    });
  });
});
```

## 📊 Monitoring & Logging

### Metrics to Track

- Blacklist hit rate
- Cache performance
- TTL effectiveness
- User logout patterns

### Logging Example

```typescript
@Injectable()
export class BacklistService {
  private readonly logger = new Logger(BacklistService.name);

  async addTokenBlacklist(sessionId: string, tokenId: string, exp: number): Promise<void> {
    this.logger.log(`Blacklisting token: ${tokenId} for session: ${sessionId}`);
    // ... implementation
  }

  async checkIfTokenIsBlacklisted(sessionId: string, tokenId: string): Promise<boolean> {
    const isBlacklisted = // ... check logic
    
    if (isBlacklisted) {
      this.logger.warn(`Blocked blacklisted token: ${tokenId}`);
    }
    
    return isBlacklisted;
  }
}
```

## 🚨 Error Handling

```typescript
@Injectable()
export class BacklistService {
  async addTokenBlacklist(sessionId: string, tokenId: string, exp: number): Promise<void> {
    try {
      const ttl = this.calculateTTL(exp);
      
      if (ttl <= 0) {
        this.logger.warn(`Token ${tokenId} already expired, skipping blacklist`);
        return;
      }
      
      await this._cacheManager.set(key, Date.now(), ttl);
    } catch (error) {
      this.logger.error(`Failed to blacklist token ${tokenId}:`, error);
      throw new InternalServerErrorException('Failed to blacklist token');
    }
  }
}
```

## 📈 Scalability Considerations

1. **Redis Clustering**: Sử dụng Redis cluster cho high availability
2. **Key Expiration**: TTL tự động cleanup expired entries
3. **Memory Management**: Monitor Redis memory usage
4. **Connection Pooling**: Optimize Redis connections

---

## 📝 Notes

- Service này là core component của authentication system
- Tất cả blacklist operations đều async và sử dụng Promise
- TTL được tính tự động dựa trên token expiration
- Hỗ trợ hierarchical blacklist checking (user > session > token)
- Optimized cho high-performance với parallel Redis queries

---

**Created by:** Authentication Team  
**Last Updated:** 2024  
**Version:** 1.0.0