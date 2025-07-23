# Coding Standards & Style Guide

## 🎯 Overview

This document defines coding standards and style guide for the My Collection project. Following these standards ensures code consistency, maintainability, and effective team collaboration.

## 📋 General Principles

### Code Quality Principles
1. **Readability First**: Code is written to be read, not just to run
2. **Consistency**: Follow patterns and conventions
3. **Simplicity**: Prefer simple solutions over complex ones
4. **Performance**: Write efficient code without premature optimization
5. **Security**: Always consider security implications

### SOLID Principles
- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

## 🎨 Frontend Standards (Angular 20+)

### 📁 File & Folder Naming

```
kebab-case for files and folders
PascalCase for classes
camelCase for variables and functions
UPPER_SNAKE_CASE for constants
```

#### Examples:
```
✅ Good
user-profile.component.ts
bookmark-list.service.ts
API_ENDPOINTS.ts
userService
BookmarkComponent

❌ Bad
UserProfile.component.ts
bookmarkList.service.ts
apiEndpoints.ts
user_service
bookmarkcomponent
```

### 🧩 Component Standards

#### Component Structure
```typescript
@Component({
  selector: 'app-bookmark-card',
  templateUrl: './bookmark-card.component.html',
  styleUrls: ['./bookmark-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BookmarkCardComponent {
  // 1. Signals (inputs/outputs)
  bookmark = input.required<Bookmark>();
  onEdit = output<Bookmark>();
  
  // 2. Computed signals
  protected readonly displayTitle = computed(() => 
    this.bookmark().title || this.bookmark().url
  );
  
  // 3. Private fields
  private readonly router = inject(Router);
  
  // 4. Public methods
  editBookmark(): void {
    this.onEdit.emit(this.bookmark());
  }
  
  // 5. Private methods
  private navigateToDetail(): void {
    this.router.navigate(['/bookmarks', this.bookmark().id]);
  }
}
```

#### Component Best Practices
```typescript
// ✅ Use signals for inputs/outputs
bookmark = input.required<Bookmark>();
onEdit = output<Bookmark>();

// ✅ Use computed for derived state
displayTitle = computed(() => this.bookmark().title || 'Untitled');

// ✅ Use inject() function
private readonly router = inject(Router);

// ✅ OnPush change detection
changeDetection: ChangeDetectionStrategy.OnPush

// ✅ Standalone components
standalone: true

// ❌ Don't use @Input/@Output decorators
@Input() bookmark!: Bookmark;
@Output() edit = new EventEmitter<Bookmark>();

// ❌ Don't use constructor injection
constructor(private router: Router) {}
```

### 🎨 Template Standards

#### Control Flow (Angular 20+)
```html
<!-- ✅ Use new control flow -->
@if (bookmarks().length > 0) {
  @for (bookmark of bookmarks(); track bookmark.id) {
    <app-bookmark-card [bookmark]="bookmark" />
  } @empty {
    <p>No bookmarks found</p>
  }
} @else {
  <app-loading-spinner />
}

<!-- ❌ Don't use old structural directives -->
<div *ngIf="bookmarks().length > 0">
  <app-bookmark-card 
    *ngFor="let bookmark of bookmarks(); trackBy: trackByFn"
    [bookmark]="bookmark" 
  />
</div>
```

#### Class & Style Bindings
```html
<!-- ✅ Use property bindings -->
<button 
  [class.active]="isActive()"
  [style.background-color]="themeColor()"
>
  Click me
</button>

<!-- ❌ Don't use ngClass/ngStyle -->
<button 
  [ngClass]="{ active: isActive() }"
  [ngStyle]="{ 'background-color': themeColor() }"
>
  Click me
</button>
```

### 🔄 State Management (NgRx Signals)

#### Signal Store Pattern
```typescript
export const BookmarkStore = signalStore(
  { providedIn: 'root' },
  withState<BookmarkState>({
    bookmarks: [],
    loading: false,
    error: null,
    selectedBookmark: null
  }),
  withComputed(({ bookmarks, selectedBookmark }) => ({
    bookmarkCount: computed(() => bookmarks().length),
    hasSelection: computed(() => !!selectedBookmark()),
    favoriteBookmarks: computed(() => 
      bookmarks().filter(b => b.isFavorite)
    )
  })),
  withMethods((store) => ({
    loadBookmarks: rxMethod<void>(
      pipe(
        switchMap(() => 
          inject(BookmarkService).getBookmarks().pipe(
            tapResponse({
              next: (bookmarks) => patchState(store, { 
                bookmarks, 
                loading: false 
              }),
              error: (error) => patchState(store, { 
                error: error.message, 
                loading: false 
              })
            })
          )
        )
      )
    ),
    selectBookmark: (bookmark: Bookmark) => 
      patchState(store, { selectedBookmark: bookmark }),
    clearSelection: () => 
      patchState(store, { selectedBookmark: null })
  }))
);
```

### 🔧 Service Standards

#### Service Structure
```typescript
@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  
  private readonly baseUrl = `${this.config.apiUrl}/bookmarks`;
  
  getBookmarks(): Observable<Bookmark[]> {
    return this.http.get<ApiResponse<Bookmark[]>>(this.baseUrl).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }
  
  createBookmark(bookmark: CreateBookmarkDto): Observable<Bookmark> {
    return this.http.post<ApiResponse<Bookmark>>(this.baseUrl, bookmark).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }
  
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('BookmarkService error:', error);
    return throwError(() => new Error('Failed to process bookmark request'));
  }
}
```

## 🔧 Backend Standards (NestJS)

### 📁 Module Structure

```
src/
├── modules/
│   └── bookmark/
│       ├── bookmark.module.ts
│       ├── bookmark.controller.ts
│       ├── bookmark.service.ts
│       ├── entities/
│       │   └── bookmark.entity.ts
│       ├── dto/
│       │   ├── create-bookmark.dto.ts
│       │   └── update-bookmark.dto.ts
│       └── __tests__/
           ├── bookmark.controller.spec.ts
           └── bookmark.service.spec.ts
```

### 🎯 Controller Standards

```typescript
@Controller('bookmarks')
@ApiTags('Bookmarks')
@UseGuards(AccessTokenGuard)
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get()
  @ApiOperation({ summary: 'Get all bookmarks' })
  @ApiResponse({ status: 200, type: [BookmarkResponseDto] })
  async findAll(
    @Query() query: GetBookmarksQueryDto,
    @CurrentUser() user: UserPayload
  ): Promise<ApiResponse<Bookmark[]>> {
    const bookmarks = await this.bookmarkService.findAll(user.id, query);
    return {
      success: true,
      data: bookmarks,
      message: 'Bookmarks retrieved successfully'
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new bookmark' })
  @ApiResponse({ status: 201, type: BookmarkResponseDto })
  async create(
    @Body() createBookmarkDto: CreateBookmarkDto,
    @CurrentUser() user: UserPayload
  ): Promise<ApiResponse<Bookmark>> {
    const bookmark = await this.bookmarkService.create(user.id, createBookmarkDto);
    return {
      success: true,
      data: bookmark,
      message: 'Bookmark created successfully'
    };
  }
}
```

### 🔧 Service Standards

```typescript
@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: EntityRepository<Bookmark>,
    private readonly logger: Logger
  ) {}

  async findAll(userId: string, query: GetBookmarksQueryDto): Promise<Bookmark[]> {
    try {
      const qb = this.bookmarkRepository.createQueryBuilder('b');
      
      qb.where({ user: userId });
      
      if (query.search) {
        qb.andWhere({
          $or: [
            { title: { $ilike: `%${query.search}%` } },
            { url: { $ilike: `%${query.search}%` } }
          ]
        });
      }
      
      if (query.tags?.length) {
        qb.andWhere({ tags: { $in: query.tags } });
      }
      
      return await qb.getResult();
    } catch (error) {
      this.logger.error('Failed to fetch bookmarks', error);
      throw new InternalServerErrorException('Failed to fetch bookmarks');
    }
  }

  async create(userId: string, dto: CreateBookmarkDto): Promise<Bookmark> {
    try {
      const bookmark = this.bookmarkRepository.create({
        ...dto,
        user: userId
      });
      
      await this.bookmarkRepository.persistAndFlush(bookmark);
      return bookmark;
    } catch (error) {
      this.logger.error('Failed to create bookmark', error);
      throw new InternalServerErrorException('Failed to create bookmark');
    }
  }
}
```

### 📝 DTO Standards

```typescript
export class CreateBookmarkDto {
  @ApiProperty({ description: 'Bookmark title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Bookmark URL' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'Bookmark description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Tags', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
```

## 🧪 Testing Standards

### Frontend Testing

#### Component Testing
```typescript
describe('BookmarkCardComponent', () => {
  let component: BookmarkCardComponent;
  let fixture: ComponentFixture<BookmarkCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookmarkCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BookmarkCardComponent);
    component = fixture.componentInstance;
  });

  it('should display bookmark title', () => {
    // Arrange
    const mockBookmark = createMockBookmark({ title: 'Test Bookmark' });
    fixture.componentRef.setInput('bookmark', mockBookmark);

    // Act
    fixture.detectChanges();

    // Assert
    const titleElement = fixture.debugElement.query(By.css('[data-testid="bookmark-title"]'));
    expect(titleElement.nativeElement.textContent).toBe('Test Bookmark');
  });
});
```

#### Service Testing
```typescript
describe('BookmarkService', () => {
  let service: BookmarkService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookmarkService]
    });
    service = TestBed.inject(BookmarkService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch bookmarks', () => {
    // Arrange
    const mockBookmarks = [createMockBookmark()];

    // Act
    service.getBookmarks().subscribe(bookmarks => {
      expect(bookmarks).toEqual(mockBookmarks);
    });

    // Assert
    const req = httpMock.expectOne('/api/bookmarks');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockBookmarks });
  });
});
```

### Backend Testing

#### Controller Testing
```typescript
describe('BookmarkController', () => {
  let controller: BookmarkController;
  let service: BookmarkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController],
      providers: [
        {
          provide: BookmarkService,
          useValue: createMockBookmarkService()
        }
      ]
    }).compile();

    controller = module.get<BookmarkController>(BookmarkController);
    service = module.get<BookmarkService>(BookmarkService);
  });

  it('should return bookmarks', async () => {
    // Arrange
    const mockBookmarks = [createMockBookmark()];
    jest.spyOn(service, 'findAll').mockResolvedValue(mockBookmarks);

    // Act
    const result = await controller.findAll({}, createMockUser());

    // Assert
    expect(result.data).toEqual(mockBookmarks);
    expect(service.findAll).toHaveBeenCalled();
  });
});
```

## 📝 Documentation Standards

### Code Comments
```typescript
/**
 * Retrieves bookmarks for a specific user with optional filtering
 * @param userId - The ID of the user
 * @param query - Optional query parameters for filtering
 * @returns Promise resolving to array of bookmarks
 * @throws InternalServerErrorException when database operation fails
 */
async findAll(userId: string, query: GetBookmarksQueryDto): Promise<Bookmark[]> {
  // Implementation
}
```

### API Documentation
```typescript
@ApiOperation({ 
  summary: 'Create a new bookmark',
  description: 'Creates a new bookmark for the authenticated user. The URL will be validated and metadata will be automatically extracted.'
})
@ApiResponse({ 
  status: 201, 
  description: 'Bookmark created successfully',
  type: BookmarkResponseDto 
})
@ApiResponse({ 
  status: 400, 
  description: 'Invalid input data' 
})
@ApiResponse({ 
  status: 401, 
  description: 'Unauthorized' 
})
```

## 🔧 Tools & Automation

### ESLint Configuration
```json
{
  "extends": [
    "@angular-eslint/recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@angular-eslint/prefer-on-push-component-change-detection": "error"
  }
}
```

### Prettier Configuration
```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "es5"
}
```

### Git Hooks (Husky)
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:ci"
    }
  },
  "lint-staged": {
    "*.{ts,js}": ["eslint --fix", "prettier --write"],
    "*.{html,css,scss}": ["prettier --write"]
  }
}
```

## 🚀 Performance Guidelines

### Frontend Performance
- Use OnPush change detection
- Implement trackBy functions for *ngFor
- Lazy load feature modules
- Optimize bundle size with tree shaking
- Use async pipe for observables

### Backend Performance
- Use database indexes appropriately
- Implement caching strategies
- Use connection pooling
- Optimize database queries
- Implement rate limiting

## 🔒 Security Guidelines

### Frontend Security
- Sanitize user inputs
- Use HTTPS only
- Implement CSP headers
- Secure token storage
- Validate all user inputs

### Backend Security
- Use parameterized queries
- Implement input validation
- Use CORS properly
- Hash passwords securely
- Implement rate limiting

---

**Last updated**: $(date)
**Version**: 1.0.0