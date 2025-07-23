# Testing Strategy - Comprehensive Testing Guide

## 📋 Tổng quan

Tài liệu này mô tả chiến lược testing toàn diện cho dự án My Collection, bao gồm unit testing, integration testing, e2e testing, và performance testing cho cả frontend và backend.

## 🎯 Testing Pyramid

### Testing Strategy Overview

```
    /\
   /  \     E2E Tests (10%)
  /____\    - User workflows
 /      \   - Critical paths
/________\  Integration Tests (20%)
          \ - API endpoints
           \- Component integration
            \
             \________________
              Unit Tests (70%)
              - Pure functions
              - Components
              - Services
```

## 🧪 Frontend Testing

### Unit Testing with Jest & Testing Library

```typescript
// shared/components/bookmark-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BookmarkCardComponent } from './bookmark-card.component';
import { Bookmark } from '../../models/bookmark.model';

describe('BookmarkCardComponent', () => {
  let component: BookmarkCardComponent;
  let fixture: ComponentFixture<BookmarkCardComponent>;
  
  const mockBookmark: Bookmark = {
    id: '1',
    title: 'Test Bookmark',
    url: 'https://example.com',
    description: 'Test description',
    tags: ['test', 'example'],
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user1'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookmarkCardComponent],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(BookmarkCardComponent);
    component = fixture.componentInstance;
    
    // Set input
    fixture.componentRef.setInput('bookmark', mockBookmark);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display bookmark title', () => {
    const titleElement = fixture.debugElement.query(By.css('[data-testid="bookmark-title"]'));
    expect(titleElement.nativeElement.textContent).toBe(mockBookmark.title);
  });

  it('should display bookmark URL', () => {
    const urlElement = fixture.debugElement.query(By.css('[data-testid="bookmark-url"]'));
    expect(urlElement.nativeElement.href).toBe(mockBookmark.url);
  });

  it('should emit edit event when edit button is clicked', () => {
    spyOn(component.edit, 'emit');
    
    const editButton = fixture.debugElement.query(By.css('[data-testid="edit-button"]'));
    editButton.nativeElement.click();
    
    expect(component.edit.emit).toHaveBeenCalledWith(mockBookmark);
  });

  it('should emit delete event when delete button is clicked', () => {
    spyOn(component.delete, 'emit');
    
    const deleteButton = fixture.debugElement.query(By.css('[data-testid="delete-button"]'));
    deleteButton.nativeElement.click();
    
    expect(component.delete.emit).toHaveBeenCalledWith(mockBookmark.id);
  });

  it('should display tags', () => {
    const tagElements = fixture.debugElement.queryAll(By.css('[data-testid="bookmark-tag"]'));
    expect(tagElements.length).toBe(mockBookmark.tags.length);
    
    tagElements.forEach((tagElement, index) => {
      expect(tagElement.nativeElement.textContent.trim()).toBe(mockBookmark.tags[index]);
    });
  });

  it('should handle missing description gracefully', () => {
    const bookmarkWithoutDescription = { ...mockBookmark, description: undefined };
    fixture.componentRef.setInput('bookmark', bookmarkWithoutDescription);
    fixture.detectChanges();
    
    const descriptionElement = fixture.debugElement.query(By.css('[data-testid="bookmark-description"]'));
    expect(descriptionElement).toBeFalsy();
  });
});
```

### Service Testing

```typescript
// features/bookmarks/services/bookmark.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookmarkService } from './bookmark.service';
import { Bookmark, CreateBookmarkDto, UpdateBookmarkDto } from '../models/bookmark.model';

describe('BookmarkService', () => {
  let service: BookmarkService;
  let httpMock: HttpTestingController;
  
  const mockBookmarksResponse = {
    data: [
      {
        id: '1',
        title: 'Test Bookmark 1',
        url: 'https://example1.com',
        description: 'Description 1',
        tags: ['tag1'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        userId: 'user1'
      },
      {
        id: '2',
        title: 'Test Bookmark 2',
        url: 'https://example2.com',
        description: 'Description 2',
        tags: ['tag2'],
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        userId: 'user1'
      }
    ],
    total: 2,
    page: 1,
    limit: 10
  };

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

  describe('getBookmarks', () => {
    it('should fetch bookmarks with default parameters', () => {
      service.getBookmarks().subscribe(response => {
        expect(response.data.length).toBe(2);
        expect(response.total).toBe(2);
      });

      const req = httpMock.expectOne('/api/bookmarks?page=1&limit=10');
      expect(req.request.method).toBe('GET');
      req.flush(mockBookmarksResponse);
    });

    it('should fetch bookmarks with custom parameters', () => {
      const params = { page: 2, limit: 5, search: 'test' };
      
      service.getBookmarks(params).subscribe();

      const req = httpMock.expectOne('/api/bookmarks?page=2&limit=5&search=test');
      expect(req.request.method).toBe('GET');
      req.flush(mockBookmarksResponse);
    });

    it('should handle error response', () => {
      service.getBookmarks().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/bookmarks?page=1&limit=10');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('createBookmark', () => {
    it('should create a new bookmark', () => {
      const createDto: CreateBookmarkDto = {
        title: 'New Bookmark',
        url: 'https://new-example.com',
        description: 'New description',
        tags: ['new-tag']
      };

      const expectedBookmark: Bookmark = {
        id: '3',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      };

      service.createBookmark(createDto).subscribe(bookmark => {
        expect(bookmark.title).toBe(createDto.title);
        expect(bookmark.url).toBe(createDto.url);
      });

      const req = httpMock.expectOne('/api/bookmarks');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(expectedBookmark);
    });
  });

  describe('updateBookmark', () => {
    it('should update an existing bookmark', () => {
      const updateDto: UpdateBookmarkDto = {
        title: 'Updated Title',
        description: 'Updated description'
      };

      const updatedBookmark: Bookmark = {
        id: '1',
        title: 'Updated Title',
        url: 'https://example1.com',
        description: 'Updated description',
        tags: ['tag1'],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      };

      service.updateBookmark('1', updateDto).subscribe(bookmark => {
        expect(bookmark.title).toBe(updateDto.title);
        expect(bookmark.description).toBe(updateDto.description);
      });

      const req = httpMock.expectOne('/api/bookmarks/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateDto);
      req.flush(updatedBookmark);
    });
  });

  describe('deleteBookmark', () => {
    it('should delete a bookmark', () => {
      service.deleteBookmark('1').subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne('/api/bookmarks/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });
});
```

### Store Testing (NgRx Signals)

```typescript
// features/bookmarks/store/bookmark.store.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BookmarkStore } from './bookmark.store';
import { BookmarkService } from '../services/bookmark.service';
import { of, throwError } from 'rxjs';

describe('BookmarkStore', () => {
  let store: BookmarkStore;
  let bookmarkService: jasmine.SpyObj<BookmarkService>;

  const mockBookmarksResponse = {
    data: [
      {
        id: '1',
        title: 'Test Bookmark',
        url: 'https://example.com',
        description: 'Test description',
        tags: ['test'],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      }
    ],
    total: 1,
    page: 1,
    limit: 10
  };

  beforeEach(() => {
    const bookmarkServiceSpy = jasmine.createSpyObj('BookmarkService', [
      'getBookmarks',
      'createBookmark',
      'updateBookmark',
      'deleteBookmark'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BookmarkStore,
        { provide: BookmarkService, useValue: bookmarkServiceSpy }
      ]
    });

    store = TestBed.inject(BookmarkStore);
    bookmarkService = TestBed.inject(BookmarkService) as jasmine.SpyObj<BookmarkService>;
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(store.bookmarks()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.total()).toBe(0);
      expect(store.page()).toBe(1);
      expect(store.limit()).toBe(10);
    });
  });

  describe('loadBookmarks', () => {
    it('should load bookmarks successfully', async () => {
      bookmarkService.getBookmarks.and.returnValue(of(mockBookmarksResponse));

      await store.loadBookmarks();

      expect(store.loading()).toBe(false);
      expect(store.bookmarks()).toEqual(mockBookmarksResponse.data);
      expect(store.total()).toBe(mockBookmarksResponse.total);
      expect(store.error()).toBeNull();
    });

    it('should handle loading error', async () => {
      const error = new Error('Failed to load bookmarks');
      bookmarkService.getBookmarks.and.returnValue(throwError(() => error));

      await store.loadBookmarks();

      expect(store.loading()).toBe(false);
      expect(store.bookmarks()).toEqual([]);
      expect(store.error()).toBe(error.message);
    });

    it('should set loading state during request', () => {
      bookmarkService.getBookmarks.and.returnValue(of(mockBookmarksResponse));

      store.loadBookmarks();

      // Check loading state is set immediately
      expect(store.loading()).toBe(true);
    });
  });

  describe('createBookmark', () => {
    it('should create bookmark and update state', async () => {
      const newBookmark = mockBookmarksResponse.data[0];
      bookmarkService.createBookmark.and.returnValue(of(newBookmark));

      await store.createBookmark({
        title: 'Test Bookmark',
        url: 'https://example.com',
        description: 'Test description',
        tags: ['test']
      });

      expect(store.bookmarks()).toContain(newBookmark);
      expect(store.error()).toBeNull();
    });
  });

  describe('updateBookmark', () => {
    it('should update bookmark in state', async () => {
      // Set initial state
      store.patchState({ bookmarks: mockBookmarksResponse.data });

      const updatedBookmark = {
        ...mockBookmarksResponse.data[0],
        title: 'Updated Title'
      };

      bookmarkService.updateBookmark.and.returnValue(of(updatedBookmark));

      await store.updateBookmark('1', { title: 'Updated Title' });

      const bookmark = store.bookmarks().find(b => b.id === '1');
      expect(bookmark?.title).toBe('Updated Title');
    });
  });

  describe('deleteBookmark', () => {
    it('should remove bookmark from state', async () => {
      // Set initial state
      store.patchState({ bookmarks: mockBookmarksResponse.data });

      bookmarkService.deleteBookmark.and.returnValue(of({ success: true }));

      await store.deleteBookmark('1');

      expect(store.bookmarks().find(b => b.id === '1')).toBeUndefined();
    });
  });

  describe('computed properties', () => {
    it('should compute hasBookmarks correctly', () => {
      expect(store.hasBookmarks()).toBe(false);

      store.patchState({ bookmarks: mockBookmarksResponse.data });
      expect(store.hasBookmarks()).toBe(true);
    });

    it('should compute hasMore correctly', () => {
      store.patchState({ 
        bookmarks: mockBookmarksResponse.data,
        total: 20,
        page: 1,
        limit: 10
      });

      expect(store.hasMore()).toBe(true);

      store.patchState({ page: 2 });
      expect(store.hasMore()).toBe(false);
    });
  });
});
```

### Component Integration Testing

```typescript
// features/bookmarks/bookmark-list.component.integration.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BookmarkListComponent } from './bookmark-list.component';
import { BookmarkService } from './services/bookmark.service';
import { BookmarkStore } from './store/bookmark.store';
import { of } from 'rxjs';

describe('BookmarkListComponent Integration', () => {
  let component: BookmarkListComponent;
  let fixture: ComponentFixture<BookmarkListComponent>;
  let bookmarkService: jasmine.SpyObj<BookmarkService>;

  const mockBookmarksResponse = {
    data: [
      {
        id: '1',
        title: 'Test Bookmark 1',
        url: 'https://example1.com',
        description: 'Description 1',
        tags: ['tag1'],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      },
      {
        id: '2',
        title: 'Test Bookmark 2',
        url: 'https://example2.com',
        description: 'Description 2',
        tags: ['tag2'],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      }
    ],
    total: 2,
    page: 1,
    limit: 10
  };

  beforeEach(async () => {
    const bookmarkServiceSpy = jasmine.createSpyObj('BookmarkService', [
      'getBookmarks',
      'deleteBookmark'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        BookmarkListComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        BookmarkStore,
        { provide: BookmarkService, useValue: bookmarkServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookmarkListComponent);
    component = fixture.componentInstance;
    bookmarkService = TestBed.inject(BookmarkService) as jasmine.SpyObj<BookmarkService>;
  });

  it('should load and display bookmarks on init', async () => {
    bookmarkService.getBookmarks.and.returnValue(of(mockBookmarksResponse));

    fixture.detectChanges();
    await fixture.whenStable();

    const bookmarkCards = fixture.debugElement.queryAll(
      (el) => el.nativeElement.getAttribute('data-testid') === 'bookmark-card'
    );

    expect(bookmarkCards.length).toBe(2);
  });

  it('should show loading state', () => {
    bookmarkService.getBookmarks.and.returnValue(of(mockBookmarksResponse));

    // Before loading
    component.store.patchState({ loading: true });
    fixture.detectChanges();

    const loadingElement = fixture.debugElement.query(
      (el) => el.nativeElement.getAttribute('data-testid') === 'loading'
    );

    expect(loadingElement).toBeTruthy();
  });

  it('should show empty state when no bookmarks', async () => {
    bookmarkService.getBookmarks.and.returnValue(of({
      data: [],
      total: 0,
      page: 1,
      limit: 10
    }));

    fixture.detectChanges();
    await fixture.whenStable();

    const emptyStateElement = fixture.debugElement.query(
      (el) => el.nativeElement.getAttribute('data-testid') === 'empty-state'
    );

    expect(emptyStateElement).toBeTruthy();
  });

  it('should handle bookmark deletion', async () => {
    bookmarkService.getBookmarks.and.returnValue(of(mockBookmarksResponse));
    bookmarkService.deleteBookmark.and.returnValue(of({ success: true }));

    fixture.detectChanges();
    await fixture.whenStable();

    // Simulate delete action
    component.onDeleteBookmark('1');
    await fixture.whenStable();

    expect(bookmarkService.deleteBookmark).toHaveBeenCalledWith('1');
  });

  it('should filter bookmarks by search term', async () => {
    bookmarkService.getBookmarks.and.returnValue(of(mockBookmarksResponse));

    fixture.detectChanges();
    await fixture.whenStable();

    // Simulate search
    const searchInput = fixture.debugElement.query(
      (el) => el.nativeElement.getAttribute('data-testid') === 'search-input'
    );

    searchInput.nativeElement.value = 'Test Bookmark 1';
    searchInput.nativeElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(bookmarkService.getBookmarks).toHaveBeenCalledWith(
      jasmine.objectContaining({ search: 'Test Bookmark 1' })
    );
  });
});
```

## 🔧 Backend Testing

### Unit Testing with Jest

```typescript
// src/bookmarks/bookmark.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookmarkService } from './bookmark.service';
import { Bookmark } from './entities/bookmark.entity';
import { User } from '../users/entities/user.entity';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto/bookmark.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('BookmarkService', () => {
  let service: BookmarkService;
  let repository: Repository<Bookmark>;

  const mockUser: User = {
    id: 'user1',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockBookmark: Bookmark = {
    id: '1',
    title: 'Test Bookmark',
    url: 'https://example.com',
    description: 'Test description',
    tags: ['test'],
    user: mockUser,
    userId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Bookmark;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarkService,
        {
          provide: getRepositoryToken(Bookmark),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BookmarkService>(BookmarkService);
    repository = module.get<Repository<Bookmark>>(getRepositoryToken(Bookmark));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new bookmark', async () => {
      const createBookmarkDto: CreateBookmarkDto = {
        title: 'New Bookmark',
        url: 'https://new-example.com',
        description: 'New description',
        tags: ['new'],
      };

      const expectedBookmark = {
        ...createBookmarkDto,
        id: '2',
        user: mockUser,
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedBookmark);
      mockRepository.save.mockResolvedValue(expectedBookmark);

      const result = await service.create(createBookmarkDto, mockUser);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createBookmarkDto,
        user: mockUser,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedBookmark);
      expect(result).toEqual(expectedBookmark);
    });

    it('should handle duplicate URL error', async () => {
      const createBookmarkDto: CreateBookmarkDto = {
        title: 'Duplicate Bookmark',
        url: 'https://example.com',
        description: 'Duplicate',
        tags: ['duplicate'],
      };

      mockRepository.create.mockReturnValue(mockBookmark);
      mockRepository.save.mockRejectedValue({
        code: '23505', // PostgreSQL unique violation
        constraint: 'bookmark_user_url_unique',
      });

      await expect(service.create(createBookmarkDto, mockUser))
        .rejects
        .toThrow('Bookmark with this URL already exists');
    });
  });

  describe('findAll', () => {
    it('should return paginated bookmarks for user', async () => {
      const mockBookmarks = [mockBookmark];
      const mockTotal = 1;

      mockRepository.findAndCount.mockResolvedValue([mockBookmarks, mockTotal]);

      const result = await service.findAll(mockUser, {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        data: mockBookmarks,
        total: mockTotal,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter bookmarks by search term', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockBookmark], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(mockUser, {
        page: 1,
        limit: 10,
        search: 'test',
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(bookmark.title ILIKE :search OR bookmark.description ILIKE :search)',
        { search: '%test%' }
      );
    });
  });

  describe('findOne', () => {
    it('should return bookmark if user owns it', async () => {
      mockRepository.findOne.mockResolvedValue(mockBookmark);

      const result = await service.findOne('1', mockUser);

      expect(result).toEqual(mockBookmark);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', userId: mockUser.id },
        relations: ['user'],
      });
    });

    it('should throw NotFoundException if bookmark not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999', mockUser))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update bookmark if user owns it', async () => {
      const updateBookmarkDto: UpdateBookmarkDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const updatedBookmark = {
        ...mockBookmark,
        ...updateBookmarkDto,
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockBookmark);
      mockRepository.save.mockResolvedValue(updatedBookmark);

      const result = await service.update('1', updateBookmarkDto, mockUser);

      expect(result).toEqual(updatedBookmark);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockBookmark,
        ...updateBookmarkDto,
      });
    });

    it('should throw ForbiddenException if user does not own bookmark', async () => {
      const otherUserBookmark = {
        ...mockBookmark,
        userId: 'other-user',
        user: { ...mockUser, id: 'other-user' },
      };

      mockRepository.findOne.mockResolvedValue(otherUserBookmark);

      await expect(service.update('1', {}, mockUser))
        .rejects
        .toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete bookmark if user owns it', async () => {
      mockRepository.findOne.mockResolvedValue(mockBookmark);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1', mockUser);

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if bookmark not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999', mockUser))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});
```

### Controller Testing

```typescript
// src/bookmarks/bookmark.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto/bookmark.dto';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('BookmarkController', () => {
  let controller: BookmarkController;
  let service: BookmarkService;

  const mockUser: User = {
    id: 'user1',
    email: 'test@example.com',
    role: 'user',
  } as User;

  const mockBookmark = {
    id: '1',
    title: 'Test Bookmark',
    url: 'https://example.com',
    description: 'Test description',
    tags: ['test'],
    userId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBookmarkService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController],
      providers: [
        {
          provide: BookmarkService,
          useValue: mockBookmarkService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<BookmarkController>(BookmarkController);
    service = module.get<BookmarkService>(BookmarkService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a bookmark', async () => {
      const createBookmarkDto: CreateBookmarkDto = {
        title: 'New Bookmark',
        url: 'https://new-example.com',
        description: 'New description',
        tags: ['new'],
      };

      mockBookmarkService.create.mockResolvedValue(mockBookmark);

      const result = await controller.create(createBookmarkDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(createBookmarkDto, mockUser);
      expect(result).toEqual(mockBookmark);
    });
  });

  describe('findAll', () => {
    it('should return paginated bookmarks', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        data: [mockBookmark],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockBookmarkService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query, mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser, query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a bookmark', async () => {
      mockBookmarkService.findOne.mockResolvedValue(mockBookmark);

      const result = await controller.findOne('1', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('1', mockUser);
      expect(result).toEqual(mockBookmark);
    });
  });

  describe('update', () => {
    it('should update a bookmark', async () => {
      const updateBookmarkDto: UpdateBookmarkDto = {
        title: 'Updated Title',
      };

      const updatedBookmark = { ...mockBookmark, ...updateBookmarkDto };
      mockBookmarkService.update.mockResolvedValue(updatedBookmark);

      const result = await controller.update('1', updateBookmarkDto, mockUser);

      expect(service.update).toHaveBeenCalledWith('1', updateBookmarkDto, mockUser);
      expect(result).toEqual(updatedBookmark);
    });
  });

  describe('remove', () => {
    it('should delete a bookmark', async () => {
      mockBookmarkService.remove.mockResolvedValue(undefined);

      await controller.remove('1', mockUser);

      expect(service.remove).toHaveBeenCalledWith('1', mockUser);
    });
  });
});
```

### Integration Testing

```typescript
// test/bookmarks.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Bookmark } from '../src/bookmarks/entities/bookmark.entity';

describe('BookmarksController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    
    await app.init();

    // Create test user and get auth token
    const authResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201);

    authToken = authResponse.body.accessToken;
    testUser = authResponse.body.user;
  });

  afterAll(async () => {
    // Clean up test data
    await dataSource.getRepository(Bookmark).delete({});
    await dataSource.getRepository(User).delete({});
    await app.close();
  });

  describe('/bookmarks (POST)', () => {
    it('should create a new bookmark', () => {
      return request(app.getHttpServer())
        .post('/bookmarks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Bookmark',
          url: 'https://example.com',
          description: 'Test description',
          tags: ['test', 'example'],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe('Test Bookmark');
          expect(res.body.url).toBe('https://example.com');
          expect(res.body.userId).toBe(testUser.id);
        });
    });

    it('should return 400 for invalid URL', () => {
      return request(app.getHttpServer())
        .post('/bookmarks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Bookmark',
          url: 'not-a-valid-url',
          description: 'Test description',
        })
        .expect(400);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/bookmarks')
        .send({
          title: 'Unauthorized Bookmark',
          url: 'https://example.com',
        })
        .expect(401);
    });
  });

  describe('/bookmarks (GET)', () => {
    beforeEach(async () => {
      // Create test bookmarks
      await request(app.getHttpServer())
        .post('/bookmarks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Bookmark 1',
          url: 'https://example1.com',
          tags: ['tag1'],
        });

      await request(app.getHttpServer())
        .post('/bookmarks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Bookmark 2',
          url: 'https://example2.com',
          tags: ['tag2'],
        });
    });

    it('should return paginated bookmarks', () => {
      return request(app.getHttpServer())
        .get('/bookmarks?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.total).toBe(2);
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(10);
        });
    });

    it('should filter bookmarks by search term', () => {
      return request(app.getHttpServer())
        .get('/bookmarks?search=Bookmark 1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].title).toBe('Bookmark 1');
        });
    });

    it('should filter bookmarks by tags', () => {
      return request(app.getHttpServer())
        .get('/bookmarks?tags=tag1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].tags).toContain('tag1');
        });
    });
  });

  describe('/bookmarks/:id (PUT)', () => {
    let bookmarkId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/bookmarks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Title',
          url: 'https://original.com',
          description: 'Original description',
        });

      bookmarkId = response.body.id;
    });

    it('should update bookmark', () => {
      return request(app.getHttpServer())
        .put(`/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Title');
          expect(res.body.description).toBe('Updated description');
          expect(res.body.url).toBe('https://original.com'); // Should remain unchanged
        });
    });

    it('should return 404 for non-existent bookmark', () => {
      return request(app.getHttpServer())
        .put('/bookmarks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
        })
        .expect(404);
    });
  });

  describe('/bookmarks/:id (DELETE)', () => {
    let bookmarkId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/bookmarks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'To Be Deleted',
          url: 'https://delete-me.com',
        });

      bookmarkId = response.body.id;
    });

    it('should delete bookmark', async () => {
      await request(app.getHttpServer())
        .delete(`/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify bookmark is deleted
      await request(app.getHttpServer())
        .get(`/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

## 🎭 E2E Testing with Playwright

### E2E Test Setup

```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: [
    {
      command: 'npm run start:backend',
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run start:frontend',
      port: 4200,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

### Page Object Model

```typescript
// e2e/pages/bookmark-list.page.ts
import { Page, Locator } from '@playwright/test';

export class BookmarkListPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly addBookmarkButton: Locator;
  readonly bookmarkCards: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('search-input');
    this.addBookmarkButton = page.getByTestId('add-bookmark-button');
    this.bookmarkCards = page.getByTestId('bookmark-card');
    this.loadingSpinner = page.getByTestId('loading-spinner');
    this.emptyState = page.getByTestId('empty-state');
    this.paginationNext = page.getByTestId('pagination-next');
    this.paginationPrev = page.getByTestId('pagination-prev');
  }

  async goto() {
    await this.page.goto('/bookmarks');
  }

  async searchBookmarks(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async clickAddBookmark() {
    await this.addBookmarkButton.click();
  }

  async getBookmarkCount() {
    return await this.bookmarkCards.count();
  }

  async getBookmarkByTitle(title: string) {
    return this.page.getByTestId('bookmark-card').filter({ hasText: title });
  }

  async editBookmark(title: string) {
    const bookmark = await this.getBookmarkByTitle(title);
    await bookmark.getByTestId('edit-button').click();
  }

  async deleteBookmark(title: string) {
    const bookmark = await this.getBookmarkByTitle(title);
    await bookmark.getByTestId('delete-button').click();
    
    // Confirm deletion in modal
    await this.page.getByTestId('confirm-delete-button').click();
  }

  async waitForBookmarksToLoad() {
    await this.loadingSpinner.waitFor({ state: 'hidden' });
  }

  async goToNextPage() {
    await this.paginationNext.click();
    await this.waitForBookmarksToLoad();
  }

  async goToPreviousPage() {
    await this.paginationPrev.click();
    await this.waitForBookmarksToLoad();
  }
}
```

### E2E Test Cases

```typescript
// e2e/tests/bookmark-management.spec.ts
import { test, expect } from '@playwright/test';
import { BookmarkListPage } from '../pages/bookmark-list.page';
import { BookmarkFormPage } from '../pages/bookmark-form.page';
import { LoginPage } from '../pages/login.page';

test.describe('Bookmark Management', () => {
  let bookmarkListPage: BookmarkListPage;
  let bookmarkFormPage: BookmarkFormPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    bookmarkListPage = new BookmarkListPage(page);
    bookmarkFormPage = new BookmarkFormPage(page);
    loginPage = new LoginPage(page);

    // Login before each test
    await loginPage.goto();
    await loginPage.login('test@example.com', 'Test123!@#');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display bookmark list', async ({ page }) => {
    await bookmarkListPage.goto();
    await bookmarkListPage.waitForBookmarksToLoad();

    // Should show bookmarks or empty state
    const bookmarkCount = await bookmarkListPage.getBookmarkCount();
    if (bookmarkCount === 0) {
      await expect(bookmarkListPage.emptyState).toBeVisible();
    } else {
      await expect(bookmarkListPage.bookmarkCards.first()).toBeVisible();
    }
  });

  test('should create a new bookmark', async ({ page }) => {
    await bookmarkListPage.goto();
    await bookmarkListPage.clickAddBookmark();

    await expect(page).toHaveURL('/bookmarks/new');

    await bookmarkFormPage.fillForm({
      title: 'Test Bookmark E2E',
      url: 'https://test-e2e.example.com',
      description: 'Created via E2E test',
      tags: ['e2e', 'test'],
    });

    await bookmarkFormPage.submit();

    // Should redirect to bookmark list
    await expect(page).toHaveURL('/bookmarks');

    // Should show success message
    await expect(page.getByText('Bookmark created successfully')).toBeVisible();

    // Should display the new bookmark
    const newBookmark = await bookmarkListPage.getBookmarkByTitle('Test Bookmark E2E');
    await expect(newBookmark).toBeVisible();
  });

  test('should search bookmarks', async ({ page }) => {
    await bookmarkListPage.goto();
    await bookmarkListPage.waitForBookmarksToLoad();

    // Create a test bookmark first
    await bookmarkListPage.clickAddBookmark();
    await bookmarkFormPage.fillForm({
      title: 'Searchable Bookmark',
      url: 'https://searchable.example.com',
      description: 'This bookmark should be searchable',
    });
    await bookmarkFormPage.submit();

    // Search for the bookmark
    await bookmarkListPage.searchBookmarks('Searchable');
    await bookmarkListPage.waitForBookmarksToLoad();

    // Should show only matching bookmarks
    const searchResults = await bookmarkListPage.getBookmarkCount();
    expect(searchResults).toBeGreaterThan(0);

    const searchableBookmark = await bookmarkListPage.getBookmarkByTitle('Searchable Bookmark');
    await expect(searchableBookmark).toBeVisible();
  });

  test('should edit a bookmark', async ({ page }) => {
    // Create a bookmark to edit
    await bookmarkListPage.goto();
    await bookmarkListPage.clickAddBookmark();
    await bookmarkFormPage.fillForm({
      title: 'Original Title',
      url: 'https://original.example.com',
      description: 'Original description',
    });
    await bookmarkFormPage.submit();

    // Edit the bookmark
    await bookmarkListPage.editBookmark('Original Title');
    await expect(page).toHaveURL(/\/bookmarks\/.*\/edit/);

    await bookmarkFormPage.fillForm({
      title: 'Updated Title',
      description: 'Updated description',
    });
    await bookmarkFormPage.submit();

    // Should redirect to bookmark list
    await expect(page).toHaveURL('/bookmarks');

    // Should show success message
    await expect(page.getByText('Bookmark updated successfully')).toBeVisible();

    // Should display the updated bookmark
    const updatedBookmark = await bookmarkListPage.getBookmarkByTitle('Updated Title');
    await expect(updatedBookmark).toBeVisible();
  });

  test('should delete a bookmark', async ({ page }) => {
    // Create a bookmark to delete
    await bookmarkListPage.goto();
    await bookmarkListPage.clickAddBookmark();
    await bookmarkFormPage.fillForm({
      title: 'To Be Deleted',
      url: 'https://delete-me.example.com',
      description: 'This bookmark will be deleted',
    });
    await bookmarkFormPage.submit();

    // Delete the bookmark
    await bookmarkListPage.deleteBookmark('To Be Deleted');

    // Should show success message
    await expect(page.getByText('Bookmark deleted successfully')).toBeVisible();

    // Should not display the deleted bookmark
    const deletedBookmark = bookmarkListPage.getBookmarkByTitle('To Be Deleted');
    await expect(deletedBookmark).not.toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // This test assumes there are enough bookmarks to paginate
    await bookmarkListPage.goto();
    await bookmarkListPage.waitForBookmarksToLoad();

    // Check if pagination is available
    if (await bookmarkListPage.paginationNext.isVisible()) {
      const firstPageBookmarks = await bookmarkListPage.getBookmarkCount();
      
      await bookmarkListPage.goToNextPage();
      
      const secondPageBookmarks = await bookmarkListPage.getBookmarkCount();
      
      // Should have different bookmarks on second page
      expect(secondPageBookmarks).toBeGreaterThan(0);
      
      // Go back to first page
      await bookmarkListPage.goToPreviousPage();
      
      const backToFirstPageBookmarks = await bookmarkListPage.getBookmarkCount();
      expect(backToFirstPageBookmarks).toBe(firstPageBookmarks);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await bookmarkListPage.goto();
    await bookmarkListPage.waitForBookmarksToLoad();

    // Should display mobile-friendly layout
    await expect(bookmarkListPage.bookmarkCards.first()).toBeVisible();
    
    // Mobile navigation should be accessible
    const mobileMenu = page.getByTestId('mobile-menu-button');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.getByTestId('mobile-nav')).toBeVisible();
    }
  });
});
```

## 📊 Performance Testing

### Load Testing with Artillery

```yaml
# performance/load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 20
      name: "Sustained load"
  variables:
    testEmail: "test-{{ $randomString() }}@example.com"
    testPassword: "Test123!@#"

scenarios:
  - name: "User Registration and Bookmark Management"
    weight: 70
    flow:
      - post:
          url: "/auth/register"
          json:
            email: "{{ testEmail }}"
            password: "{{ testPassword }}"
            firstName: "Test"
            lastName: "User"
          capture:
            - json: "$.accessToken"
              as: "authToken"
      
      - post:
          url: "/bookmarks"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            title: "Load Test Bookmark {{ $randomString() }}"
            url: "https://example-{{ $randomString() }}.com"
            description: "Created during load test"
            tags: ["load-test", "performance"]
          capture:
            - json: "$.id"
              as: "bookmarkId"
      
      - get:
          url: "/bookmarks"
          headers:
            Authorization: "Bearer {{ authToken }}"
          qs:
            page: 1
            limit: 10
      
      - get:
          url: "/bookmarks/{{ bookmarkId }}"
          headers:
            Authorization: "Bearer {{ authToken }}"
      
      - put:
          url: "/bookmarks/{{ bookmarkId }}"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            title: "Updated Load Test Bookmark"
            description: "Updated during load test"
      
      - delete:
          url: "/bookmarks/{{ bookmarkId }}"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "Anonymous User Browsing"
    weight: 30
    flow:
      - get:
          url: "/health"
      
      - get:
          url: "/auth/login"
      
      - post:
          url: "/auth/login"
          json:
            email: "existing-user@example.com"
            password: "ExistingPassword123"
          capture:
            - json: "$.accessToken"
              as: "authToken"
      
      - get:
          url: "/bookmarks"
          headers:
            Authorization: "Bearer {{ authToken }}"
          qs:
            page: "{{ $randomInt(1, 5) }}"
            limit: 20
```

### Frontend Performance Testing

```typescript
// performance/lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4200/',
        'http://localhost:4200/bookmarks',
        'http://localhost:4200/collections',
        'http://localhost:4200/auth/login',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

## 🔧 Test Utilities

### Test Data Factory

```typescript
// test/factories/bookmark.factory.ts
import { Bookmark } from '../../src/bookmarks/entities/bookmark.entity';
import { User } from '../../src/users/entities/user.entity';

export class BookmarkFactory {
  static create(overrides: Partial<Bookmark> = {}): Bookmark {
    return {
      id: 'bookmark-' + Math.random().toString(36).substr(2, 9),
      title: 'Test Bookmark',
      url: 'https://example.com',
      description: 'Test description',
      tags: ['test'],
      userId: 'user-1',
      user: UserFactory.create(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as Bookmark;
  }

  static createMany(count: number, overrides: Partial<Bookmark> = {}): Bookmark[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        id: `bookmark-${index + 1}`,
        title: `Test Bookmark ${index + 1}`,
        url: `https://example${index + 1}.com`,
        ...overrides,
      })
    );
  }
}

export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    return {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as User;
  }
}
```

### Custom Test Matchers

```typescript
// test/matchers/custom-matchers.ts
import { expect } from '@jest/globals';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidBookmark(): R;
      toHaveValidPagination(): R;
      toBeValidApiResponse(): R;
    }
  }
}

expect.extend({
  toBeValidBookmark(received) {
    const pass = received &&
      typeof received.id === 'string' &&
      typeof received.title === 'string' &&
      typeof received.url === 'string' &&
      Array.isArray(received.tags) &&
      received.createdAt instanceof Date &&
      received.updatedAt instanceof Date;

    return {
      message: () => `expected ${received} to be a valid bookmark`,
      pass,
    };
  },

  toHaveValidPagination(received) {
    const pass = received &&
      typeof received.data === 'object' &&
      Array.isArray(received.data) &&
      typeof received.total === 'number' &&
      typeof received.page === 'number' &&
      typeof received.limit === 'number' &&
      typeof received.totalPages === 'number';

    return {
      message: () => `expected ${received} to have valid pagination`,
      pass,
    };
  },

  toBeValidApiResponse(received) {
    const pass = received &&
      (received.data !== undefined || received.error !== undefined) &&
      typeof received.success === 'boolean';

    return {
      message: () => `expected ${received} to be a valid API response`,
      pass,
    };
  },
});
```

---

**Cập nhật lần cuối**: 2024-12-19  
**Phiên bản**: 1.0.0  
**Tác giả**: My Collection Team