# Backend Architecture - Kiến trúc Backend

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Kiến trúc NestJS](#kiến-trúc-nestjs)
3. [Module Structure](#module-structure)
4. [Database Layer](#database-layer)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Design](#api-design)
7. [Error Handling](#error-handling)
8. [Caching Strategy](#caching-strategy)
9. [Performance Optimization](#performance-optimization)

## 🎯 Tổng quan

Backend của My Collection được xây dựng trên NestJS framework, sử dụng TypeScript và tuân theo các nguyên tắc SOLID, Clean Architecture và Domain-Driven Design.

### Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Controllers │  │   Guards    │  │ Interceptors│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Services   │  │    DTOs     │  │ Validators  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Entities   │  │ Repositories│  │  Interfaces │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Database   │  │    Redis    │  │ External    │        │
│  │ (PostgreSQL)│  │  (Caching)  │  │    APIs     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Kiến trúc NestJS

### Core Modules

```typescript
// app.module.ts
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('DB_LOGGING') === 'true',
      }),
      inject: [ConfigService],
    }),
    
    // Redis
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
      }),
      inject: [ConfigService],
    }),
    
    // Feature Modules
    AuthModule,
    UsersModule,
    BookmarksModule,
    CollectionsModule,
    TagsModule,
    SearchModule,
    NotificationsModule,
    
    // Common Modules
    CommonModule,
    DatabaseModule,
  ],
  providers: [
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    
    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    
    // Global Filters
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    
    // Global Pipes
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
```

### Module Structure Pattern

```typescript
// Ví dụ: BookmarksModule
@Module({
  imports: [
    TypeOrmModule.forFeature([Bookmark, BookmarkTag]),
    forwardRef(() => CollectionsModule),
    forwardRef(() => TagsModule),
  ],
  controllers: [BookmarksController],
  providers: [
    BookmarksService,
    BookmarkRepository,
    BookmarkValidationService,
    BookmarkCacheService,
  ],
  exports: [BookmarksService, BookmarkRepository],
})
export class BookmarksModule {}
```

## 📁 Module Structure

### Feature Module Organization

```
src/
├── modules/
│   ├── auth/
│   │   ├── controllers/
│   │   │   └── auth.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── jwt.service.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── auth.module.ts
│   │
│   ├── bookmarks/
│   │   ├── controllers/
│   │   │   └── bookmarks.controller.ts
│   │   ├── services/
│   │   │   ├── bookmarks.service.ts
│   │   │   └── bookmark-validation.service.ts
│   │   ├── repositories/
│   │   │   └── bookmark.repository.ts
│   │   ├── dto/
│   │   │   ├── create-bookmark.dto.ts
│   │   │   ├── update-bookmark.dto.ts
│   │   │   └── bookmark-query.dto.ts
│   │   ├── entities/
│   │   │   ├── bookmark.entity.ts
│   │   │   └── bookmark-tag.entity.ts
│   │   └── bookmarks.module.ts
│   │
│   └── common/
│       ├── decorators/
│       ├── filters/
│       ├── guards/
│       ├── interceptors/
│       ├── pipes/
│       └── utils/
```

### Entity Design Pattern

```typescript
// bookmark.entity.ts
@Entity('bookmarks')
@Index(['userId', 'createdAt'])
@Index(['userId', 'title'])
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  @Index()
  title: string;

  @Column('text')
  url: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text', { nullable: true })
  favicon?: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column({ default: false })
  @Index()
  isFavorite: boolean;

  @Column({ default: false })
  isArchived: boolean;

  @ManyToOne(() => User, user => user.bookmarks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  @Index()
  userId: string;

  @ManyToOne(() => Collection, collection => collection.bookmarks, { 
    nullable: true, 
    onDelete: 'SET NULL' 
  })
  @JoinColumn({ name: 'collection_id' })
  collection?: Collection;

  @Column('uuid', { nullable: true })
  collectionId?: string;

  @ManyToMany(() => Tag, tag => tag.bookmarks)
  @JoinTable({
    name: 'bookmark_tags',
    joinColumn: { name: 'bookmark_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tagEntities: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Virtual properties
  @Expose()
  get tagCount(): number {
    return this.tagEntities?.length || 0;
  }

  @Expose()
  get domain(): string {
    try {
      return new URL(this.url).hostname;
    } catch {
      return '';
    }
  }
}
```

## 💾 Database Layer

### Repository Pattern

```typescript
// bookmark.repository.ts
@Injectable()
export class BookmarkRepository extends Repository<Bookmark> {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    private readonly cacheService: CacheService,
  ) {
    super(
      bookmarkRepository.target,
      bookmarkRepository.manager,
      bookmarkRepository.queryRunner,
    );
  }

  async findByUserWithPagination(
    userId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Bookmark>> {
    const cacheKey = `bookmarks:user:${userId}:${JSON.stringify(options)}`;
    
    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const queryBuilder = this.createQueryBuilder('bookmark')
      .leftJoinAndSelect('bookmark.tagEntities', 'tags')
      .leftJoinAndSelect('bookmark.collection', 'collection')
      .where('bookmark.userId = :userId', { userId })
      .andWhere('bookmark.deletedAt IS NULL');

    // Apply filters
    if (options.search) {
      queryBuilder.andWhere(
        '(bookmark.title ILIKE :search OR bookmark.description ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options.tags?.length) {
      queryBuilder.andWhere('tags.name IN (:...tags)', { tags: options.tags });
    }

    if (options.collectionId) {
      queryBuilder.andWhere('bookmark.collectionId = :collectionId', {
        collectionId: options.collectionId,
      });
    }

    // Apply sorting
    const sortField = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'DESC';
    queryBuilder.orderBy(`bookmark.${sortField}`, sortOrder);

    // Apply pagination
    const total = await queryBuilder.getCount();
    const bookmarks = await queryBuilder
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getMany();

    const result = {
      data: bookmarks,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };

    // Cache result
    await this.cacheService.set(cacheKey, result, 300); // 5 minutes

    return result;
  }

  async findSimilarBookmarks(
    bookmarkId: string,
    limit: number = 5,
  ): Promise<Bookmark[]> {
    const bookmark = await this.findOne({
      where: { id: bookmarkId },
      relations: ['tagEntities'],
    });

    if (!bookmark) {
      return [];
    }

    const tagNames = bookmark.tagEntities.map(tag => tag.name);
    
    if (tagNames.length === 0) {
      return [];
    }

    return this.createQueryBuilder('bookmark')
      .leftJoinAndSelect('bookmark.tagEntities', 'tags')
      .where('bookmark.id != :bookmarkId', { bookmarkId })
      .andWhere('bookmark.userId = :userId', { userId: bookmark.userId })
      .andWhere('tags.name IN (:...tagNames)', { tagNames })
      .groupBy('bookmark.id')
      .orderBy('COUNT(tags.id)', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getBookmarkStats(userId: string): Promise<BookmarkStats> {
    const cacheKey = `bookmark-stats:${userId}`;
    
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const [
      total,
      favorites,
      archived,
      recentCount,
      topTags,
    ] = await Promise.all([
      this.count({ where: { userId, deletedAt: IsNull() } }),
      this.count({ where: { userId, isFavorite: true, deletedAt: IsNull() } }),
      this.count({ where: { userId, isArchived: true, deletedAt: IsNull() } }),
      this.count({
        where: {
          userId,
          createdAt: MoreThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
          deletedAt: IsNull(),
        },
      }),
      this.getTopTags(userId, 10),
    ]);

    const stats = {
      total,
      favorites,
      archived,
      recentCount,
      topTags,
    };

    await this.cacheService.set(cacheKey, stats, 600); // 10 minutes

    return stats;
  }

  private async getTopTags(userId: string, limit: number): Promise<TagStats[]> {
    return this.createQueryBuilder('bookmark')
      .leftJoin('bookmark.tagEntities', 'tag')
      .select('tag.name', 'name')
      .addSelect('COUNT(bookmark.id)', 'count')
      .where('bookmark.userId = :userId', { userId })
      .andWhere('bookmark.deletedAt IS NULL')
      .groupBy('tag.name')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
```

### Database Migrations

```typescript
// 1234567890-create-bookmarks-table.ts
export class CreateBookmarksTable1234567890 implements MigrationInterface {
  name = 'CreateBookmarksTable1234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bookmarks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'url',
            type: 'text',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'favicon',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'text',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'is_favorite',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_archived',
            type: 'boolean',
            default: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'collection_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'IDX_BOOKMARK_USER_CREATED',
            columnNames: ['user_id', 'created_at'],
          },
          {
            name: 'IDX_BOOKMARK_USER_TITLE',
            columnNames: ['user_id', 'title'],
          },
          {
            name: 'IDX_BOOKMARK_FAVORITE',
            columnNames: ['is_favorite'],
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['collection_id'],
            referencedTableName: 'collections',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('bookmarks');
  }
}
```

## 🔐 Authentication & Authorization

### JWT Strategy

```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private cacheService: CacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const cacheKey = `user:${payload.sub}`;
    
    // Try cache first
    let user = await this.cacheService.get(cacheKey);
    
    if (!user) {
      user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      // Cache user for 15 minutes
      await this.cacheService.set(cacheKey, user, 900);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is disabled');
    }

    return user;
  }
}
```

### Role-Based Access Control

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
    
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// roles.decorator.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Usage in controller
@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  @Get('users')
  @Roles(Role.SUPER_ADMIN)
  async getUsers() {
    // Only super admin can access
  }
}
```

### Resource-Based Authorization

```typescript
// bookmark-ownership.guard.ts
@Injectable()
export class BookmarkOwnershipGuard implements CanActivate {
  constructor(private bookmarksService: BookmarksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const bookmarkId = request.params.id;

    if (!bookmarkId) {
      return true; // Let other guards handle this
    }

    const bookmark = await this.bookmarksService.findOne(bookmarkId);
    
    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    // Check ownership or admin role
    return bookmark.userId === user.id || user.roles.includes(Role.ADMIN);
  }
}
```

## 🌐 API Design

### Controller Pattern

```typescript
// bookmarks.controller.ts
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
@ApiTags('Bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bookmark' })
  @ApiResponse({ status: 201, description: 'Bookmark created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() createBookmarkDto: CreateBookmarkDto,
    @CurrentUser() user: User,
  ): Promise<BookmarkResponseDto> {
    const bookmark = await this.bookmarksService.create(createBookmarkDto, user.id);
    return new BookmarkResponseDto(bookmark);
  }

  @Get()
  @ApiOperation({ summary: 'Get user bookmarks with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  async findAll(
    @Query() query: BookmarkQueryDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedResponseDto<BookmarkResponseDto>> {
    const result = await this.bookmarksService.findAllByUser(user.id, query);
    
    return {
      data: result.data.map(bookmark => new BookmarkResponseDto(bookmark)),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(':id')
  @UseGuards(BookmarkOwnershipGuard)
  @ApiOperation({ summary: 'Get bookmark by ID' })
  async findOne(@Param('id') id: string): Promise<BookmarkResponseDto> {
    const bookmark = await this.bookmarksService.findOne(id);
    return new BookmarkResponseDto(bookmark);
  }

  @Patch(':id')
  @UseGuards(BookmarkOwnershipGuard)
  @ApiOperation({ summary: 'Update bookmark' })
  async update(
    @Param('id') id: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto,
  ): Promise<BookmarkResponseDto> {
    const bookmark = await this.bookmarksService.update(id, updateBookmarkDto);
    return new BookmarkResponseDto(bookmark);
  }

  @Delete(':id')
  @UseGuards(BookmarkOwnershipGuard)
  @ApiOperation({ summary: 'Delete bookmark' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.bookmarksService.remove(id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk operations on bookmarks' })
  async bulkOperation(
    @Body() bulkOperationDto: BulkOperationDto,
    @CurrentUser() user: User,
  ): Promise<BulkOperationResultDto> {
    return this.bookmarksService.bulkOperation(bulkOperationDto, user.id);
  }

  @Get(':id/similar')
  @UseGuards(BookmarkOwnershipGuard)
  @ApiOperation({ summary: 'Get similar bookmarks' })
  async findSimilar(
    @Param('id') id: string,
    @Query('limit') limit: number = 5,
  ): Promise<BookmarkResponseDto[]> {
    const bookmarks = await this.bookmarksService.findSimilar(id, limit);
    return bookmarks.map(bookmark => new BookmarkResponseDto(bookmark));
  }
}
```

### DTO Pattern

```typescript
// create-bookmark.dto.ts
export class CreateBookmarkDto {
  @ApiProperty({ description: 'Bookmark title', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({ description: 'Bookmark URL' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'Bookmark description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ description: 'Tags for the bookmark', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  tags?: string[];

  @ApiProperty({ description: 'Collection ID', required: false })
  @IsOptional()
  @IsUUID()
  collectionId?: string;

  @ApiProperty({ description: 'Mark as favorite', required: false })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}

// bookmark-response.dto.ts
export class BookmarkResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  favicon?: string;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  isFavorite: boolean;

  @ApiProperty()
  isArchived: boolean;

  @ApiProperty()
  domain: string;

  @ApiProperty()
  tagCount: number;

  @ApiProperty()
  collection?: CollectionSummaryDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(bookmark: Bookmark) {
    this.id = bookmark.id;
    this.title = bookmark.title;
    this.url = bookmark.url;
    this.description = bookmark.description;
    this.favicon = bookmark.favicon;
    this.tags = bookmark.tags || [];
    this.isFavorite = bookmark.isFavorite;
    this.isArchived = bookmark.isArchived;
    this.domain = bookmark.domain;
    this.tagCount = bookmark.tagCount;
    this.collection = bookmark.collection 
      ? new CollectionSummaryDto(bookmark.collection)
      : undefined;
    this.createdAt = bookmark.createdAt;
    this.updatedAt = bookmark.updatedAt;
  }
}
```

## ⚠️ Error Handling

### Global Exception Filter

```typescript
// all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        code = (exceptionResponse as any).code || code;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';
      code = 'DATABASE_ERROR';
      
      // Handle specific database errors
      if (exception.message.includes('duplicate key')) {
        message = 'Resource already exists';
        code = 'DUPLICATE_RESOURCE';
        status = HttpStatus.CONFLICT;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    // Log error
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    httpAdapter.reply(response, errorResponse, status);
  }
}
```

### Custom Exceptions

```typescript
// bookmark.exceptions.ts
export class BookmarkNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Bookmark with ID ${id} not found`, 'BOOKMARK_NOT_FOUND');
  }
}

export class BookmarkAlreadyExistsException extends ConflictException {
  constructor(url: string) {
    super(`Bookmark with URL ${url} already exists`, 'BOOKMARK_EXISTS');
  }
}

export class InvalidBookmarkUrlException extends BadRequestException {
  constructor(url: string) {
    super(`Invalid bookmark URL: ${url}`, 'INVALID_URL');
  }
}
```

## 🚀 Caching Strategy

### Redis Cache Service

```typescript
// cache.service.ts
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `bookmarks:user:${userId}:*`,
      `collections:user:${userId}:*`,
      `tags:user:${userId}:*`,
      `bookmark-stats:${userId}`,
      `user:${userId}`,
    ];

    await Promise.all(patterns.map(pattern => this.delPattern(pattern)));
  }
}
```

### Cache Interceptor

```typescript
// cache.interceptor.ts
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(request);
    
    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    return from(this.cacheService.get(cacheKey)).pipe(
      switchMap(cachedData => {
        if (cachedData) {
          return of(cachedData);
        }

        return next.handle().pipe(
          tap(data => {
            // Cache successful responses for 5 minutes
            this.cacheService.set(cacheKey, data, 300);
          }),
        );
      }),
    );
  }

  private generateCacheKey(request: any): string {
    const { url, query, user } = request;
    return `api:${user.id}:${url}:${JSON.stringify(query)}`;
  }
}
```

## ⚡ Performance Optimization

### Database Query Optimization

```typescript
// Optimized service methods
@Injectable()
export class BookmarksService {
  async findAllByUserOptimized(
    userId: string,
    options: BookmarkQueryOptions,
  ): Promise<PaginatedResult<Bookmark>> {
    const queryBuilder = this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .select([
        'bookmark.id',
        'bookmark.title',
        'bookmark.url',
        'bookmark.description',
        'bookmark.favicon',
        'bookmark.isFavorite',
        'bookmark.createdAt',
      ])
      .where('bookmark.userId = :userId', { userId })
      .andWhere('bookmark.deletedAt IS NULL');

    // Only join tags if needed
    if (options.includeTags) {
      queryBuilder
        .leftJoinAndSelect('bookmark.tagEntities', 'tags')
        .addSelect(['tags.id', 'tags.name']);
    }

    // Only join collection if needed
    if (options.includeCollection) {
      queryBuilder
        .leftJoinAndSelect('bookmark.collection', 'collection')
        .addSelect(['collection.id', 'collection.name']);
    }

    // Use index-friendly filters
    if (options.search) {
      queryBuilder.andWhere(
        'bookmark.title ILIKE :search OR bookmark.description ILIKE :search',
        { search: `%${options.search}%` },
      );
    }

    if (options.isFavorite !== undefined) {
      queryBuilder.andWhere('bookmark.isFavorite = :isFavorite', {
        isFavorite: options.isFavorite,
      });
    }

    // Efficient pagination
    const total = await queryBuilder.getCount();
    const bookmarks = await queryBuilder
      .orderBy('bookmark.createdAt', 'DESC')
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getMany();

    return {
      data: bookmarks,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async bulkCreate(
    bookmarks: CreateBookmarkDto[],
    userId: string,
  ): Promise<Bookmark[]> {
    // Use batch insert for better performance
    const bookmarkEntities = bookmarks.map(dto => {
      const bookmark = new Bookmark();
      Object.assign(bookmark, dto);
      bookmark.userId = userId;
      return bookmark;
    });

    return this.bookmarkRepository.save(bookmarkEntities);
  }
}
```

### Connection Pooling

```typescript
// database.config.ts
export const databaseConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // Connection pooling
  extra: {
    max: 20, // Maximum connections
    min: 5,  // Minimum connections
    acquire: 30000, // Maximum time to get connection
    idle: 10000,    // Maximum idle time
  },
  
  // Query optimization
  logging: process.env.NODE_ENV === 'development',
  synchronize: false, // Always use migrations in production
  
  // Performance settings
  cache: {
    type: 'redis',
    options: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  },
};
```

---

## 📊 Monitoring và Metrics

### Health Checks

```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ]);
  }
}
```

### Performance Monitoring

```typescript
// performance.interceptor.ts
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        
        if (duration > 1000) { // Log slow requests
          this.logger.warn(
            `Slow request: ${request.method} ${request.url} took ${duration}ms`,
          );
        }
        
        // Send metrics to monitoring service
        this.sendMetrics(request, duration);
      }),
    );
  }

  private sendMetrics(request: any, duration: number): void {
    // Implementation for sending metrics to monitoring service
    // e.g., Prometheus, DataDog, etc.
  }
}
```

---

*Tài liệu này cung cấp cái nhìn tổng quan về kiến trúc backend của My Collection. Để biết thêm chi tiết về từng module cụ thể, vui lòng tham khảo các tài liệu chuyên biệt.*