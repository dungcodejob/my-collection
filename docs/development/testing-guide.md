# Testing Guide - Hướng dẫn Testing

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Testing Strategy](#testing-strategy)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [E2E Testing](#e2e-testing)
6. [Performance Testing](#performance-testing)
7. [Testing Best Practices](#testing-best-practices)
8. [CI/CD Testing](#cicd-testing)

## 🎯 Tổng quan

My Collection sử dụng comprehensive testing strategy để đảm bảo chất lượng code và reliability của ứng dụng. Testing được thực hiện ở nhiều levels khác nhau từ unit tests đến end-to-end tests.

### Testing Pyramid

```
                    E2E Tests
                   (Cypress/Playwright)
                  ┌─────────────────┐
                 │     UI Tests     │
                └─────────────────┘
              ┌─────────────────────┐
             │  Integration Tests   │
            │    (API, Services)    │
           └─────────────────────┘
         ┌─────────────────────────┐
        │      Unit Tests          │
       │  (Components, Services)   │
      └─────────────────────────┘
```

### Testing Tools

- **Frontend**: Jest, Angular Testing Utilities, Cypress
- **Backend**: Jest, Supertest, Test Containers
- **E2E**: Cypress, Playwright
- **Performance**: Lighthouse CI, Artillery
- **Visual**: Chromatic, Percy

## 🧪 Testing Strategy

### Coverage Goals

```typescript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/app/core/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/app/shared/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
```

### Test Categories

1. **Unit Tests** (70%): Components, Services, Utilities
2. **Integration Tests** (20%): API endpoints, Database operations
3. **E2E Tests** (10%): Critical user journeys

## 🔧 Unit Testing

### Frontend Unit Testing

#### Component Testing

```typescript
// bookmark-card.component.spec.ts
describe('BookmarkCardComponent', () => {
  let component: BookmarkCardComponent;
  let fixture: ComponentFixture<BookmarkCardComponent>;
  let mockBookmarkService: jasmine.SpyOf<BookmarkService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('BookmarkService', [
      'updateBookmark',
      'deleteBookmark',
      'toggleFavorite'
    ]);

    await TestBed.configureTestingModule({
      imports: [BookmarkCardComponent],
      providers: [
        { provide: BookmarkService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookmarkCardComponent);
    component = fixture.componentInstance;
    mockBookmarkService = TestBed.inject(BookmarkService) as jasmine.SpyOf<BookmarkService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display bookmark information', () => {
    const mockBookmark: Bookmark = {
      id: '1',
      title: 'Test Bookmark',
      url: 'https://example.com',
      description: 'Test description',
      isFavorite: false,
      tags: ['test', 'example'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    fixture.componentRef.setInput('bookmark', mockBookmark);
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('[data-testid="bookmark-title"]'));
    const urlElement = fixture.debugElement.query(By.css('[data-testid="bookmark-url"]'));

    expect(titleElement.nativeElement.textContent).toBe('Test Bookmark');
    expect(urlElement.nativeElement.textContent).toBe('https://example.com');
  });

  it('should toggle favorite status', async () => {
    const mockBookmark: Bookmark = {
      id: '1',
      title: 'Test Bookmark',
      url: 'https://example.com',
      isFavorite: false,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    fixture.componentRef.setInput('bookmark', mockBookmark);
    mockBookmarkService.toggleFavorite.and.returnValue(of({ ...mockBookmark, isFavorite: true }));

    const favoriteButton = fixture.debugElement.query(By.css('[data-testid="favorite-button"]'));
    favoriteButton.nativeElement.click();

    expect(mockBookmarkService.toggleFavorite).toHaveBeenCalledWith('1');
  });

  it('should emit delete event', () => {
    spyOn(component.deleteBookmark, 'emit');
    
    const deleteButton = fixture.debugElement.query(By.css('[data-testid="delete-button"]'));
    deleteButton.nativeElement.click();

    expect(component.deleteBookmark.emit).toHaveBeenCalledWith('1');
  });

  it('should handle error states', () => {
    component.error.set('Failed to load bookmark');
    fixture.detectChanges();

    const errorElement = fixture.debugElement.query(By.css('[data-testid="error-message"]'));
    expect(errorElement.nativeElement.textContent).toContain('Failed to load bookmark');
  });
});
```

#### Service Testing

```typescript
// bookmark.service.spec.ts
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

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch bookmarks', () => {
    const mockBookmarks: Bookmark[] = [
      {
        id: '1',
        title: 'Test Bookmark',
        url: 'https://example.com',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    service.getBookmarks().subscribe(bookmarks => {
      expect(bookmarks).toEqual(mockBookmarks);
    });

    const req = httpMock.expectOne('/api/bookmarks');
    expect(req.request.method).toBe('GET');
    req.flush(mockBookmarks);
  });

  it('should create bookmark', () => {
    const newBookmark: CreateBookmarkDto = {
      title: 'New Bookmark',
      url: 'https://new-example.com',
      description: 'New description'
    };

    const createdBookmark: Bookmark = {
      id: '2',
      ...newBookmark,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    service.createBookmark(newBookmark).subscribe(bookmark => {
      expect(bookmark).toEqual(createdBookmark);
    });

    const req = httpMock.expectOne('/api/bookmarks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newBookmark);
    req.flush(createdBookmark);
  });

  it('should handle errors', () => {
    service.getBookmarks().subscribe({
      next: () => fail('Should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('/api/bookmarks');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });
});
```

#### Store Testing (NgRx Signals)

```typescript
// bookmark.store.spec.ts
describe('BookmarkStore', () => {
  let store: InstanceType<typeof BookmarkStore>;
  let mockBookmarkService: jasmine.SpyOf<BookmarkService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('BookmarkService', [
      'getBookmarks',
      'createBookmark',
      'updateBookmark',
      'deleteBookmark'
    ]);

    TestBed.configureTestingModule({
      providers: [
        BookmarkStore,
        { provide: BookmarkService, useValue: spy }
      ]
    });

    store = TestBed.inject(BookmarkStore);
    mockBookmarkService = TestBed.inject(BookmarkService) as jasmine.SpyOf<BookmarkService>;
  });

  it('should initialize with empty state', () => {
    expect(store.bookmarks()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should load bookmarks', async () => {
    const mockBookmarks: Bookmark[] = [
      { id: '1', title: 'Test', url: 'https://test.com', tags: [], createdAt: new Date(), updatedAt: new Date() }
    ];

    mockBookmarkService.getBookmarks.and.returnValue(of(mockBookmarks));

    await store.loadBookmarks();

    expect(store.bookmarks()).toEqual(mockBookmarks);
    expect(store.loading()).toBe(false);
    expect(mockBookmarkService.getBookmarks).toHaveBeenCalled();
  });

  it('should handle loading errors', async () => {
    const errorMessage = 'Failed to load bookmarks';
    mockBookmarkService.getBookmarks.and.returnValue(throwError(() => new Error(errorMessage)));

    await store.loadBookmarks();

    expect(store.error()).toBe(errorMessage);
    expect(store.loading()).toBe(false);
  });

  it('should add bookmark', async () => {
    const newBookmark: Bookmark = {
      id: '2',
      title: 'New Bookmark',
      url: 'https://new.com',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockBookmarkService.createBookmark.and.returnValue(of(newBookmark));

    await store.addBookmark({
      title: 'New Bookmark',
      url: 'https://new.com'
    });

    expect(store.bookmarks()).toContain(newBookmark);
  });

  it('should filter bookmarks', () => {
    const bookmarks: Bookmark[] = [
      { id: '1', title: 'Angular Guide', url: 'https://angular.io', tags: ['angular'], createdAt: new Date(), updatedAt: new Date() },
      { id: '2', title: 'React Docs', url: 'https://react.dev', tags: ['react'], createdAt: new Date(), updatedAt: new Date() }
    ];

    store.setBookmarks(bookmarks);
    store.setFilter({ search: 'Angular' });

    expect(store.filteredBookmarks()).toHaveLength(1);
    expect(store.filteredBookmarks()[0].title).toBe('Angular Guide');
  });
});
```

### Backend Unit Testing

#### Controller Testing

```typescript
// bookmark.controller.spec.ts
describe('BookmarkController', () => {
  let controller: BookmarkController;
  let service: BookmarkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController],
      providers: [
        {
          provide: BookmarkService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BookmarkController>(BookmarkController);
    service = module.get<BookmarkService>(BookmarkService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBookmarks', () => {
    it('should return an array of bookmarks', async () => {
      const mockBookmarks = [
        { id: '1', title: 'Test', url: 'https://test.com' },
      ];
      
      jest.spyOn(service, 'findAll').mockResolvedValue(mockBookmarks);

      const result = await controller.getBookmarks(
        { id: 'user1' } as User,
        { page: 1, limit: 10 }
      );

      expect(result).toEqual(mockBookmarks);
      expect(service.findAll).toHaveBeenCalledWith('user1', { page: 1, limit: 10 });
    });
  });

  describe('createBookmark', () => {
    it('should create a new bookmark', async () => {
      const createDto: CreateBookmarkDto = {
        title: 'New Bookmark',
        url: 'https://new.com',
      };

      const createdBookmark = { id: '2', ...createDto };
      jest.spyOn(service, 'create').mockResolvedValue(createdBookmark);

      const result = await controller.createBookmark(
        { id: 'user1' } as User,
        createDto
      );

      expect(result).toEqual(createdBookmark);
      expect(service.create).toHaveBeenCalledWith('user1', createDto);
    });
  });
});
```

#### Service Testing

```typescript
// bookmark.service.spec.ts
describe('BookmarkService', () => {
  let service: BookmarkService;
  let repository: Repository<Bookmark>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarkService,
        {
          provide: getRepositoryToken(Bookmark),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookmarkService>(BookmarkService);
    repository = module.get<Repository<Bookmark>>(getRepositoryToken(Bookmark));
  });

  describe('findAll', () => {
    it('should return paginated bookmarks', async () => {
      const mockBookmarks = [
        { id: '1', title: 'Test', url: 'https://test.com', userId: 'user1' },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockBookmarks, 1]),
      };

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll('user1', { page: 1, limit: 10 });

      expect(result.data).toEqual(mockBookmarks);
      expect(result.total).toBe(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('bookmark.userId = :userId', { userId: 'user1' });
    });
  });

  describe('create', () => {
    it('should create and save a bookmark', async () => {
      const createDto: CreateBookmarkDto = {
        title: 'New Bookmark',
        url: 'https://new.com',
      };

      const bookmark = { id: '2', ...createDto, userId: 'user1' };

      jest.spyOn(repository, 'create').mockReturnValue(bookmark as any);
      jest.spyOn(repository, 'save').mockResolvedValue(bookmark as any);

      const result = await service.create('user1', createDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        userId: 'user1',
      });
      expect(repository.save).toHaveBeenCalledWith(bookmark);
      expect(result).toEqual(bookmark);
    });
  });
});
```

## 🔗 Integration Testing

### API Integration Tests

```typescript
// bookmark.integration.spec.ts
describe('Bookmark API Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let bookmarkRepository: Repository<Bookmark>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(await createTestDatabase())
      .compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    userRepository = dataSource.getRepository(User);
    bookmarkRepository = dataSource.getRepository(Bookmark);

    await app.init();
  });

  beforeEach(async () => {
    await dataSource.synchronize(true); // Reset database
  });

  afterAll(async () => {
    await app.close();
    await dataSource.destroy();
  });

  describe('GET /bookmarks', () => {
    it('should return user bookmarks', async () => {
      // Setup test data
      const user = await userRepository.save({
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashedpassword',
      });

      const bookmark = await bookmarkRepository.save({
        title: 'Test Bookmark',
        url: 'https://test.com',
        userId: user.id,
      });

      const token = generateJwtToken(user);

      const response = await request(app.getHttpServer())
        .get('/bookmarks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Test Bookmark');
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/bookmarks')
        .expect(401);
    });
  });

  describe('POST /bookmarks', () => {
    it('should create a new bookmark', async () => {
      const user = await userRepository.save({
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashedpassword',
      });

      const token = generateJwtToken(user);
      const createDto = {
        title: 'New Bookmark',
        url: 'https://new.com',
        description: 'Test description',
      };

      const response = await request(app.getHttpServer())
        .post('/bookmarks')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto)
        .expect(201);

      expect(response.body.title).toBe(createDto.title);
      expect(response.body.url).toBe(createDto.url);

      // Verify in database
      const savedBookmark = await bookmarkRepository.findOne({
        where: { id: response.body.id },
      });
      expect(savedBookmark).toBeDefined();
      expect(savedBookmark.userId).toBe(user.id);
    });

    it('should validate required fields', async () => {
      const user = await userRepository.save({
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashedpassword',
      });

      const token = generateJwtToken(user);

      await request(app.getHttpServer())
        .post('/bookmarks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Missing URL' })
        .expect(400);
    });
  });
});

// Test utilities
async function createTestDatabase(): Promise<DataSource> {
  return new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5433, // Different port for test DB
    username: 'test',
    password: 'test',
    database: 'my_collection_test',
    entities: [User, Bookmark, Collection, Tag],
    synchronize: true,
    dropSchema: true,
  });
}

function generateJwtToken(user: User): string {
  return jwt.sign(
    { sub: user.id, email: user.email },
    'test-secret',
    { expiresIn: '1h' }
  );
}
```

### Database Integration Tests

```typescript
// database.integration.spec.ts
describe('Database Integration', () => {
  let dataSource: DataSource;
  let bookmarkRepository: Repository<Bookmark>;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    dataSource = await createTestDatabase();
    bookmarkRepository = dataSource.getRepository(Bookmark);
    userRepository = dataSource.getRepository(User);
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Bookmark Repository', () => {
    it('should save and retrieve bookmarks', async () => {
      const user = await userRepository.save({
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashedpassword',
      });

      const bookmark = bookmarkRepository.create({
        title: 'Test Bookmark',
        url: 'https://test.com',
        userId: user.id,
      });

      const savedBookmark = await bookmarkRepository.save(bookmark);
      expect(savedBookmark.id).toBeDefined();

      const retrievedBookmark = await bookmarkRepository.findOne({
        where: { id: savedBookmark.id },
      });

      expect(retrievedBookmark).toBeDefined();
      expect(retrievedBookmark.title).toBe('Test Bookmark');
    });

    it('should handle cascade deletes', async () => {
      const user = await userRepository.save({
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashedpassword',
      });

      const bookmark = await bookmarkRepository.save({
        title: 'Test Bookmark',
        url: 'https://test.com',
        userId: user.id,
      });

      await userRepository.remove(user);

      const orphanedBookmark = await bookmarkRepository.findOne({
        where: { id: bookmark.id },
      });

      expect(orphanedBookmark).toBeNull();
    });
  });
});
```

## 🌐 E2E Testing

### Cypress E2E Tests

```typescript
// cypress/e2e/bookmark-management.cy.ts
describe('Bookmark Management', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    cy.visit('/bookmarks');
  });

  it('should display bookmarks list', () => {
    cy.get('[data-testid="bookmark-list"]').should('be.visible');
    cy.get('[data-testid="bookmark-card"]').should('have.length.at.least', 1);
  });

  it('should create a new bookmark', () => {
    cy.get('[data-testid="add-bookmark-button"]').click();
    
    cy.get('[data-testid="bookmark-title-input"]')
      .type('New Test Bookmark');
    
    cy.get('[data-testid="bookmark-url-input"]')
      .type('https://example.com');
    
    cy.get('[data-testid="bookmark-description-input"]')
      .type('This is a test bookmark');
    
    cy.get('[data-testid="save-bookmark-button"]').click();
    
    cy.get('[data-testid="success-message"]')
      .should('contain', 'Bookmark created successfully');
    
    cy.get('[data-testid="bookmark-card"]')
      .should('contain', 'New Test Bookmark');
  });

  it('should edit a bookmark', () => {
    cy.get('[data-testid="bookmark-card"]').first().within(() => {
      cy.get('[data-testid="edit-button"]').click();
    });
    
    cy.get('[data-testid="bookmark-title-input"]')
      .clear()
      .type('Updated Bookmark Title');
    
    cy.get('[data-testid="save-bookmark-button"]').click();
    
    cy.get('[data-testid="bookmark-card"]')
      .should('contain', 'Updated Bookmark Title');
  });

  it('should delete a bookmark', () => {
    cy.get('[data-testid="bookmark-card"]').first().within(() => {
      cy.get('[data-testid="delete-button"]').click();
    });
    
    cy.get('[data-testid="confirm-delete-button"]').click();
    
    cy.get('[data-testid="success-message"]')
      .should('contain', 'Bookmark deleted successfully');
  });

  it('should search bookmarks', () => {
    cy.get('[data-testid="search-input"]').type('Angular');
    
    cy.get('[data-testid="bookmark-card"]')
      .should('have.length.at.least', 1)
      .each(($card) => {
        cy.wrap($card).should('contain.text', 'Angular');
      });
  });

  it('should filter by tags', () => {
    cy.get('[data-testid="tag-filter"]').click();
    cy.get('[data-testid="tag-option"]').contains('javascript').click();
    
    cy.get('[data-testid="bookmark-card"]')
      .should('have.length.at.least', 1)
      .each(($card) => {
        cy.wrap($card).find('[data-testid="bookmark-tags"]')
          .should('contain', 'javascript');
      });
  });
});
```

### Playwright E2E Tests

```typescript
// tests/e2e/bookmark-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Bookmark Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/bookmarks');
  });

  test('should create and manage bookmarks', async ({ page }) => {
    // Create bookmark
    await page.click('[data-testid="add-bookmark-button"]');
    await page.fill('[data-testid="bookmark-title-input"]', 'Test Bookmark');
    await page.fill('[data-testid="bookmark-url-input"]', 'https://test.com');
    await page.click('[data-testid="save-bookmark-button"]');
    
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Bookmark created successfully');

    // Verify bookmark appears in list
    await expect(page.locator('[data-testid="bookmark-card"]'))
      .toContainText('Test Bookmark');

    // Edit bookmark
    await page.locator('[data-testid="bookmark-card"]').first()
      .locator('[data-testid="edit-button"]').click();
    
    await page.fill('[data-testid="bookmark-title-input"]', 'Updated Bookmark');
    await page.click('[data-testid="save-bookmark-button"]');
    
    await expect(page.locator('[data-testid="bookmark-card"]'))
      .toContainText('Updated Bookmark');
  });

  test('should handle bookmark search and filtering', async ({ page }) => {
    // Search functionality
    await page.fill('[data-testid="search-input"]', 'Angular');
    await page.waitForTimeout(500); // Debounce
    
    const bookmarkCards = page.locator('[data-testid="bookmark-card"]');
    await expect(bookmarkCards).toHaveCount(1);
    await expect(bookmarkCards.first()).toContainText('Angular');

    // Tag filtering
    await page.click('[data-testid="tag-filter-button"]');
    await page.click('[data-testid="tag-option"][data-tag="javascript"]');
    
    await expect(bookmarkCards).toHaveCount(2);
  });

  test('should handle offline scenarios', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    await page.click('[data-testid="add-bookmark-button"]');
    await page.fill('[data-testid="bookmark-title-input"]', 'Offline Bookmark');
    await page.fill('[data-testid="bookmark-url-input"]', 'https://offline.com');
    await page.click('[data-testid="save-bookmark-button"]');
    
    // Should show offline message
    await expect(page.locator('[data-testid="offline-message"]'))
      .toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    await page.reload();
    
    // Should sync offline changes
    await expect(page.locator('[data-testid="bookmark-card"]'))
      .toContainText('Offline Bookmark');
  });
});
```

## ⚡ Performance Testing

### Frontend Performance Tests

```typescript
// performance/lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4200/',
        'http://localhost:4200/bookmarks',
        'http://localhost:4200/collections',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Backend Performance Tests

```typescript
// performance/load-test.ts
import { check } from 'k6';
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
};

export default function () {
  const baseUrl = 'http://localhost:3000';
  
  // Login
  const loginResponse = http.post(`${baseUrl}/auth/login`, {
    email: 'test@example.com',
    password: 'password123',
  });
  
  check(loginResponse, {
    'login successful': (r) => r.status === 200,
  });
  
  const token = loginResponse.json('access_token');
  const headers = { Authorization: `Bearer ${token}` };
  
  // Get bookmarks
  const bookmarksResponse = http.get(`${baseUrl}/bookmarks`, { headers });
  check(bookmarksResponse, {
    'bookmarks loaded': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  // Create bookmark
  const createResponse = http.post(
    `${baseUrl}/bookmarks`,
    JSON.stringify({
      title: `Test Bookmark ${Math.random()}`,
      url: `https://example-${Math.random()}.com`,
    }),
    { headers: { ...headers, 'Content-Type': 'application/json' } }
  );
  
  check(createResponse, {
    'bookmark created': (r) => r.status === 201,
  });
}
```

## 📋 Testing Best Practices

### Test Organization

```typescript
// tests/utils/test-helpers.ts
export class TestHelpers {
  static createMockUser(overrides: Partial<User> = {}): User {
    return {
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMockBookmark(overrides: Partial<Bookmark> = {}): Bookmark {
    return {
      id: 'bookmark-1',
      title: 'Test Bookmark',
      url: 'https://example.com',
      description: 'Test description',
      tags: ['test'],
      isFavorite: false,
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static async waitForElement(
    fixture: ComponentFixture<any>,
    selector: string,
    timeout = 5000
  ): Promise<DebugElement> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      fixture.detectChanges();
      const element = fixture.debugElement.query(By.css(selector));
      if (element) {
        return element;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  }
}
```

### Custom Matchers

```typescript
// tests/matchers/custom-matchers.ts
declare global {
  namespace jasmine {
    interface Matchers<T> {
      toBeValidBookmark(): boolean;
      toHaveValidUrl(): boolean;
    }
  }
}

export const customMatchers: jasmine.CustomMatcherFactories = {
  toBeValidBookmark: () => ({
    compare: (actual: any) => {
      const pass = actual &&
        typeof actual.id === 'string' &&
        typeof actual.title === 'string' &&
        typeof actual.url === 'string' &&
        actual.title.length > 0 &&
        actual.url.length > 0;

      return {
        pass,
        message: pass
          ? `Expected ${actual} not to be a valid bookmark`
          : `Expected ${actual} to be a valid bookmark with id, title, and url`
      };
    }
  }),

  toHaveValidUrl: () => ({
    compare: (actual: string) => {
      try {
        new URL(actual);
        return { pass: true };
      } catch {
        return {
          pass: false,
          message: `Expected ${actual} to be a valid URL`
        };
      }
    }
  })
};
```

### Test Data Management

```typescript
// tests/fixtures/test-data.ts
export class TestDataBuilder {
  private data: Partial<Bookmark> = {};

  static aBookmark(): TestDataBuilder {
    return new TestDataBuilder();
  }

  withTitle(title: string): TestDataBuilder {
    this.data.title = title;
    return this;
  }

  withUrl(url: string): TestDataBuilder {
    this.data.url = url;
    return this;
  }

  withTags(tags: string[]): TestDataBuilder {
    this.data.tags = tags;
    return this;
  }

  asFavorite(): TestDataBuilder {
    this.data.isFavorite = true;
    return this;
  }

  build(): Bookmark {
    return {
      id: 'test-id',
      title: 'Test Bookmark',
      url: 'https://example.com',
      description: '',
      tags: [],
      isFavorite: false,
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...this.data,
    };
  }
}

// Usage
const bookmark = TestDataBuilder
  .aBookmark()
  .withTitle('Angular Documentation')
  .withUrl('https://angular.io')
  .withTags(['angular', 'documentation'])
  .asFavorite()
  .build();
```

## 🚀 CI/CD Testing

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: my_collection_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: postgres
          DB_PASSWORD: test
          DB_NAME: my_collection_test

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start application
        run: |
          npm run build
          npm run start:prod &
          npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:integration": "jest --config jest.integration.config.js",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:performance": "k6 run performance/load-test.js",
    "test:lighthouse": "lhci autorun"
  }
}
```

---

*Tài liệu này cung cấp hướng dẫn comprehensive về testing strategy và implementation cho My Collection project. Để biết thêm chi tiết về specific testing scenarios, vui lòng tham khảo test files trong source code.*