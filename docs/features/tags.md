# Tag System - Hệ thống Tag

## 📋 Tổng quan

Tag System là tính năng cho phép người dùng gắn nhãn (tag) cho các bookmark để dễ dàng phân loại, tìm kiếm và tổ chức. Hệ thống hỗ trợ auto-complete, tag suggestions và thống kê sử dụng.

## 🎯 Mục tiêu

- **Phân loại**: Gắn nhãn cho bookmark theo chủ đề, loại nội dung
- **Tìm kiếm**: Tìm kiếm bookmark theo tag
- **Gợi ý**: Auto-complete và tag suggestions
- **Thống kê**: Phân tích sử dụng tag và trending tags

## 🏗️ Kiến trúc

### Frontend Architecture

```
Tag System
├── Components
│   ├── TagInput
│   ├── TagList
│   ├── TagCloud
│   ├── TagFilter
│   └── TagStatistics
├── Store (NgRx Signals)
│   ├── TagStore
│   └── TagSelectors
└── Services
    ├── TagService
    └── TagSuggestionService
```

### Backend Architecture

```
Tag Module
├── Controller
│   └── TagController
├── Service
│   ├── TagService
│   └── TagAnalyticsService
├── Entity
│   ├── Tag
│   └── BookmarkTag
└── DTOs
    ├── CreateTagDto
    ├── TagFilterDto
    └── TagStatsDto
```

## 📊 Data Models

### Frontend Model (TypeScript)

```typescript
export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  usageCount: number;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookmarkTag {
  id: string;
  bookmarkId: string;
  tagId: string;
  tag: Tag;
  createdAt: Date;
}

export interface TagStats {
  totalTags: number;
  mostUsedTags: Tag[];
  recentTags: Tag[];
  tagUsageByMonth: { month: string; count: number }[];
}

export interface TagSuggestion {
  tag: string;
  confidence: number;
  source: 'content' | 'url' | 'title' | 'similar';
}
```

### Backend Entity (NestJS + MikroORM)

```typescript
@Entity()
export class Tag {
  @PrimaryKey()
  id!: string;

  @Property({ unique: true })
  name!: string;

  @Property({ nullable: true })
  color?: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ default: 0 })
  usageCount!: number;

  @ManyToOne(() => User)
  user!: User;

  @Property({ default: false })
  isPublic!: boolean;

  @OneToMany(() => BookmarkTag, bt => bt.tag)
  bookmarkTags = new Collection<BookmarkTag>();

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}

@Entity()
export class BookmarkTag {
  @PrimaryKey()
  id!: string;

  @ManyToOne(() => Bookmark)
  bookmark!: Bookmark;

  @ManyToOne(() => Tag)
  tag!: Tag;

  @Property()
  createdAt = new Date();
}
```

## 🧩 Components

### TagInput Component

```typescript
@Component({
  selector: 'app-tag-input',
  standalone: true,
  template: `
    <div class="tag-input-container">
      <div class="selected-tags">
        @for (tag of selectedTags(); track tag.id) {
          <span class="tag-chip" [style.background-color]="tag.color">
            {{ tag.name }}
            <button (click)="removeTag(tag)" class="tag-remove">×</button>
          </span>
        }
      </div>
      
      <input
        #tagInput
        type="text"
        placeholder="Add tags..."
        [value]="inputValue()"
        (input)="onInput($event)"
        (keydown)="onKeyDown($event)"
        (focus)="showSuggestions.set(true)"
        class="tag-input" />
      
      @if (showSuggestions() && suggestions().length > 0) {
        <div class="tag-suggestions">
          @for (suggestion of suggestions(); track suggestion.tag) {
            <button 
              class="suggestion-item"
              (click)="selectSuggestion(suggestion)">
              {{ suggestion.tag }}
              <span class="confidence">{{ suggestion.confidence }}%</span>
            </button>
          }
        </div>
      }
    </div>
  `
})
export class TagInputComponent {
  selectedTags = input<Tag[]>([]);
  suggestions = input<TagSuggestion[]>([]);
  
  tagsChange = output<Tag[]>();
  searchTags = output<string>();
  
  inputValue = signal('');
  showSuggestions = signal(false);
  
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);
    this.searchTags.emit(value);
  }
  
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.inputValue().trim()) {
      this.addTag(this.inputValue().trim());
      this.inputValue.set('');
    }
  }
  
  addTag(tagName: string) {
    const newTag: Tag = {
      id: crypto.randomUUID(),
      name: tagName,
      usageCount: 0,
      userId: '',
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tagsChange.emit([...this.selectedTags(), newTag]);
  }
  
  removeTag(tag: Tag) {
    const updated = this.selectedTags().filter(t => t.id !== tag.id);
    this.tagsChange.emit(updated);
  }
  
  selectSuggestion(suggestion: TagSuggestion) {
    this.addTag(suggestion.tag);
    this.inputValue.set('');
    this.showSuggestions.set(false);
  }
}
```

### TagCloud Component

```typescript
@Component({
  selector: 'app-tag-cloud',
  standalone: true,
  template: `
    <div class="tag-cloud">
      @for (tag of sortedTags(); track tag.id) {
        <button 
          class="tag-cloud-item"
          [class.selected]="isSelected(tag)"
          [style.font-size]="getTagSize(tag) + 'rem'"
          [style.color]="tag.color"
          (click)="toggleTag(tag)">
          {{ tag.name }}
          <span class="usage-count">({{ tag.usageCount }})</span>
        </button>
      }
    </div>
  `
})
export class TagCloudComponent {
  tags = input.required<Tag[]>();
  selectedTags = input<Tag[]>([]);
  maxTags = input(50);
  
  tagSelect = output<Tag>();
  tagDeselect = output<Tag>();
  
  sortedTags = computed(() => {
    return this.tags()
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, this.maxTags());
  });
  
  isSelected(tag: Tag): boolean {
    return this.selectedTags().some(t => t.id === tag.id);
  }
  
  getTagSize(tag: Tag): number {
    const maxUsage = Math.max(...this.tags().map(t => t.usageCount));
    const minSize = 0.8;
    const maxSize = 2.0;
    const ratio = tag.usageCount / maxUsage;
    return minSize + (maxSize - minSize) * ratio;
  }
  
  toggleTag(tag: Tag) {
    if (this.isSelected(tag)) {
      this.tagDeselect.emit(tag);
    } else {
      this.tagSelect.emit(tag);
    }
  }
}
```

## 🗄️ State Management (NgRx Signals)

### Tag Store

```typescript
export const TagStore = signalStore(
  { providedIn: 'root' },
  withState<TagState>({
    tags: [],
    selectedTags: [],
    suggestions: [],
    stats: null,
    loading: false,
    error: null
  }),
  withComputed(({ tags, selectedTags }) => ({
    popularTags: computed(() => 
      tags()
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10)
    ),
    recentTags: computed(() => 
      tags()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
    ),
    selectedTagIds: computed(() => 
      selectedTags().map(t => t.id)
    )
  })),
  withMethods((store, tagService = inject(TagService)) => ({
    async loadTags() {
      patchState(store, { loading: true });
      try {
        const tags = await tagService.getTags();
        patchState(store, { tags, loading: false });
      } catch (error) {
        patchState(store, { error: error.message, loading: false });
      }
    },

    async searchTags(query: string) {
      if (!query.trim()) {
        patchState(store, { suggestions: [] });
        return;
      }
      
      try {
        const suggestions = await tagService.getSuggestions(query);
        patchState(store, { suggestions });
      } catch (error) {
        patchState(store, { error: error.message });
      }
    },

    async createTag(name: string, color?: string) {
      try {
        const tag = await tagService.createTag({ name, color });
        patchState(store, { 
          tags: [...store.tags(), tag] 
        });
        return tag;
      } catch (error) {
        patchState(store, { error: error.message });
        throw error;
      }
    },

    selectTag(tag: Tag) {
      const current = store.selectedTags();
      if (!current.some(t => t.id === tag.id)) {
        patchState(store, { 
          selectedTags: [...current, tag] 
        });
      }
    },

    deselectTag(tag: Tag) {
      patchState(store, {
        selectedTags: store.selectedTags().filter(t => t.id !== tag.id)
      });
    },

    clearSelectedTags() {
      patchState(store, { selectedTags: [] });
    },

    async loadStats() {
      try {
        const stats = await tagService.getStats();
        patchState(store, { stats });
      } catch (error) {
        patchState(store, { error: error.message });
      }
    }
  }))
);
```

## 🔧 Services

### Tag Service

```typescript
@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly apiUrl = '/api/tags';

  constructor(private http: HttpClient) {}

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.apiUrl);
  }

  getTag(id: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/${id}`);
  }

  createTag(data: CreateTagDto): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, data);
  }

  updateTag(id: string, data: Partial<CreateTagDto>): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/${id}`, data);
  }

  deleteTag(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSuggestions(query: string): Observable<TagSuggestion[]> {
    return this.http.get<TagSuggestion[]>(`${this.apiUrl}/suggestions`, {
      params: { q: query }
    });
  }

  getStats(): Observable<TagStats> {
    return this.http.get<TagStats>(`${this.apiUrl}/stats`);
  }

  getPopularTags(limit = 20): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/popular`, {
      params: { limit: limit.toString() }
    });
  }

  mergeTags(sourceTagId: string, targetTagId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/merge`, {
      sourceTagId,
      targetTagId
    });
  }

  bulkUpdateTags(tagIds: string[], updates: Partial<Tag>): Observable<Tag[]> {
    return this.http.put<Tag[]>(`${this.apiUrl}/bulk`, {
      tagIds,
      updates
    });
  }
}
```

## 🏗️ Backend Implementation

### Tag Controller

```typescript
@Controller('tags')
@UseGuards(JwtAuthGuard)
@ApiTags('Tags')
export class TagController {
  constructor(
    private readonly tagService: TagService,
    private readonly tagAnalyticsService: TagAnalyticsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user tags' })
  @ApiResponse({ status: 200, type: [Tag] })
  async getTags(
    @CurrentUser() user: User,
    @Query() query: TagFilterDto,
  ): Promise<Tag[]> {
    return this.tagService.findByUser(user.id, query);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular tags' })
  async getPopularTags(
    @CurrentUser() user: User,
    @Query('limit') limit = 20,
  ): Promise<Tag[]> {
    return this.tagService.getPopularTags(user.id, limit);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get tag suggestions' })
  @UseGuards(ThrottlerGuard)
  @Throttle(20, 60)
  async getSuggestions(
    @CurrentUser() user: User,
    @Query('q') query: string,
  ): Promise<TagSuggestion[]> {
    return this.tagService.getSuggestions(user.id, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get tag statistics' })
  async getStats(@CurrentUser() user: User): Promise<TagStats> {
    return this.tagAnalyticsService.getTagStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  async getTag(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<Tag> {
    return this.tagService.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new tag' })
  @ApiResponse({ status: 201, type: Tag })
  async createTag(
    @CurrentUser() user: User,
    @Body() createTagDto: CreateTagDto,
  ): Promise<Tag> {
    return this.tagService.create(user.id, createTagDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tag' })
  async updateTag(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ): Promise<Tag> {
    return this.tagService.update(id, user.id, updateTagDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tag' })
  @HttpCode(204)
  async deleteTag(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<void> {
    return this.tagService.delete(id, user.id);
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge two tags' })
  async mergeTags(
    @CurrentUser() user: User,
    @Body() mergeTagDto: MergeTagDto,
  ): Promise<void> {
    return this.tagService.mergeTags(
      user.id,
      mergeTagDto.sourceTagId,
      mergeTagDto.targetTagId,
    );
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk update tags' })
  async bulkUpdateTags(
    @CurrentUser() user: User,
    @Body() bulkUpdateDto: BulkUpdateTagDto,
  ): Promise<Tag[]> {
    return this.tagService.bulkUpdate(user.id, bulkUpdateDto);
  }
}
```

### Tag Service (Backend)

```typescript
@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(BookmarkTag)
    private bookmarkTagRepository: Repository<BookmarkTag>,
    private cacheManager: Cache,
  ) {}

  async findByUser(
    userId: string,
    filter: TagFilterDto,
  ): Promise<Tag[]> {
    const cacheKey = `user-tags:${userId}:${JSON.stringify(filter)}`;
    const cached = await this.cacheManager.get<Tag[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const queryBuilder = this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.userId = :userId', { userId })
      .orderBy('tag.usageCount', 'DESC');

    if (filter.search) {
      queryBuilder.andWhere(
        'tag.name ILIKE :search OR tag.description ILIKE :search',
        { search: `%${filter.search}%` },
      );
    }

    if (filter.minUsage) {
      queryBuilder.andWhere('tag.usageCount >= :minUsage', {
        minUsage: filter.minUsage,
      });
    }

    const tags = await queryBuilder.getMany();
    
    await this.cacheManager.set(cacheKey, tags, 300); // 5 minutes
    return tags;
  }

  async create(userId: string, createTagDto: CreateTagDto): Promise<Tag> {
    // Check if tag already exists
    const existingTag = await this.tagRepository.findOne({
      where: { name: createTagDto.name, userId },
    });

    if (existingTag) {
      throw new ConflictException('Tag already exists');
    }

    const tag = this.tagRepository.create({
      ...createTagDto,
      userId,
    });

    const savedTag = await this.tagRepository.save(tag);
    
    // Invalidate cache
    await this.invalidateUserTagsCache(userId);
    
    return savedTag;
  }

  async update(
    id: string,
    userId: string,
    updateTagDto: UpdateTagDto,
  ): Promise<Tag> {
    const tag = await this.findOne(id, userId);
    
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existingTag = await this.tagRepository.findOne({
        where: { name: updateTagDto.name, userId },
      });
      
      if (existingTag && existingTag.id !== id) {
        throw new ConflictException('Tag name already exists');
      }
    }

    Object.assign(tag, updateTagDto);
    const updatedTag = await this.tagRepository.save(tag);
    
    await this.invalidateUserTagsCache(userId);
    return updatedTag;
  }

  async delete(id: string, userId: string): Promise<void> {
    const tag = await this.findOne(id, userId);
    
    // Remove all bookmark-tag associations
    await this.bookmarkTagRepository.delete({ tagId: id });
    
    // Delete the tag
    await this.tagRepository.remove(tag);
    
    await this.invalidateUserTagsCache(userId);
  }

  async getSuggestions(
    userId: string,
    query: string,
  ): Promise<TagSuggestion[]> {
    const suggestions: TagSuggestion[] = [];

    // Existing tags matching query
    const existingTags = await this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.userId = :userId', { userId })
      .andWhere('tag.name ILIKE :query', { query: `%${query}%` })
      .orderBy('tag.usageCount', 'DESC')
      .limit(5)
      .getMany();

    suggestions.push(
      ...existingTags.map(tag => ({
        tag: tag.name,
        confidence: 100,
        source: 'existing' as const,
      })),
    );

    // Popular tags from other users (if enabled)
    const popularTags = await this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.name ILIKE :query', { query: `%${query}%` })
      .andWhere('tag.isPublic = true')
      .andWhere('tag.userId != :userId', { userId })
      .groupBy('tag.name')
      .select('tag.name', 'name')
      .addSelect('SUM(tag.usageCount)', 'totalUsage')
      .orderBy('totalUsage', 'DESC')
      .limit(3)
      .getRawMany();

    suggestions.push(
      ...popularTags.map(tag => ({
        tag: tag.name,
        confidence: 80,
        source: 'popular' as const,
      })),
    );

    return suggestions.slice(0, 8);
  }

  async mergeTags(
    userId: string,
    sourceTagId: string,
    targetTagId: string,
  ): Promise<void> {
    const sourceTag = await this.findOne(sourceTagId, userId);
    const targetTag = await this.findOne(targetTagId, userId);

    // Move all bookmark associations from source to target
    await this.bookmarkTagRepository
      .createQueryBuilder()
      .update()
      .set({ tagId: targetTagId })
      .where('tagId = :sourceTagId', { sourceTagId })
      .execute();

    // Update target tag usage count
    targetTag.usageCount += sourceTag.usageCount;
    await this.tagRepository.save(targetTag);

    // Delete source tag
    await this.tagRepository.remove(sourceTag);
    
    await this.invalidateUserTagsCache(userId);
  }

  async getPopularTags(userId: string, limit: number): Promise<Tag[]> {
    const cacheKey = `popular-tags:${userId}:${limit}`;
    const cached = await this.cacheManager.get<Tag[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const tags = await this.tagRepository.find({
      where: { userId },
      order: { usageCount: 'DESC' },
      take: limit,
    });

    await this.cacheManager.set(cacheKey, tags, 3600); // 1 hour
    return tags;
  }

  private async findOne(id: string, userId: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id, userId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  private async invalidateUserTagsCache(userId: string): Promise<void> {
    const keys = await this.cacheManager.store.keys(`user-tags:${userId}:*`);
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
    
    await this.cacheManager.del(`popular-tags:${userId}:*`);
  }
}
```

### Tag Analytics Service

```typescript
@Injectable()
export class TagAnalyticsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(BookmarkTag)
    private bookmarkTagRepository: Repository<BookmarkTag>,
  ) {}

  async getTagStats(userId: string): Promise<TagStats> {
    const [
      totalTags,
      mostUsedTags,
      recentTags,
      tagUsageByMonth,
    ] = await Promise.all([
      this.getTotalTagCount(userId),
      this.getMostUsedTags(userId),
      this.getRecentTags(userId),
      this.getTagUsageByMonth(userId),
    ]);

    return {
      totalTags,
      mostUsedTags,
      recentTags,
      tagUsageByMonth,
    };
  }

  private async getTotalTagCount(userId: string): Promise<number> {
    return this.tagRepository.count({ where: { userId } });
  }

  private async getMostUsedTags(userId: string): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { userId },
      order: { usageCount: 'DESC' },
      take: 10,
    });
  }

  private async getRecentTags(userId: string): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  private async getTagUsageByMonth(
    userId: string,
  ): Promise<{ month: string; count: number }[]> {
    const result = await this.bookmarkTagRepository
      .createQueryBuilder('bt')
      .innerJoin('bt.tag', 'tag')
      .where('tag.userId = :userId', { userId })
      .select("DATE_TRUNC('month', bt.createdAt)", 'month')
      .addSelect('COUNT(*)', 'count')
      .groupBy('month')
      .orderBy('month', 'DESC')
      .limit(12)
      .getRawMany();

    return result.map(row => ({
      month: row.month,
      count: parseInt(row.count, 10),
    }));
  }
}
```

### Tag Suggestion Service

```typescript
@Injectable({ providedIn: 'root' })
export class TagSuggestionService {
  constructor(private http: HttpClient) {}

  suggestTagsForUrl(url: string): Observable<TagSuggestion[]> {
    return this.http.post<TagSuggestion[]>('/api/tags/suggest/url', { url });
  }

  suggestTagsForContent(content: string): Observable<TagSuggestion[]> {
    return this.http.post<TagSuggestion[]>('/api/tags/suggest/content', { content });
  }

  getSimilarTags(tagIds: string[]): Observable<Tag[]> {
    return this.http.post<Tag[]>('/api/tags/similar', { tagIds });
  }
}
```

## 🧪 Testing

### Component Testing

```typescript
describe('TagInputComponent', () => {
  let component: TagInputComponent;
  let fixture: ComponentFixture<TagInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TagInputComponent);
    component = fixture.componentInstance;
  });

  it('should add tag on Enter key', () => {
    spyOn(component.tagsChange, 'emit');
    component.inputValue.set('test-tag');
    
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onKeyDown(event);
    
    expect(component.tagsChange.emit).toHaveBeenCalled();
    expect(component.inputValue()).toBe('');
  });

  it('should remove tag', () => {
    const mockTags = [
      { id: '1', name: 'tag1' },
      { id: '2', name: 'tag2' }
    ];
    
    fixture.componentRef.setInput('selectedTags', mockTags);
    spyOn(component.tagsChange, 'emit');
    
    component.removeTag(mockTags[0]);
    
    expect(component.tagsChange.emit).toHaveBeenCalledWith([mockTags[1]]);
  });
});
```

### Store Testing

```typescript
describe('TagStore', () => {
  let store: InstanceType<typeof TagStore>;
  let tagService: jasmine.SpyOf<TagService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('TagService', ['getTags', 'getSuggestions']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: TagService, useValue: spy }
      ]
    });

    store = TestBed.inject(TagStore);
    tagService = TestBed.inject(TagService) as jasmine.SpyOf<TagService>;
  });

  it('should load tags', async () => {
    const mockTags = [{ id: '1', name: 'test', usageCount: 5 }];
    tagService.getTags.and.returnValue(of(mockTags));

    await store.loadTags();

    expect(store.tags()).toEqual(mockTags);
    expect(store.loading()).toBe(false);
  });

  it('should select and deselect tags', () => {
    const tag = { id: '1', name: 'test' };
    
    store.selectTag(tag);
    expect(store.selectedTags()).toContain(tag);
    
    store.deselectTag(tag);
    expect(store.selectedTags()).not.toContain(tag);
  });
});
```

## 📖 User Stories

### Core Features

1. **Tạo và Quản lý Tag**
   - Người dùng có thể tạo tag mới khi thêm bookmark
   - Có thể chọn màu sắc cho tag
   - Xem danh sách tất cả tags đã tạo

2. **Gắn Tag cho Bookmark**
   - Thêm nhiều tag cho một bookmark
   - Auto-complete khi nhập tag
   - Gợi ý tag dựa trên nội dung bookmark

3. **Tìm kiếm theo Tag**
   - Filter bookmark theo tag
   - Kết hợp nhiều tag trong tìm kiếm
   - Tag cloud để dễ dàng chọn tag

### Advanced Features

4. **Tag Analytics**
   - Thống kê sử dụng tag
   - Trending tags
   - Tag usage over time

5. **Smart Suggestions**
   - AI-powered tag suggestions
   - Similar tags recommendations
   - Auto-tagging based on content

## ⚡ Performance Optimization

### Frontend

```typescript
// Virtual scrolling cho tag list lớn
@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="32" class="tag-list">
      <div *cdkVirtualFor="let tag of tags()" class="tag-item">
        {{ tag.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
export class TagListComponent {}

// Debounced search
export class TagInputComponent {
  private searchSubject = new Subject<string>();
  
  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.tagService.getSuggestions(query))
    ).subscribe(suggestions => {
      this.suggestions.set(suggestions);
    });
  }
  
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }
}

// Memoized tag cloud calculations
export class TagCloudComponent {
  private tagSizeCache = new Map<string, number>();
  
  getTagSize(tag: Tag): number {
    if (this.tagSizeCache.has(tag.id)) {
      return this.tagSizeCache.get(tag.id)!;
    }
    
    const size = this.calculateTagSize(tag);
    this.tagSizeCache.set(tag.id, size);
    return size;
  }
}
```

### Backend

```typescript
// Caching popular tags
@Cacheable('popular-tags', 3600) // 1 hour
async getPopularTags(limit: number): Promise<Tag[]> {
  return this.tagRepository.find(
    {},
    {
      orderBy: { usageCount: 'DESC' },
      limit
    }
  );
}

// Efficient tag search with full-text search
async searchTags(query: string): Promise<Tag[]> {
  return this.tagRepository.createQueryBuilder()
    .where('MATCH(name, description) AGAINST (? IN NATURAL LANGUAGE MODE)', [query])
    .orderBy('usageCount', 'DESC')
    .limit(20)
    .getMany();
}

// Batch tag operations
async addTagsToBookmark(bookmarkId: string, tagIds: string[]): Promise<void> {
  const bookmarkTags = tagIds.map(tagId => ({
    bookmarkId,
    tagId,
    id: uuid()
  }));
  
  await this.bookmarkTagRepository.insertMany(bookmarkTags);
  
  // Update usage count in batch
  await this.tagRepository.increment(
    { id: { $in: tagIds } },
    { usageCount: 1 }
  );
}
```

## 🔒 Security

### Input Validation

```typescript
export class CreateTagDto {
  @IsString()
  @Length(1, 50)
  @Matches(/^[a-zA-Z0-9\-_\s]+$/, {
    message: 'Tag name can only contain letters, numbers, hyphens, underscores and spaces'
  })
  name: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  description?: string;
}
```

### Rate Limiting

```typescript
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per minute
@Post('suggestions')
async getSuggestions(
  @Body() dto: TagSuggestionDto
): Promise<TagSuggestion[]> {
  return this.tagService.generateSuggestions(dto);
}
```

## 🚀 Future Enhancements

1. **Hierarchical Tags**
   - Parent-child tag relationships
   - Tag categories and subcategories
   - Nested tag filtering

2. **Collaborative Tagging**
   - Public tag vocabulary
   - Community-driven tag suggestions
   - Tag synonyms and aliases

3. **Advanced Analytics**
   - Tag correlation analysis
   - User tagging patterns
   - Tag effectiveness metrics

4. **AI-Powered Features**
   - Automatic tag extraction from content
   - Smart tag clustering
   - Personalized tag recommendations

5. **Integration Features**
   - Import tags from other bookmark services
   - Export tag data
   - API for third-party integrations

---

**Cập nhật lần cuối**: 2024-12-19  
**Phiên bản**: 1.0.0  
**Tác giả**: My Collection Team