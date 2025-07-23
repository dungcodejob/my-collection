# State Management - Quản lý State với NgRx Signals

## 📋 Tổng quan

Tài liệu này mô tả cách sử dụng NgRx Signals để quản lý state trong ứng dụng My Collection. NgRx Signals cung cấp một cách tiếp cận hiện đại, type-safe và reactive để quản lý state trong Angular 20+.

## 🎯 Nguyên tắc State Management

### Core Principles

1. **Single Source of Truth**: Mỗi piece of state chỉ có một nơi lưu trữ
2. **Immutability**: State không được mutate trực tiếp
3. **Predictability**: State changes phải predictable và traceable
4. **Type Safety**: Tận dụng TypeScript để đảm bảo type safety

### NgRx Signals Benefits

- **Simpler API**: Ít boilerplate code hơn so với traditional NgRx
- **Better Performance**: Fine-grained reactivity với signals
- **Type Safety**: Full TypeScript support
- **Developer Experience**: Better debugging và testing

## 🏗️ Store Architecture

### Store Structure

```typescript
// Base store interface
interface BaseState {
  loading: boolean;
  error: string | null;
}

// Feature-specific state
interface BookmarkState extends BaseState {
  bookmarks: Bookmark[];
  selectedBookmark: Bookmark | null;
  filters: BookmarkFilters;
  pagination: PaginationState;
}
```

### Store Creation Pattern

```typescript
export const BookmarkStore = signalStore(
  { providedIn: 'root' },
  
  // 1. Define initial state
  withState<BookmarkState>({
    bookmarks: [],
    selectedBookmark: null,
    filters: {
      search: '',
      tags: [],
      collections: []
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0
    },
    loading: false,
    error: null
  }),
  
  // 2. Add computed values
  withComputed(({ bookmarks, filters, pagination }) => ({
    filteredBookmarks: computed(() => 
      filterBookmarks(bookmarks(), filters())
    ),
    hasNextPage: computed(() => 
      pagination().page * pagination().limit < pagination().total
    ),
    totalPages: computed(() => 
      Math.ceil(pagination().total / pagination().limit)
    )
  })),
  
  // 3. Add methods
  withMethods((store, bookmarkService = inject(BookmarkService)) => ({
    // Async operations
    async loadBookmarks() {
      patchState(store, { loading: true, error: null });
      try {
        const result = await bookmarkService.getBookmarks({
          ...store.filters(),
          ...store.pagination()
        });
        patchState(store, {
          bookmarks: result.data,
          pagination: { ...store.pagination(), total: result.total },
          loading: false
        });
      } catch (error) {
        patchState(store, { 
          error: error.message, 
          loading: false 
        });
      }
    },
    
    // Sync operations
    setFilters(filters: Partial<BookmarkFilters>) {
      patchState(store, {
        filters: { ...store.filters(), ...filters },
        pagination: { ...store.pagination(), page: 1 }
      });
    },
    
    selectBookmark(bookmark: Bookmark | null) {
      patchState(store, { selectedBookmark: bookmark });
    }
  }))
);
```

## 🔧 Store Patterns

### 1. Loading States

```typescript
// Loading state pattern
interface LoadingState {
  loading: boolean;
  error: string | null;
}

// Usage in store
withMethods((store, service = inject(Service)) => ({
  async loadData() {
    patchState(store, { loading: true, error: null });
    try {
      const data = await service.getData();
      patchState(store, { data, loading: false });
    } catch (error) {
      patchState(store, { 
        error: error.message, 
        loading: false 
      });
    }
  }
}))
```

### 2. Pagination Pattern

```typescript
interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

// Pagination methods
withMethods((store) => ({
  nextPage() {
    const current = store.pagination();
    if (current.page * current.limit < current.total) {
      patchState(store, {
        pagination: { ...current, page: current.page + 1 }
      });
    }
  },
  
  previousPage() {
    const current = store.pagination();
    if (current.page > 1) {
      patchState(store, {
        pagination: { ...current, page: current.page - 1 }
      });
    }
  },
  
  setPageSize(limit: number) {
    patchState(store, {
      pagination: { ...store.pagination(), limit, page: 1 }
    });
  }
}))
```

### 3. Filter Pattern

```typescript
interface FilterState<T> {
  filters: T;
  appliedFilters: T;
}

// Filter methods
withMethods((store) => ({
  updateFilter<K extends keyof T>(key: K, value: T[K]) {
    patchState(store, {
      filters: { ...store.filters(), [key]: value }
    });
  },
  
  applyFilters() {
    patchState(store, {
      appliedFilters: { ...store.filters() }
    });
  },
  
  clearFilters() {
    const emptyFilters = createEmptyFilters();
    patchState(store, {
      filters: emptyFilters,
      appliedFilters: emptyFilters
    });
  }
}))
```

### 4. CRUD Operations Pattern

```typescript
// CRUD methods pattern
withMethods((store, service = inject(Service)) => ({
  // Create
  async create(data: CreateDto) {
    try {
      const item = await service.create(data);
      patchState(store, {
        items: [...store.items(), item]
      });
      return item;
    } catch (error) {
      patchState(store, { error: error.message });
      throw error;
    }
  },
  
  // Update
  async update(id: string, data: UpdateDto) {
    try {
      const updated = await service.update(id, data);
      patchState(store, {
        items: store.items().map(item => 
          item.id === id ? updated : item
        )
      });
      return updated;
    } catch (error) {
      patchState(store, { error: error.message });
      throw error;
    }
  },
  
  // Delete
  async delete(id: string) {
    try {
      await service.delete(id);
      patchState(store, {
        items: store.items().filter(item => item.id !== id)
      });
    } catch (error) {
      patchState(store, { error: error.message });
      throw error;
    }
  }
}))
```

## 🧩 Component Integration

### Using Store in Components

```typescript
@Component({
  selector: 'app-bookmark-list',
  standalone: true,
  template: `
    <div class="bookmark-list">
      @if (store.loading()) {
        <app-loading-spinner />
      }
      
      @if (store.error()) {
        <app-error-message [message]="store.error()" />
      }
      
      @for (bookmark of store.filteredBookmarks(); track bookmark.id) {
        <app-bookmark-card 
          [bookmark]="bookmark"
          [selected]="bookmark.id === store.selectedBookmark()?.id"
          (click)="store.selectBookmark(bookmark)"
          (edit)="onEdit(bookmark)"
          (delete)="store.delete(bookmark.id)" />
      }
      
      <app-pagination
        [currentPage]="store.pagination().page"
        [totalPages]="store.totalPages()"
        [hasNext]="store.hasNextPage()"
        (pageChange)="onPageChange($event)" />
    </div>
  `
})
export class BookmarkListComponent implements OnInit {
  store = inject(BookmarkStore);
  
  ngOnInit() {
    this.store.loadBookmarks();
  }
  
  onEdit(bookmark: Bookmark) {
    // Navigate to edit page or open modal
  }
  
  onPageChange(page: number) {
    this.store.setPage(page);
    this.store.loadBookmarks();
  }
}
```

### Reactive Forms Integration

```typescript
@Component({
  selector: 'app-bookmark-filter',
  template: `
    <form [formGroup]="filterForm" class="filter-form">
      <input 
        formControlName="search"
        placeholder="Search bookmarks..."
        type="text" />
      
      <app-tag-select
        formControlName="tags"
        [options]="availableTags()" />
      
      <select formControlName="sortBy">
        <option value="createdAt">Date Created</option>
        <option value="title">Title</option>
        <option value="url">URL</option>
      </select>
    </form>
  `
})
export class BookmarkFilterComponent implements OnInit {
  store = inject(BookmarkStore);
  
  filterForm = this.fb.group({
    search: [''],
    tags: [[]],
    sortBy: ['createdAt']
  });
  
  ngOnInit() {
    // Sync form with store
    this.filterForm.patchValue(this.store.filters());
    
    // React to form changes
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(filters => {
      this.store.setFilters(filters);
      this.store.loadBookmarks();
    });
  }
}
```

## 🔄 Store Communication

### Cross-Store Communication

```typescript
// Using computed signals for cross-store reactivity
export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState({
    stats: null as DashboardStats | null
  }),
  withMethods((store, 
    bookmarkStore = inject(BookmarkStore),
    collectionStore = inject(CollectionStore)
  ) => ({
    // Computed stats based on other stores
    computedStats: computed(() => ({
      totalBookmarks: bookmarkStore.bookmarks().length,
      totalCollections: collectionStore.collections().length,
      recentActivity: this.getRecentActivity()
    })),
    
    async refreshStats() {
      const stats = await this.dashboardService.getStats();
      patchState(store, { stats });
    }
  }))
);
```

### Event-Driven Communication

```typescript
// Using RxJS subjects for loose coupling
@Injectable({ providedIn: 'root' })
export class StoreEventService {
  private bookmarkCreated$ = new Subject<Bookmark>();
  private bookmarkDeleted$ = new Subject<string>();
  
  onBookmarkCreated = this.bookmarkCreated$.asObservable();
  onBookmarkDeleted = this.bookmarkDeleted$.asObservable();
  
  emitBookmarkCreated(bookmark: Bookmark) {
    this.bookmarkCreated$.next(bookmark);
  }
  
  emitBookmarkDeleted(id: string) {
    this.bookmarkDeleted$.next(id);
  }
}

// In stores
withMethods((store, eventService = inject(StoreEventService)) => ({
  async createBookmark(data: CreateBookmarkDto) {
    const bookmark = await this.service.create(data);
    patchState(store, { bookmarks: [...store.bookmarks(), bookmark] });
    
    // Notify other stores
    eventService.emitBookmarkCreated(bookmark);
    
    return bookmark;
  }
}))
```

## 🧪 Testing Stores

### Unit Testing

```typescript
describe('BookmarkStore', () => {
  let store: InstanceType<typeof BookmarkStore>;
  let bookmarkService: jasmine.SpyObj<BookmarkService>;
  
  beforeEach(() => {
    const spy = jasmine.createSpyObj('BookmarkService', ['getBookmarks', 'create']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: BookmarkService, useValue: spy }
      ]
    });
    
    store = TestBed.inject(BookmarkStore);
    bookmarkService = TestBed.inject(BookmarkService) as jasmine.SpyObj<BookmarkService>;
  });
  
  it('should load bookmarks', async () => {
    const mockBookmarks = [
      { id: '1', title: 'Test Bookmark', url: 'https://test.com' }
    ];
    
    bookmarkService.getBookmarks.and.returnValue(
      Promise.resolve({ data: mockBookmarks, total: 1 })
    );
    
    await store.loadBookmarks();
    
    expect(store.bookmarks()).toEqual(mockBookmarks);
    expect(store.loading()).toBe(false);
  });
  
  it('should handle errors', async () => {
    const error = new Error('Network error');
    bookmarkService.getBookmarks.and.rejectWith(error);
    
    await store.loadBookmarks();
    
    expect(store.error()).toBe('Network error');
    expect(store.loading()).toBe(false);
  });
  
  it('should filter bookmarks', () => {
    const bookmarks = [
      { id: '1', title: 'Angular Guide', tags: ['angular'] },
      { id: '2', title: 'React Tutorial', tags: ['react'] }
    ];
    
    patchState(store, { bookmarks });
    store.setFilters({ search: 'Angular' });
    
    expect(store.filteredBookmarks()).toHaveLength(1);
    expect(store.filteredBookmarks()[0].title).toBe('Angular Guide');
  });
});
```

### Integration Testing

```typescript
describe('BookmarkStore Integration', () => {
  let store: InstanceType<typeof BookmarkStore>;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookmarkService]
    });
    
    store = TestBed.inject(BookmarkStore);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should load and filter bookmarks', async () => {
    const mockResponse = {
      data: [
        { id: '1', title: 'Test 1', tags: ['tag1'] },
        { id: '2', title: 'Test 2', tags: ['tag2'] }
      ],
      total: 2
    };
    
    // Start loading
    const loadPromise = store.loadBookmarks();
    
    // Verify HTTP request
    const req = httpMock.expectOne('/api/bookmarks');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
    
    await loadPromise;
    
    // Verify state
    expect(store.bookmarks()).toHaveLength(2);
    expect(store.pagination().total).toBe(2);
    
    // Test filtering
    store.setFilters({ search: 'Test 1' });
    expect(store.filteredBookmarks()).toHaveLength(1);
  });
});
```

## 📊 Performance Optimization

### Memoization

```typescript
// Memoized computed values
withComputed(({ bookmarks, filters }) => ({
  expensiveComputation: computed(() => {
    // Use memoization for expensive operations
    return memoize((bookmarks: Bookmark[], filters: Filters) => {
      return performExpensiveCalculation(bookmarks, filters);
    })(bookmarks(), filters());
  })
}))
```

### Lazy Loading

```typescript
// Lazy loading pattern
withMethods((store) => ({
  async loadBookmarkDetails(id: string) {
    const existing = store.bookmarks().find(b => b.id === id);
    if (existing?.details) {
      return existing;
    }
    
    const details = await this.service.getBookmarkDetails(id);
    patchState(store, {
      bookmarks: store.bookmarks().map(b => 
        b.id === id ? { ...b, details } : b
      )
    });
    
    return { ...existing, details };
  }
}))
```

### Pagination Optimization

```typescript
// Virtual pagination for large datasets
withState({
  virtualBookmarks: new Map<number, Bookmark[]>(), // page -> bookmarks
  loadedPages: new Set<number>()
}),

withMethods((store) => ({
  async loadPage(page: number) {
    if (store.loadedPages().has(page)) {
      return;
    }
    
    const bookmarks = await this.service.getBookmarks({ page });
    
    patchState(store, {
      virtualBookmarks: new Map(store.virtualBookmarks()).set(page, bookmarks),
      loadedPages: new Set(store.loadedPages()).add(page)
    });
  },
  
  getBookmarksForPage: computed(() => (page: number) => {
    return store.virtualBookmarks().get(page) || [];
  })
}))
```

## 🔧 Best Practices

### 1. Store Organization

```typescript
// ✅ Good: Feature-based stores
export const BookmarkStore = signalStore(/* ... */);
export const CollectionStore = signalStore(/* ... */);
export const TagStore = signalStore(/* ... */);

// ❌ Bad: Monolithic store
export const AppStore = signalStore({
  bookmarks: [],
  collections: [],
  tags: [],
  users: [],
  // ... too many concerns
});
```

### 2. State Shape

```typescript
// ✅ Good: Normalized state
interface BookmarkState {
  bookmarks: Record<string, Bookmark>; // normalized by ID
  bookmarkIds: string[]; // ordered list
  selectedBookmarkId: string | null;
}

// ❌ Bad: Nested state
interface BookmarkState {
  bookmarks: {
    data: Bookmark[];
    meta: {
      selected: Bookmark | null;
      filters: any;
    };
  };
}
```

### 3. Error Handling

```typescript
// ✅ Good: Structured error handling
interface ErrorState {
  error: {
    message: string;
    code?: string;
    timestamp: Date;
  } | null;
}

withMethods((store) => ({
  handleError(error: any) {
    patchState(store, {
      error: {
        message: error.message || 'An error occurred',
        code: error.code,
        timestamp: new Date()
      },
      loading: false
    });
  },
  
  clearError() {
    patchState(store, { error: null });
  }
}))
```

### 4. Type Safety

```typescript
// ✅ Good: Strong typing
interface TypedFilters {
  search: string;
  tags: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

// ❌ Bad: Weak typing
interface Filters {
  [key: string]: any;
}
```

## 🚀 Advanced Patterns

### 1. Store Composition

```typescript
// Composable store features
export function withPagination<T>() {
  return signalStoreFeature(
    withState<PaginationState>({
      page: 1,
      limit: 20,
      total: 0
    }),
    withComputed(({ page, limit, total }) => ({
      hasNextPage: computed(() => page() * limit() < total()),
      totalPages: computed(() => Math.ceil(total() / limit()))
    })),
    withMethods((store) => ({
      nextPage() {
        if (store.hasNextPage()) {
          patchState(store, { page: store.page() + 1 });
        }
      },
      previousPage() {
        if (store.page() > 1) {
          patchState(store, { page: store.page() - 1 });
        }
      }
    }))
  );
}

// Usage
export const BookmarkStore = signalStore(
  { providedIn: 'root' },
  withState<BookmarkState>(initialState),
  withPagination(),
  withMethods(/* ... */)
);
```

### 2. Store Middleware

```typescript
// Logging middleware
export function withLogging() {
  return signalStoreFeature(
    withMethods((store) => {
      const originalPatchState = patchState;
      
      return {
        loggedPatchState: (updates: any) => {
          console.log('State update:', updates);
          return originalPatchState(store, updates);
        }
      };
    })
  );
}
```

### 3. Optimistic Updates

```typescript
withMethods((store, service = inject(Service)) => ({
  async optimisticUpdate(id: string, updates: Partial<Bookmark>) {
    // Apply optimistic update
    const originalBookmark = store.bookmarks().find(b => b.id === id);
    patchState(store, {
      bookmarks: store.bookmarks().map(b => 
        b.id === id ? { ...b, ...updates } : b
      )
    });
    
    try {
      // Confirm with server
      const updated = await service.update(id, updates);
      patchState(store, {
        bookmarks: store.bookmarks().map(b => 
          b.id === id ? updated : b
        )
      });
    } catch (error) {
      // Revert on error
      patchState(store, {
        bookmarks: store.bookmarks().map(b => 
          b.id === id ? originalBookmark! : b
        ),
        error: error.message
      });
    }
  }
}))
```

---

**Cập nhật lần cuối**: 2024-12-19  
**Phiên bản**: 1.0.0  
**Tác giả**: My Collection Team