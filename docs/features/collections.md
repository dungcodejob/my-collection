# Collection Management - Quản lý Collection

## 📋 Tổng quan

Collection Management là tính năng cho phép người dùng tổ chức và quản lý các bookmark thành các nhóm có chủ đề. Mỗi collection có thể chứa nhiều bookmark và có thể được chia sẻ hoặc giữ riêng tư.

## 🎯 Mục tiêu

- **Tổ chức**: Nhóm các bookmark theo chủ đề hoặc dự án
- **Chia sẻ**: Cho phép chia sẻ collection với người khác
- **Quản lý**: CRUD operations cho collections
- **Tìm kiếm**: Tìm kiếm collections và bookmark trong collection

## 🏗️ Kiến trúc

### Frontend Architecture

```
Collection Management
├── Components
│   ├── CollectionList
│   ├── CollectionCard
│   ├── CollectionForm
│   ├── CollectionDetail
│   └── CollectionShare
├── Store (NgRx Signals)
│   ├── CollectionStore
│   └── CollectionSelectors
└── Services
    ├── CollectionService
    └── CollectionShareService
```

### Backend Architecture

```
Collection Module
├── Controller
│   └── CollectionController
├── Service
│   ├── CollectionService
│   └── CollectionShareService
├── Entity
│   ├── Collection
│   └── CollectionBookmark
└── DTOs
    ├── CreateCollectionDto
    ├── UpdateCollectionDto
    └── ShareCollectionDto
```

## 📊 Data Models

### Frontend Model (TypeScript)

```typescript
export interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  color?: string;
  icon?: string;
  userId: string;
  bookmarkCount: number;
  bookmarks?: Bookmark[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionBookmark {
  id: string;
  collectionId: string;
  bookmarkId: string;
  order: number;
  addedAt: Date;
}

export interface CollectionShare {
  id: string;
  collectionId: string;
  shareToken: string;
  expiresAt?: Date;
  isActive: boolean;
}
```

### Backend Entity (NestJS + MikroORM)

```typescript
@Entity()
export class Collection {
  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ default: false })
  isPublic!: boolean;

  @Property({ nullable: true })
  color?: string;

  @Property({ nullable: true })
  icon?: string;

  @ManyToOne(() => User)
  user!: User;

  @OneToMany(() => CollectionBookmark, cb => cb.collection)
  collectionBookmarks = new Collection<CollectionBookmark>();

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
```

## 🧩 Components

### CollectionList Component

```typescript
@Component({
  selector: 'app-collection-list',
  standalone: true,
  template: `
    <div class="collections-grid">
      @for (collection of collections(); track collection.id) {
        <app-collection-card 
          [collection]="collection"
          (edit)="onEdit($event)"
          (delete)="onDelete($event)"
          (share)="onShare($event)" />
      }
    </div>
  `
})
export class CollectionListComponent {
  collections = input.required<Collection[]>();
  
  edit = output<Collection>();
  delete = output<string>();
  share = output<Collection>();
}
```

### CollectionCard Component

```typescript
@Component({
  selector: 'app-collection-card',
  standalone: true,
  template: `
    <div class="collection-card" [style.border-left-color]="collection().color">
      <div class="collection-header">
        <h3>{{ collection().name }}</h3>
        <div class="collection-actions">
          <button (click)="edit.emit(collection())">Edit</button>
          <button (click)="share.emit(collection())">Share</button>
          <button (click)="delete.emit(collection().id)">Delete</button>
        </div>
      </div>
      <p>{{ collection().description }}</p>
      <div class="collection-stats">
        <span>{{ collection().bookmarkCount }} bookmarks</span>
        <span>{{ collection().isPublic ? 'Public' : 'Private' }}</span>
      </div>
    </div>
  `
})
export class CollectionCardComponent {
  collection = input.required<Collection>();
  
  edit = output<Collection>();
  delete = output<string>();
  share = output<Collection>();
}
```

## 🗄️ State Management (NgRx Signals)

### Collection Store

```typescript
export const CollectionStore = signalStore(
  { providedIn: 'root' },
  withState<CollectionState>({
    collections: [],
    selectedCollection: null,
    loading: false,
    error: null
  }),
  withComputed(({ collections, selectedCollection }) => ({
    publicCollections: computed(() => 
      collections().filter(c => c.isPublic)
    ),
    privateCollections: computed(() => 
      collections().filter(c => !c.isPublic)
    ),
    selectedCollectionBookmarks: computed(() => 
      selectedCollection()?.bookmarks || []
    )
  })),
  withMethods((store, collectionService = inject(CollectionService)) => ({
    async loadCollections() {
      patchState(store, { loading: true });
      try {
        const collections = await collectionService.getCollections();
        patchState(store, { collections, loading: false });
      } catch (error) {
        patchState(store, { error: error.message, loading: false });
      }
    },

    async createCollection(data: CreateCollectionDto) {
      try {
        const collection = await collectionService.createCollection(data);
        patchState(store, { 
          collections: [...store.collections(), collection] 
        });
      } catch (error) {
        patchState(store, { error: error.message });
      }
    },

    async updateCollection(id: string, data: UpdateCollectionDto) {
      try {
        const updated = await collectionService.updateCollection(id, data);
        patchState(store, {
          collections: store.collections().map(c => 
            c.id === id ? updated : c
          )
        });
      } catch (error) {
        patchState(store, { error: error.message });
      }
    },

    async deleteCollection(id: string) {
      try {
        await collectionService.deleteCollection(id);
        patchState(store, {
          collections: store.collections().filter(c => c.id !== id)
        });
      } catch (error) {
        patchState(store, { error: error.message });
      }
    }
  }))
);
```

## 🔧 Services

### Collection Service

```typescript
@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly apiUrl = '/api/collections';

  constructor(private http: HttpClient) {}

  getCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(this.apiUrl);
  }

  getCollection(id: string): Observable<Collection> {
    return this.http.get<Collection>(`${this.apiUrl}/${id}`);
  }

  createCollection(data: CreateCollectionDto): Observable<Collection> {
    return this.http.post<Collection>(this.apiUrl, data);
  }

  updateCollection(id: string, data: UpdateCollectionDto): Observable<Collection> {
    return this.http.put<Collection>(`${this.apiUrl}/${id}`, data);
  }

  deleteCollection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addBookmarkToCollection(collectionId: string, bookmarkId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${collectionId}/bookmarks`, {
      bookmarkId
    });
  }

  removeBookmarkFromCollection(collectionId: string, bookmarkId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${collectionId}/bookmarks/${bookmarkId}`);
  }
}
```

## 🧪 Testing

### Component Testing

```typescript
describe('CollectionListComponent', () => {
  let component: CollectionListComponent;
  let fixture: ComponentFixture<CollectionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionListComponent);
    component = fixture.componentInstance;
  });

  it('should display collections', () => {
    const mockCollections = [
      { id: '1', name: 'Test Collection', bookmarkCount: 5 }
    ];
    
    fixture.componentRef.setInput('collections', mockCollections);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Test Collection');
  });

  it('should emit edit event', () => {
    spyOn(component.edit, 'emit');
    const mockCollection = { id: '1', name: 'Test' };
    
    component.onEdit(mockCollection);
    
    expect(component.edit.emit).toHaveBeenCalledWith(mockCollection);
  });
});
```

### Store Testing

```typescript
describe('CollectionStore', () => {
  let store: InstanceType<typeof CollectionStore>;
  let collectionService: jasmine.SpyObj<CollectionService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('CollectionService', ['getCollections']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: CollectionService, useValue: spy }
      ]
    });

    store = TestBed.inject(CollectionStore);
    collectionService = TestBed.inject(CollectionService) as jasmine.SpyObj<CollectionService>;
  });

  it('should load collections', async () => {
    const mockCollections = [{ id: '1', name: 'Test' }];
    collectionService.getCollections.and.returnValue(of(mockCollections));

    await store.loadCollections();

    expect(store.collections()).toEqual(mockCollections);
    expect(store.loading()).toBe(false);
  });
});
```

## 📖 User Stories

### Core Features

1. **Tạo Collection**
   - Người dùng có thể tạo collection mới với tên và mô tả
   - Có thể chọn màu sắc và icon cho collection
   - Có thể đặt collection là public hoặc private

2. **Quản lý Collection**
   - Xem danh sách tất cả collections
   - Chỉnh sửa thông tin collection
   - Xóa collection (với xác nhận)

3. **Thêm/Xóa Bookmark**
   - Thêm bookmark vào collection
   - Xóa bookmark khỏi collection
   - Sắp xếp thứ tự bookmark trong collection

### Advanced Features

4. **Chia sẻ Collection**
   - Tạo link chia sẻ cho collection public
   - Đặt thời hạn cho link chia sẻ
   - Quản lý quyền truy cập

5. **Tìm kiếm và Filter**
   - Tìm kiếm collection theo tên
   - Filter theo public/private
   - Filter theo số lượng bookmark

## ⚡ Performance Optimization

### Frontend

```typescript
// Lazy loading cho collection detail
const CollectionDetailComponent = lazy(() => 
  import('./collection-detail.component')
);

// Virtual scrolling cho danh sách lớn
@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="120" class="collections-viewport">
      <app-collection-card 
        *cdkVirtualFor="let collection of collections()" 
        [collection]="collection" />
    </cdk-virtual-scroll-viewport>
  `
})
export class CollectionListComponent {}

// OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionCardComponent {}
```

### Backend

```typescript
// Pagination cho collections
@Get()
async getCollections(
  @Query() query: PaginationDto
): Promise<PaginatedResult<Collection>> {
  return this.collectionService.findPaginated(query);
}

// Eager loading cho bookmarks
async findWithBookmarks(id: string): Promise<Collection> {
  return this.collectionRepository.findOne(
    { id },
    { populate: ['collectionBookmarks.bookmark'] }
  );
}

// Caching
@Cacheable('collections', 300) // 5 minutes
async getPublicCollections(): Promise<Collection[]> {
  return this.collectionRepository.find({ isPublic: true });
}
```

## 🔒 Security

### Authorization

```typescript
// Collection ownership check
@UseGuards(CollectionOwnerGuard)
@Put(':id')
async updateCollection(
  @Param('id') id: string,
  @Body() updateDto: UpdateCollectionDto,
  @CurrentUser() user: User
): Promise<Collection> {
  return this.collectionService.update(id, updateDto, user);
}

// Public collection access
@Get('public/:shareToken')
async getPublicCollection(
  @Param('shareToken') shareToken: string
): Promise<Collection> {
  return this.collectionService.findByShareToken(shareToken);
}
```

### Data Validation

```typescript
export class CreateCollectionDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsBoolean()
  isPublic: boolean;

  @IsOptional()
  @IsHexColor()
  color?: string;
}
```

## 🚀 Future Enhancements

1. **Collection Templates**
   - Tạo collection từ template có sẵn
   - Chia sẻ template với cộng đồng

2. **Collaboration**
   - Mời người khác cùng chỉnh sửa collection
   - Comment và discussion trong collection

3. **Advanced Organization**
   - Sub-collections (collection con)
   - Tags cho collections
   - Smart collections dựa trên rules

4. **Analytics**
   - Thống kê sử dụng collection
   - Popular collections
   - Collection growth metrics

---

**Cập nhật lần cuối**: 2024-12-19  
**Phiên bản**: 1.0.0  
**Tác giả**: My Collection Team