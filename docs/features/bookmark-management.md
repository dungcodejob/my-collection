# Bookmark Management Feature Documentation

## 📚 Tổng quan

Bookmark Management là core feature của My Collection, cho phép users lưu trữ, tổ chức và quản lý các liên kết web một cách hiệu quả. Feature này được xây dựng với Angular 20+ và NgRx Signals cho frontend, NestJS cho backend.

## 🎯 Mục tiêu

- **Lưu trữ linh hoạt**: Cho phép users save bất kỳ URL nào với metadata
- **Tổ chức thông minh**: Hệ thống tags và collections để categorize
- **Tìm kiếm nhanh**: Full-text search và filtering
- **Trải nghiệm mượt**: Real-time updates và responsive UI
- **Chia sẻ dễ dàng**: Export/import và sharing capabilities

## 🏗️ Kiến trúc

### 📱 Frontend Architecture

```
libs/web/feature/bookmark/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── bookmark-card/
│   │   │   ├── bookmark-list/
│   │   │   ├── bookmark-detail-dialog/
│   │   │   ├── bookmark-form/
│   │   │   └── bookmark-search/
│   │   ├── services/
│   │   │   ├── bookmark.service.ts
│   │   │   └── bookmark-metadata.service.ts
│   │   ├── store/
│   │   │   ├── bookmark.store.ts
│   │   │   └── bookmark-search.store.ts
│   │   ├── models/
│   │   │   ├── bookmark.interface.ts
│   │   │   └── bookmark-dto.interface.ts
│   │   └── utils/
│   │       ├── bookmark.utils.ts
│   │       └── url.utils.ts
│   └── index.ts
```

### 🔧 Backend Architecture

```
apps/server/src/bookmark/
├── entities/
│   └── bookmark.entity.ts
├── dto/
│   ├── create-bookmark.dto.ts
│   ├── update-bookmark.dto.ts
│   └── bookmark-query.dto.ts
├── controllers/
│   └── bookmark.controller.ts
├── services/
│   ├── bookmark.service.ts
│   └── bookmark-metadata.service.ts
├── repositories/
│   └── bookmark.repository.ts
└── bookmark.module.ts
```

## 📊 Data Models

### 🎯 Frontend Models

```typescript
// bookmark.interface.ts
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  tags: string[];
  collectionId?: string;
  collection?: Collection;
  metadata?: BookmarkMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookmarkMetadata {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
}

export interface BookmarkCreateRequest {
  title: string;
  url: string;
  description?: string;
  tags: string[];
  collectionId?: string;
}

export interface BookmarkUpdateRequest {
  title?: string;
  description?: string;
  tags?: string[];
  collectionId?: string;
}

export interface BookmarkQuery {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  collectionId?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
```

### 🗄️ Backend Entity

```typescript
// bookmark.entity.ts
@Entity()
export class Bookmark {
  @PrimaryKey()
  id: string = v4();

  @Property()
  title: string;

  @Property()
  url: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  favicon?: string;

  @Property({ type: 'json' })
  tags: string[] = [];

  @Property({ type: 'json', nullable: true })
  metadata?: BookmarkMetadata;

  @ManyToOne(() => Collection, { nullable: true })
  collection?: Collection;

  @ManyToOne(() => User)
  user: User;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
```

## 🎨 Components

### 📋 BookmarkListComponent

**Mục đích**: Hiển thị danh sách bookmarks với pagination và filtering

**Features**:
- Grid/List view toggle
- Infinite scroll hoặc pagination
- Real-time search
- Tag filtering
- Collection filtering
- Sorting options
- Bulk actions (delete, move to collection)

**Inputs**:
```typescript
@Input() viewMode = signal<'grid' | 'list'>('grid');
@Input() showFilters = signal(true);
@Input() collectionId = signal<string | null>(null);
```

**Outputs**:
```typescript
@Output() bookmarkSelected = new EventEmitter<Bookmark>();
@Output() bookmarkEdit = new EventEmitter<Bookmark>();
@Output() bookmarkDelete = new EventEmitter<string>();
```

### 🎴 BookmarkCardComponent

**Mục đích**: Hiển thị individual bookmark trong card format

**Features**:
- Favicon display
- Title và description
- Tags display
- Quick actions (edit, delete, share)
- Hover effects
- Accessibility support

**Inputs**:
```typescript
@Input() bookmark = input.required<Bookmark>();
@Input() showActions = input(true);
@Input() compact = input(false);
```

**Outputs**:
```typescript
@Output() edit = new EventEmitter<void>();
@Output() delete = new EventEmitter<void>();
@Output() share = new EventEmitter<void>();
@Output() openUrl = new EventEmitter<void>();
```

### 📝 BookmarkFormComponent

**Mục đích**: Form để create/edit bookmarks

**Features**:
- URL validation
- Auto-fetch metadata
- Tag input với autocomplete
- Collection selection
- Form validation
- Loading states

**Inputs**:
```typescript
@Input() bookmark = input<Bookmark | null>(null);
@Input() mode = input<'create' | 'edit'>('create');
```

**Outputs**:
```typescript
@Output() save = new EventEmitter<BookmarkCreateRequest | BookmarkUpdateRequest>();
@Output() cancel = new EventEmitter<void>();
```

### 🔍 BookmarkSearchComponent

**Mục đích**: Advanced search và filtering interface

**Features**:
- Text search
- Tag filtering với multi-select
- Collection filtering
- Date range filtering
- Sort options
- Save search queries

## 🗄️ State Management

### 📊 BookmarkStore

```typescript
// bookmark.store.ts
export const BookmarkStore = signalStore(
  { providedIn: 'root' },
  withState<BookmarkState>({
    bookmarks: [],
    loading: false,
    error: null,
    selectedBookmark: null,
    query: {
      page: 1,
      limit: 20,
      search: '',
      tags: [],
      collectionId: null,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    }
  }),
  withComputed(({ bookmarks, query }) => ({
    filteredBookmarks: computed(() => {
      // Client-side filtering logic
      return bookmarks().filter(bookmark => {
        // Apply search, tags, collection filters
      });
    }),
    bookmarkCount: computed(() => bookmarks().length),
    hasBookmarks: computed(() => bookmarks().length > 0),
    selectedTags: computed(() => query.tags()),
    isLoading: computed(() => loading())
  })),
  withMethods((store, bookmarkService = inject(BookmarkService)) => ({
    // Load bookmarks với query
    async loadBookmarks(query?: Partial<BookmarkQuery>) {
      patchState(store, { loading: true, error: null });
      try {
        const response = await bookmarkService.getBookmarks(query);
        patchState(store, {
          bookmarks: response.data.bookmarks,
          pagination: response.data.pagination,
          loading: false
        });
      } catch (error) {
        patchState(store, { error: error.message, loading: false });
      }
    },

    // Create bookmark
    async createBookmark(request: BookmarkCreateRequest) {
      patchState(store, { loading: true });
      try {
        const bookmark = await bookmarkService.createBookmark(request);
        patchState(store, {
          bookmarks: [bookmark, ...store.bookmarks()],
          loading: false
        });
        return bookmark;
      } catch (error) {
        patchState(store, { error: error.message, loading: false });
        throw error;
      }
    },

    // Update bookmark
    async updateBookmark(id: string, request: BookmarkUpdateRequest) {
      patchState(store, { loading: true });
      try {
        const bookmark = await bookmarkService.updateBookmark(id, request);
        patchState(store, {
          bookmarks: store.bookmarks().map(b => 
            b.id === id ? bookmark : b
          ),
          loading: false
        });
        return bookmark;
      } catch (error) {
        patchState(store, { error: error.message, loading: false });
        throw error;
      }
    },

    // Delete bookmark
    async deleteBookmark(id: string) {
      patchState(store, { loading: true });
      try {
        await bookmarkService.deleteBookmark(id);
        patchState(store, {
          bookmarks: store.bookmarks().filter(b => b.id !== id),
          loading: false
        });
      } catch (error) {
        patchState(store, { error: error.message, loading: false });
        throw error;
      }
    },

    // Update query
    updateQuery(query: Partial<BookmarkQuery>) {
      patchState(store, { query: { ...store.query(), ...query } });
    },

    // Select bookmark
    selectBookmark(bookmark: Bookmark | null) {
      patchState(store, { selectedBookmark: bookmark });
    }
  }))
);
```

## 🔧 Services

### 📡 BookmarkService

```typescript
// bookmark.service.ts
@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/bookmarks';

  getBookmarks(query?: BookmarkQuery): Observable<ApiResponse<BookmarkListResponse>> {
    const params = this.buildQueryParams(query);
    return this.http.get<ApiResponse<BookmarkListResponse>>(this.apiUrl, { params })
      .pipe(
        map(response => ({
          ...response,
          data: {
            ...response.data,
            bookmarks: response.data.bookmarks.map(this.mapBookmarkResponse)
          }
        })),
        catchError(this.handleError)
      );
  }

  getBookmark(id: string): Observable<Bookmark> {
    return this.http.get<ApiResponse<Bookmark>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => this.mapBookmarkResponse(response.data)),
        catchError(this.handleError)
      );
  }

  createBookmark(request: BookmarkCreateRequest): Observable<Bookmark> {
    return this.http.post<ApiResponse<Bookmark>>(this.apiUrl, request)
      .pipe(
        map(response => this.mapBookmarkResponse(response.data)),
        catchError(this.handleError)
      );
  }

  updateBookmark(id: string, request: BookmarkUpdateRequest): Observable<Bookmark> {
    return this.http.put<ApiResponse<Bookmark>>(`${this.apiUrl}/${id}`, request)
      .pipe(
        map(response => this.mapBookmarkResponse(response.data)),
        catchError(this.handleError)
      );
  }

  deleteBookmark(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  private mapBookmarkResponse(bookmark: any): Bookmark {
    return {
      ...bookmark,
      createdAt: new Date(bookmark.createdAt),
      updatedAt: new Date(bookmark.updatedAt)
    };
  }

  private buildQueryParams(query?: BookmarkQuery): HttpParams {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params = params.append(key, v));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }
    return params;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    // Error handling logic
    return throwError(() => error);
  }
}
```

### 🔍 BookmarkMetadataService

```typescript
// bookmark-metadata.service.ts
@Injectable({ providedIn: 'root' })
export class BookmarkMetadataService {
  private readonly http = inject(HttpClient);

  fetchMetadata(url: string): Observable<BookmarkMetadata> {
    return this.http.post<ApiResponse<BookmarkMetadata>>('/api/bookmarks/metadata', { url })
      .pipe(
        map(response => response.data),
        catchError(() => of({})) // Return empty metadata on error
      );
  }

  extractFavicon(url: string): string {
    try {
      const domain = new URL(url).origin;
      return `${domain}/favicon.ico`;
    } catch {
      return '/assets/icons/default-favicon.ico';
    }
  }
}
```

## 🧪 Testing

### 🔬 Component Tests

```typescript
// bookmark-card.component.spec.ts
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

  it('should display bookmark information', () => {
    const bookmark = createMockBookmark();
    component.bookmark = signal(bookmark);
    fixture.detectChanges();

    expect(screen.getByText(bookmark.title)).toBeInTheDocument();
    expect(screen.getByText(bookmark.description)).toBeInTheDocument();
  });

  it('should emit edit event when edit button clicked', () => {
    const bookmark = createMockBookmark();
    component.bookmark = signal(bookmark);
    
    spyOn(component.edit, 'emit');
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(component.edit.emit).toHaveBeenCalled();
  });
});
```

### 🗄️ Store Tests

```typescript
// bookmark.store.spec.ts
describe('BookmarkStore', () => {
  let store: InstanceType<typeof BookmarkStore>;
  let bookmarkService: jasmine.SpyObj<BookmarkService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('BookmarkService', ['getBookmarks', 'createBookmark']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: BookmarkService, useValue: spy }
      ]
    });

    store = TestBed.inject(BookmarkStore);
    bookmarkService = TestBed.inject(BookmarkService) as jasmine.SpyObj<BookmarkService>;
  });

  it('should load bookmarks successfully', async () => {
    const mockResponse = createMockBookmarkListResponse();
    bookmarkService.getBookmarks.and.returnValue(of(mockResponse));

    await store.loadBookmarks();

    expect(store.bookmarks()).toEqual(mockResponse.data.bookmarks);
    expect(store.loading()).toBe(false);
  });

  it('should handle create bookmark', async () => {
    const newBookmark = createMockBookmark();
    bookmarkService.createBookmark.and.returnValue(of(newBookmark));

    const result = await store.createBookmark(createMockBookmarkRequest());

    expect(result).toEqual(newBookmark);
    expect(store.bookmarks()).toContain(newBookmark);
  });
});
```

## 🎯 User Stories

### 📚 Core Stories

1. **Tạo bookmark mới**
   - Là user, tôi muốn save một URL để có thể truy cập lại sau
   - Acceptance: URL được validate, metadata tự động fetch, bookmark được lưu

2. **Tìm kiếm bookmarks**
   - Là user, tôi muốn tìm bookmark bằng title hoặc tags
   - Acceptance: Search real-time, highlight results, filter by tags

3. **Tổ chức bằng collections**
   - Là user, tôi muốn group bookmarks vào collections
   - Acceptance: Drag-drop vào collections, filter by collection

4. **Quản lý tags**
   - Là user, tôi muốn tag bookmarks để dễ tìm kiếm
   - Acceptance: Autocomplete tags, bulk tag operations

### 🚀 Advanced Stories

1. **Import/Export**
   - Là user, tôi muốn import bookmarks từ browser
   - Acceptance: Support Chrome/Firefox export format

2. **Sharing**
   - Là user, tôi muốn share collections với others
   - Acceptance: Generate share links, permission control

3. **Duplicate detection**
   - Là user, tôi muốn avoid duplicate bookmarks
   - Acceptance: Detect duplicates, merge suggestions

## 📈 Performance Considerations

### 🎯 Frontend Optimizations

- **OnPush Change Detection**: Tất cả components sử dụng OnPush
- **Virtual Scrolling**: Cho large bookmark lists
- **Lazy Loading**: Images và metadata
- **Debounced Search**: Avoid excessive API calls
- **Caching**: Service-level caching cho frequently accessed data

### 🔧 Backend Optimizations

- **Database Indexing**: Indexes trên url, title, tags, userId
- **Pagination**: Limit query results
- **Caching**: Redis cache cho popular queries
- **Bulk Operations**: Batch processing cho multiple bookmarks

## 🔒 Security

- **URL Validation**: Prevent malicious URLs
- **Input Sanitization**: Clean user inputs
- **Rate Limiting**: Prevent spam bookmark creation
- **User Isolation**: Users chỉ access own bookmarks
- **HTTPS Enforcement**: Secure data transmission

## 🚀 Future Enhancements

1. **AI-powered tagging**: Auto-suggest tags based on content
2. **Full-text search**: Search within bookmark content
3. **Browser extension**: Quick bookmark saving
4. **Mobile app**: Native mobile experience
5. **Collaboration**: Team bookmark collections
6. **Analytics**: Usage statistics và insights

---

**Cập nhật lần cuối**: $(date)
**Feature Version**: 1.0.0