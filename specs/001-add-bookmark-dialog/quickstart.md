# Quickstart: Add Bookmark Dialog Integration

**Feature**: 001-add-bookmark-dialog  
**Date**: 2025-01-06  
**Phase**: 1 - Design

## Overview

This guide provides step-by-step instructions for integrating the Add Bookmark Dialog feature into the My Collection application.

## Prerequisites

- Node.js 18+ installed
- Angular CLI 20+ installed
- NestJS CLI 11+ installed
- PostgreSQL 15+ running
- Redis 7+ running (for caching)
- AWS S3 or compatible storage (for image uploads)

## Quick Start (5 Minutes)

### 1. Frontend Integration

**Step 1**: Import the dialog component in your bookmarks feature

```typescript
// client/apps/client/src/app/app.ts or your main component
import { AddBookmarkDialogComponent } from '@client/web-bookmark-feature-add-bookmark-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    // ... other imports
    AddBookmarkDialogComponent
  ],
  // ...
})
export class AppComponent {
  // Dialog will be triggered by user action
}
```

**Step 2**: Add button to trigger the dialog

```typescript
// In your bookmarks list component
<button 
  (click)="openAddBookmarkDialog()"
  class="btn btn-primary">
  Add Bookmark
</button>

<app-add-bookmark-dialog
  [(isOpen)]="isDialogOpen"
  (bookmarkCreated)="onBookmarkCreated($event)"
/>
```

**Step 3**: Handle dialog events

```typescript
export class BookmarksListComponent {
  isDialogOpen = false;

  openAddBookmarkDialog() {
    this.isDialogOpen = true;
  }

  onBookmarkCreated(bookmark: Bookmark) {
    console.log('New bookmark created:', bookmark);
    // Refresh bookmark list or add to local state
    this.bookmarkStore.loadBookmarks();
  }
}
```

### 2. Backend Integration

**Step 1**: Run database migration

```bash
cd server
npm run migration:create -- add-bookmark-notes-and-favicon
# Edit the generated migration file with SQL from data-model.md
npm run migration:up
```

**Step 2**: Update Bookmark Entity

```typescript
// server/src/modules/bookmark/entities/bookmark.entity.ts
@Entity('bookmarks')
export class Bookmark {
  // ... existing fields
  
  @Property({ type: 'text', nullable: true })
  notes?: string;
  
  @Property({ length: 2048, nullable: true })
  faviconUrl?: string;
}
```

**Step 3**: Register new endpoints in module

```typescript
// server/src/modules/bookmark/bookmark.module.ts
@Module({
  imports: [
    MikroOrmModule.forFeature([Bookmark]),
    // Add crawl module for metadata extraction
    CrawlModule,
  ],
  controllers: [BookmarkController],
  providers: [BookmarkService],
  exports: [BookmarkService],
})
export class BookmarkModule {}
```

### 3. Environment Configuration

**Frontend** (`client/apps/client/src/environments/environment.ts`):

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  maxImageSize: 5242880, // 5MB in bytes
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};
```

**Backend** (`.env`):

```env
# Metadata Extraction
METADATA_FETCH_TIMEOUT=10000
METADATA_CACHE_TTL=86400

# Image Upload
AWS_S3_BUCKET=my-collection-bookmarks
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
CDN_URL=https://cdn.my-collection.com

# Rate Limiting
METADATA_RATE_LIMIT=60
UPLOAD_RATE_LIMIT=30
```

## Detailed Integration Steps

### Frontend Components

#### 1. Dialog Component Structure

```
client/libs/web/bookmark/feature/add-bookmark-dialog/
├── src/
│   ├── lib/
│   │   ├── add-bookmark-dialog.component.ts       # Main dialog component
│   │   ├── add-bookmark-dialog.component.html     # Dialog template
│   │   ├── add-bookmark-dialog.component.css      # Dialog styles
│   │   ├── add-bookmark-dialog.store.ts           # NgRx Signals store
│   │   └── index.ts                               # Public API
│   └── index.ts
└── project.json
```

#### 2. Store Integration

```typescript
// add-bookmark-dialog.store.ts
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

interface AddBookmarkDialogState {
  url: string;
  title: string;
  description: string;
  notes: string;
  selectedImageUrl: string | null;
  metadata: MetadataResponseDto | null;
  isLoading: boolean;
  error: string | null;
}

export const AddBookmarkDialogStore = signalStore(
  withState<AddBookmarkDialogState>({
    url: '',
    title: '',
    description: '',
    notes: '',
    selectedImageUrl: null,
    metadata: null,
    isLoading: false,
    error: null,
  }),
  withComputed((state) => ({
    isValid: computed(() => 
      !!state.url() && !!state.title() && !state.error()
    ),
    canSave: computed(() => 
      state.isValid() && !state.isLoading()
    ),
  })),
  withMethods((store, bookmarkService = inject(BookmarkService)) => ({
    fetchMetadata: rxMethod<string>(
      pipe(
        debounceTime(500),
        switchMap((url) =>
          bookmarkService.fetchMetadata(url).pipe(
            tap((metadata) => patchState(store, { metadata, isLoading: false })),
            catchError((error) => {
              patchState(store, { error: error.message, isLoading: false });
              return EMPTY;
            })
          )
        )
      )
    ),
    saveBookmark: rxMethod<void>(
      pipe(
        exhaustMap(() =>
          bookmarkService.createBookmark({
            url: store.url(),
            title: store.title(),
            description: store.description(),
            notes: store.notes(),
            imageUrl: store.selectedImageUrl(),
          }).pipe(
            tap(() => patchState(store, { isLoading: false })),
            catchError((error) => {
              patchState(store, { error: error.message, isLoading: false });
              return EMPTY;
            })
          )
        )
      )
    ),
  }))
);
```

#### 3. Service Integration

```typescript
// client/libs/web/bookmark/data-access/src/lib/bookmark.service.ts
@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private readonly apiUrl = inject(API_URL);
  private readonly http = inject(HttpClient);

  fetchMetadata(url: string): Observable<MetadataResponseDto> {
    return this.http.get<MetadataResponseDto>(
      `${this.apiUrl}/metadata`,
      { params: { url } }
    );
  }

  createBookmark(dto: CreateBookmarkDto): Observable<BookmarkResponseDto> {
    return this.http.post<BookmarkResponseDto>(
      `${this.apiUrl}/bookmarks`,
      dto
    );
  }

  checkDuplicate(url: string): Observable<DuplicateCheckResponseDto> {
    return this.http.get<DuplicateCheckResponseDto>(
      `${this.apiUrl}/bookmarks/check-duplicate`,
      { params: { url } }
    );
  }
}
```

### Backend Implementation

#### 1. Controller Endpoints

```typescript
// server/src/modules/bookmark/bookmark.controller.ts
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
@ApiTags('bookmarks')
export class BookmarkController {
  constructor(
    private readonly bookmarkService: BookmarkService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bookmark' })
  @ApiResponse({ status: 201, type: BookmarkResponseDto })
  async create(
    @Body() createDto: CreateBookmarkDto,
    @CurrentUser() user: User,
  ): Promise<BookmarkResponseDto> {
    const command = new CreateBookmarkCommand(user.id, createDto);
    return this.commandBus.execute(command);
  }

  @Get('check-duplicate')
  @ApiOperation({ summary: 'Check for duplicate bookmark URL' })
  @ApiResponse({ status: 200, type: DuplicateCheckResponseDto })
  async checkDuplicate(
    @Query('url') url: string,
    @CurrentUser() user: User,
  ): Promise<DuplicateCheckResponseDto> {
    const query = new CheckDuplicateQuery(user.id, url);
    return this.queryBus.execute(query);
  }
}
```

#### 2. CQRS Command Handler

```typescript
// server/src/modules/bookmark/commands/handlers/create-bookmark.handler.ts
@CommandHandler(CreateBookmarkCommand)
export class CreateBookmarkHandler implements ICommandHandler<CreateBookmarkCommand> {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: EntityRepository<Bookmark>,
    private readonly em: EntityManager,
  ) {}

  async execute(command: CreateBookmarkCommand): Promise<BookmarkResponseDto> {
    const { userId, dto } = command;

    // Check for duplicates
    const existing = await this.bookmarkRepository.findOne({
      user: userId,
      url: dto.url,
    });

    if (existing) {
      throw new ConflictException({
        message: 'A bookmark with this URL already exists',
        existingBookmark: {
          id: existing.id,
          title: existing.title,
          createdAt: existing.createdAt,
          imageUrl: existing.imageUrl,
        },
      });
    }

    // Create new bookmark
    const bookmark = this.bookmarkRepository.create({
      user: userId,
      url: dto.url,
      title: dto.title,
      description: dto.description,
      imageUrl: dto.imageUrl,
      notes: dto.notes,
      faviconUrl: dto.faviconUrl,
      collectionId: dto.collectionId,
    });

    await this.em.persistAndFlush(bookmark);

    return this.toDto(bookmark);
  }

  private toDto(bookmark: Bookmark): BookmarkResponseDto {
    return {
      id: bookmark.id,
      userId: bookmark.user.id,
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description,
      imageUrl: bookmark.imageUrl,
      notes: bookmark.notes,
      faviconUrl: bookmark.faviconUrl,
      createdAt: bookmark.createdAt.toISOString(),
      updatedAt: bookmark.updatedAt.toISOString(),
      collectionId: bookmark.collectionId,
    };
  }
}
```

#### 3. Metadata Extraction Service

```typescript
// server/src/modules/crawl/crawl.service.ts
@Injectable()
export class CrawlService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async extractMetadata(url: string): Promise<MetadataResponseDto> {
    // Check cache first
    const cached = await this.cacheManager.get<MetadataResponseDto>(`metadata:${url}`);
    if (cached) return cached;

    // Fetch HTML
    const response = await firstValueFrom(
      this.httpService.get(url, {
        timeout: 10000,
        headers: { 'User-Agent': 'MyCollection-Bot/1.0' },
      })
    );

    const $ = cheerio.load(response.data);

    // Extract metadata
    const metadata: MetadataResponseDto = {
      url,
      title: this.extractTitle($),
      description: this.extractDescription($),
      images: this.extractImages($, url),
      primaryImage: this.extractPrimaryImage($),
      favicon: this.extractFavicon($, url),
      siteName: $('meta[property="og:site_name"]').attr('content') || null,
      author: $('meta[name="author"]').attr('content') || null,
      publishedDate: this.extractPublishedDate($),
    };

    // Cache for 24 hours
    await this.cacheManager.set(`metadata:${url}`, metadata, 86400);

    return metadata;
  }

  private extractTitle($: cheerio.CheerioAPI): string {
    return (
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      'Untitled'
    ).substring(0, 500);
  }

  private extractDescription($: cheerio.CheerioAPI): string | null {
    return (
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      null
    );
  }

  private extractImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const images: string[] = [];
    
    // Get og:image
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) images.push(this.resolveUrl(ogImage, baseUrl));

    // Get other images
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src && images.length < 10) {
        images.push(this.resolveUrl(src, baseUrl));
      }
    });

    return [...new Set(images)].slice(0, 10);
  }

  private extractPrimaryImage($: cheerio.CheerioAPI): string | null {
    return (
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      null
    );
  }

  private extractFavicon($: cheerio.CheerioAPI, baseUrl: string): string | null {
    const favicon = $('link[rel="icon"]').attr('href') ||
                    $('link[rel="shortcut icon"]').attr('href');
    return favicon ? this.resolveUrl(favicon, baseUrl) : null;
  }

  private extractPublishedDate($: cheerio.CheerioAPI): string | null {
    const dateStr = $('meta[property="article:published_time"]').attr('content') ||
                    $('meta[name="publish_date"]').attr('content');
    return dateStr ? new Date(dateStr).toISOString() : null;
  }

  private resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    const base = new URL(baseUrl);
    return new URL(url, base.origin).href;
  }
}
```

## Testing

### Frontend Tests

```typescript
// add-bookmark-dialog.component.spec.ts
describe('AddBookmarkDialogComponent', () => {
  it('should fetch metadata when URL is entered', fakeAsync(() => {
    const fixture = TestBed.createComponent(AddBookmarkDialogComponent);
    const component = fixture.componentInstance;
    
    component.urlControl.setValue('https://example.com');
    tick(500); // debounce
    
    expect(mockBookmarkService.fetchMetadata).toHaveBeenCalledWith('https://example.com');
  }));

  it('should create bookmark with fetched metadata', async () => {
    const fixture = TestBed.createComponent(AddBookmarkDialogComponent);
    const component = fixture.componentInstance;
    
    component.metadata = mockMetadata;
    component.title = 'Test Bookmark';
    
    await component.save();
    
    expect(mockBookmarkService.createBookmark).toHaveBeenCalledWith({
      url: 'https://example.com',
      title: 'Test Bookmark',
      // ...
    });
  });
});
```

### Backend Tests

```typescript
// create-bookmark.handler.spec.ts
describe('CreateBookmarkHandler', () => {
  it('should create bookmark successfully', async () => {
    const command = new CreateBookmarkCommand('user-id', {
      url: 'https://example.com',
      title: 'Test Bookmark',
    });

    const result = await handler.execute(command);

    expect(result.url).toBe('https://example.com');
    expect(result.title).toBe('Test Bookmark');
  });

  it('should throw ConflictException for duplicate URL', async () => {
    // Setup: existing bookmark
    await bookmarkRepository.create({
      user: 'user-id',
      url: 'https://example.com',
      title: 'Existing',
    });

    const command = new CreateBookmarkCommand('user-id', {
      url: 'https://example.com',
      title: 'Duplicate',
    });

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });
});
```

## Troubleshooting

### Common Issues

**Issue**: Metadata fetch fails with CORS error  
**Solution**: Ensure metadata extraction is server-side only, not client-side

**Issue**: Image upload fails  
**Solution**: Check AWS credentials and S3 bucket permissions

**Issue**: Dialog doesn't open  
**Solution**: Verify `isOpen` binding and event emitters are correct

**Issue**: Duplicate detection not working  
**Solution**: Ensure database index on `(user_id, url)` exists

## Next Steps

1. Run `/speckit.tasks` to generate detailed implementation tasks
2. Review generated tasks and adjust priorities
3. Begin implementation starting with Phase 1 (Setup)
4. Follow TDD approach: write tests first, then implement

## Support

For questions or issues:
- Check `docs/troubleshooting.md`
- Review API contracts in `contracts/` directory
- Consult `research.md` for technical decisions
- Review `data-model.md` for entity structures

---

**Ready to implement?** Run `/speckit.tasks` to generate the detailed task breakdown!

