# Technical Research: Bookmark Collection Browser

**Feature**: 001-bookmark-browser | **Date**: 2025-11-09  
**Purpose**: Document technical decisions and research findings for implementation

## Overview

This document captures the research and technical decisions made during Phase 0 planning for the Bookmark Collection Browser feature. Each decision includes rationale, alternatives considered, and implementation guidance.

---

## Decision 1: URL State Synchronization Strategy

### Context
The feature requires all view state (filters, sort, pagination, display mode, tag filter mode, selection) to be synchronized with URL query parameters. This enables page reload persistence, shareable URLs, and browser back/forward navigation support (FR-034 through FR-044).

### Decision: Angular Router Query Params with Signal Store Integration

**Chosen Approach**: Use Angular Router's `queryParamsHandling` with NgRx Signal Store as the single source of truth. URL changes trigger store updates; store changes trigger URL updates via Router navigation.

**Implementation Pattern**:
```typescript
// Signal store manages state
export const BookmarkBrowserStore = signalStore(
  { providedIn: 'root' },
  withState<ViewState>({
    filters: [],
    sort: null,
    page: 1,
    displayMode: 'list',
    tagFilterMode: 'or',
    selectedBookmarkIds: []
  }),
  
  // Methods to sync from URL
  withMethods((store, router = inject(Router), route = inject(ActivatedRoute)) => ({
    syncFromUrl: rxMethod<QueryParams>(
      pipe(
        tap((params) => {
          // Parse and update store from URL params
          patchState(store, parseUrlState(params));
        })
      )
    ),
    syncToUrl: () => {
      const state = getState(store);
      router.navigate([], {
        relativeTo: route,
        queryParams: serializeUrlState(state),
        queryParamsHandling: 'merge',
        replaceUrl: true // Don't create history entries for every change
      });
    }
  }))
);
```

**URL Parameter Format** (matching backend decorator pattern):
- Filters: `?filters=title:keyword:react&filters=created:daterange:2024-01-01_2024-12-31`
- Sort: `?sort=created:desc`
- Pagination: `?page=2`
- Display mode: `?view=card`
- Tag filter mode: `?tagMode=and`

**Rationale**:
- Leverages Angular Router's built-in URL management
- Signal store provides reactive state with computed values
- Single source of truth prevents sync issues
- `replaceUrl: true` avoids polluting browser history
- Format matches existing backend decorators for consistency

**Alternatives Considered**:
1. **Local Storage + URL**: Complex sync logic, storage quota issues, harder to debug
2. **URL as only source of truth**: Requires parsing on every access, no computed values, performance concerns
3. **State management library (NgRx Store)**: Heavier solution, more boilerplate, signals are sufficient for this use case

**Performance Considerations**:
- Debounce URL updates (300ms) to avoid excessive navigation during rapid filter changes
- Use `queryParamsHandling: 'merge'` to preserve unrelated params
- Serialize only non-default values to keep URLs concise

---

## Decision 2: Filter Extensibility Architecture

### Context
The filter system must be easily extensible to support new filter types without modifying core logic (FR-039 through FR-041). Currently supports: keyword, number, range, daterange, boolean. Future types might include: multi-select, autocomplete, etc.

### Decision: Registry-Based Filter Definition System

**Chosen Approach**: Define filters as configuration objects registered in a central registry. Each filter type maps to a UI component, parser, and validator.

**Filter Definition Structure**:
```typescript
export interface FilterDefinition<T = any> {
  id: string;
  field: string;
  label: string;
  type: FilterType; // 'keyword' | 'number' | 'range' | 'daterange' | 'boolean' | 'tags'
  component: Type<FilterComponent>; // Angular component
  defaultValue?: T;
  serialize: (value: T) => string; // Convert to URL format
  deserialize: (raw: string) => T; // Parse from URL
  validate?: (value: T) => boolean; // Optional validation
  config?: Record<string, any>; // Component-specific config
}

export const FILTER_REGISTRY = new InjectionToken<FilterDefinition[]>('FILTER_REGISTRY');

// Example registration
export const BOOKMARK_FILTERS: FilterDefinition[] = [
  {
    id: 'keyword',
    field: 'q',
    label: 'Search',
    type: 'keyword',
    component: KeywordFilterComponent,
    serialize: (value: string) => `q:keyword:${value}`,
    deserialize: (raw: string) => raw.split(':')[2],
  },
  {
    id: 'tags',
    field: 'tags',
    label: 'Tags',
    type: 'tags',
    component: TagFilterComponent,
    serialize: (value: string[]) => value.map(tag => `tags:keyword:${tag}`).join(','),
    deserialize: (raw: string) => raw.split(':')[2].split(','),
    config: { allowMultiple: true, mode: 'or' } // AND/OR toggle
  },
  // ... more filters
];
```

**Dynamic UI Rendering**:
```typescript
@Component({
  template: `
    <div class="filters-panel">
      @for (filter of filterDefinitions(); track filter.id) {
        <ng-container *ngComponentOutlet="filter.component; 
                                          inputs: { definition: filter, value: currentValue(filter.id) }" />
      }
    </div>
  `
})
export class BookmarkFiltersComponent {
  filterDefinitions = inject(FILTER_REGISTRY);
}
```

**Rationale**:
- Adding new filters requires only registering a definition - no core code changes
- Separation of concerns: UI component, serialization logic, validation
- Type-safe with generics
- Dependency injection makes filters easily testable and mockable
- Configuration supports filter-specific behavior (e.g., tag AND/OR mode)

**Alternatives Considered**:
1. **Hard-coded filter types with switch statements**: Not extensible, requires core changes for new filters
2. **Plugin system with dynamic imports**: Over-engineered for this use case, harder to test
3. **Directive-based approach**: Less type-safe, harder to compose, more Angular-specific magic

**Implementation Notes**:
- Filter components implement common `FilterComponent` interface
- Registry populated in module providers for easy override in tests
- Backend decorators already support the URL format via `parse-filters.decorator.ts`

---

## Decision 3: Display Mode Switching Implementation

### Context
Three display modes (List, Card, Moodboard) must switch without losing state (FR-006 through FR-012). Mode persists in URL and renders different bookmark layouts with same data.

### Decision: Component Composition with Conditional Rendering

**Chosen Approach**: Single container component with `@switch` directive to render mode-specific components. All modes receive same bookmark data from signal store.

**Implementation Pattern**:
```typescript
@Component({
  selector: 'app-bookmark-browser',
  template: `
    <app-bookmark-toolbar [displayMode]="displayMode()" (modeChange)="setDisplayMode($event)" />
    
    @switch (displayMode()) {
      @case ('list') {
        <app-bookmark-list [bookmarks]="bookmarks()" 
                          [selected]="selectedIds()"
                          (selectionChange)="toggleSelection($event)" />
      }
      @case ('card') {
        <app-bookmark-card-grid [bookmarks]="bookmarks()" 
                                [selected]="selectedIds()"
                                (selectionChange)="toggleSelection($event)" />
      }
      @case ('moodboard') {
        <app-bookmark-moodboard [bookmarks]="bookmarks()" 
                                [selected]="selectedIds()"
                                (selectionChange)="toggleSelection($event)" />
      }
    }
    
    <app-bookmark-selection-bar *ngIf="hasSelection()" 
                                [count]="selectedIds().length"
                                (clearSelection)="clearSelection()"
                                (deleteSelected)="deleteSelected()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookmarkBrowserComponent {
  private store = inject(BookmarkBrowserStore);
  
  bookmarks = this.store.filteredAndSortedBookmarks; // Computed signal
  displayMode = this.store.displayMode;
  selectedIds = this.store.selectedBookmarkIds;
  hasSelection = computed(() => this.selectedIds().length > 0);
  
  setDisplayMode(mode: DisplayMode) {
    this.store.setDisplayMode(mode);
    this.store.syncToUrl(); // Update URL
  }
}
```

**Display Mode Components**:
- **List**: Compact vertical layout with title, URL, metadata (table-like)
- **Card**: Grid layout with images, 2-4 columns responsive
- **Moodboard**: Masonry/Pinterest-style grid emphasizing images, 3-6 columns

**Rationale**:
- Angular `@switch` is efficient (only renders active component)
- Shared data from signal store ensures consistency
- Each mode component focuses on layout, not data fetching
- Mode selection visual feedback in toolbar
- OnPush change detection for performance

**Alternatives Considered**:
1. **Router outlets for each mode**: Unnecessary complexity, loses scroll position
2. **Single component with CSS classes**: Hard to maintain, mixing concerns
3. **Dynamic component loading**: Over-engineered, adds complexity for marginal lazy loading benefit

**Performance Optimizations**:
- `trackBy` functions in all `@for` loops using bookmark ID
- Virtual scrolling for Moodboard mode (if > 100 items)
- Image lazy loading with Intersection Observer
- Transition animations < 300ms

---

## Decision 4: Selection State Management Across Views

### Context
Multi-select bookmarks with state preserved across pagination, filtering, sorting, and display mode changes (FR-016). Selection is session-based, not persisted across browser sessions.

### Decision: Set-Based Selection with Bookmark IDs

**Chosen Approach**: Store selected bookmark IDs in Signal Store as a Set for O(1) lookups. Selection survives view changes but not page reloads.

**Implementation Pattern**:
```typescript
export const BookmarkBrowserStore = signalStore(
  withState<ViewState>({
    selectedBookmarkIds: [] as string[], // Stored as array for serialization
    // ... other state
  }),
  withComputed((state) => ({
    selectedIdsSet: computed(() => new Set(state.selectedBookmarkIds())), // For fast lookups
    selectedCount: computed(() => state.selectedBookmarkIds().length),
    isSelected: (bookmarkId: string) => computed(() => 
      state.selectedBookmarkIds().includes(bookmarkId)
    ),
    // Visible bookmarks on current page that are selected
    selectedVisibleBookmarks: computed(() => {
      const ids = new Set(state.selectedBookmarkIds());
      return state.filteredAndSortedBookmarks()
        .filter(b => ids.has(b.id));
    }),
  })),
  withMethods((store) => ({
    toggleSelection(bookmarkId: string) {
      const selected = [...store.selectedBookmarkIds()];
      const index = selected.indexOf(bookmarkId);
      if (index >= 0) {
        selected.splice(index, 1);
      } else {
        selected.push(bookmarkId);
      }
      patchState(store, { selectedBookmarkIds: selected });
    },
    selectAll() {
      // Select all visible bookmarks on current page
      const visibleIds = store.filteredAndSortedBookmarks()
        .slice((store.page() - 1) * PAGE_SIZE, store.page() * PAGE_SIZE)
        .map(b => b.id);
      const newSelected = new Set([...store.selectedBookmarkIds(), ...visibleIds]);
      patchState(store, { selectedBookmarkIds: Array.from(newSelected) });
    },
    deselectAll() {
      patchState(store, { selectedBookmarkIds: [] });
    },
    // When filters change, remove bookmarks that no longer match
    pruneInvalidSelections() {
      const validIds = new Set(store.filteredAndSortedBookmarks().map(b => b.id));
      const prunedSelection = store.selectedBookmarkIds()
        .filter(id => validIds.has(id));
      if (prunedSelection.length !== store.selectedBookmarkIds().length) {
        patchState(store, { selectedBookmarkIds: prunedSelection });
      }
    }
  }))
);
```

**Selection Persistence Rules** (per FR-016):
- ✅ Survives pagination (IDs stored, not positions)
- ✅ Survives display mode changes (IDs independent of rendering)
- ✅ Survives sorting (IDs unchanged by sort order)
- ✅ Partially survives filtering (only IDs matching filter kept) - per acceptance scenario 5
- ❌ Does NOT survive page reload (session-based per Assumption #5)

**Rationale**:
- ID-based selection is stable across view changes
- Set for O(1) lookup performance in rendering
- Computed signals reactively update UI when selection changes
- Pruning invalid selections prevents ghost selections after filters
- Clear separation between "all visible" and "all selected"

**Alternatives Considered**:
1. **Position-based selection**: Breaks on pagination/sort changes
2. **Persist to localStorage**: Adds complexity, stale selection issues, out of scope per clarification
3. **Server-side selection state**: Unnecessary for session-based feature, adds latency

**Edge Cases Handled**:
- Select All on page 2, navigate to page 1 → shows 0 selected on page 1, count still accurate
- Filter excludes selected bookmark → removed from selection automatically
- Delete selected bookmarks → selection cleared after successful delete

---

## Decision 5: Performance Optimization for Large Collections

### Context
System must handle collections with up to 1000 bookmarks while maintaining performance targets: < 2s initial load, < 1s filter application, < 500ms display mode switch (SC-001, SC-002, SC-003).

### Decision: Multi-Layer Optimization Strategy

**Chosen Approaches**:

#### 1. Server-Side Pagination and Filtering
```typescript
// Backend returns paginated results only
@Get('collections/:collectionId/bookmarks')
async getBookmarks(
  @Param('collectionId') collectionId: string,
  @Query('page') page = 1,
  @Query('pageSize') pageSize = 20, // List/Card: 20, Moodboard: 30
  @ParseFilters() filters: Filter[],
  @ParseSort() sort: Sort[]
) {
  // Database query with WHERE clauses for filters, ORDER BY for sort, LIMIT/OFFSET for pagination
  // Returns only the requested page + total count for pagination UI
  return {
    bookmarks: [...], // 20-30 items
    totalCount: 847,
    page: 2,
    pageSize: 20,
    totalPages: 43
  };
}
```

**Benefits**:
- Only transfers necessary data over network
- Database indexes optimize filtering and sorting
- Constant memory usage regardless of collection size

#### 2. Client-Side Virtual Scrolling (Moodboard Mode Only)
```typescript
// For Moodboard with 30 items per page, use CDK Virtual Scroll
<cdk-virtual-scroll-viewport itemSize="250" class="moodboard-viewport">
  @for (bookmark of bookmarks(); track bookmark.id) {
    <app-bookmark-card [bookmark]="bookmark" />
  }
</cdk-virtual-scroll-viewport>
```

**Benefits**: Only renders visible items + buffer, improves scroll performance

#### 3. Image Optimization
```typescript
// Lazy loading with Intersection Observer
<img [src]="bookmark.thumbnailUrl" 
     loading="lazy" 
     [attr.width]="200"
     [attr.height]="150"
     alt="{{ bookmark.title }}" />

// Backend: Generate thumbnails on upload
// - Resize to 400x300 max (2x for retina)
// - Convert to WebP with JPEG fallback
// - Store in CDN/object storage
```

#### 4. Change Detection Optimization
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush, // All components
  // Use trackBy for loops
  template: `
    @for (bookmark of bookmarks(); track bookmark.id) {
      <app-bookmark-card [bookmark]="bookmark" />
    }
  `
})
```

#### 5. Debouncing and Throttling
```typescript
// Debounce filter input (keyword search)
keywordFilter$ = this.keywordControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  tap(value => this.store.updateFilter('keyword', value))
);

// Throttle URL updates
private updateUrl = throttle(() => {
  this.store.syncToUrl();
}, 300, { leading: false, trailing: true });
```

**Performance Targets Verification**:
- **Initial load < 2s**: Server pagination (20 items) + parallel image loading + OnPush CD
- **Filter < 1s**: Server-side filtering with database indexes + debounced input
- **Mode switch < 500ms**: Component swap with Angular @switch + shared data

**Rationale**:
- Server-side operations leverage database query optimization
- Client-side optimizations reduce rendering cost
- Layered approach addresses multiple bottlenecks
- Aligns with browser performance best practices

**Monitoring**:
- Lighthouse performance scores (target > 90)
- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Server endpoint metrics (p95 < 500ms)

---

## Decision 6: Loading Indicator and Cancellation Patterns

### Context
Operations exceeding 500ms must show loading indicator; operations exceeding 2 seconds must provide cancellation (FR-007, FR-008, per clarification Q4).

### Decision: RxJS-Based Loading State with AbortController

**Chosen Approach**: Signal store tracks loading state; RxJS operators manage timeouts; AbortController enables cancellation.

**Implementation Pattern**:
```typescript
export const BookmarkBrowserStore = signalStore(
  withState({
    isLoading: false,
    loadingMessage: null as string | null,
    canCancel: false,
    currentRequest: null as AbortController | null,
  }),
  withMethods((store, api = inject(BookmarkBrowserApi)) => ({
    loadBookmarks: rxMethod<void>(
      pipe(
        tap(() => {
          // Immediate: Set loading state
          patchState(store, { isLoading: false, canCancel: false });
        }),
        delay(500), // Wait 500ms before showing indicator
        tap(() => {
          patchState(store, { isLoading: true, loadingMessage: 'Loading bookmarks...' });
        }),
        delay(1500), // Additional 1.5s = 2s total for cancel button
        tap(() => {
          patchState(store, { canCancel: true });
        }),
        switchMap(() => {
          const abortController = new AbortController();
          patchState(store, { currentRequest: abortController });
          
          return api.getBookmarks({ signal: abortController.signal }).pipe(
            tap(bookmarks => {
              patchState(store, { 
                bookmarks,
                isLoading: false,
                canCancel: false,
                currentRequest: null,
                loadingMessage: null
              });
            }),
            catchError(error => {
              if (error.name === 'AbortError') {
                // Cancellation
                patchState(store, { 
                  isLoading: false, 
                  canCancel: false, 
                  currentRequest: null,
                  loadingMessage: null 
                });
              } else {
                // Actual error
                patchState(store, { 
                  isLoading: false, 
                  error: error.message 
                });
              }
              return EMPTY;
            })
          );
        })
      )
    ),
    cancelLoading() {
      const controller = store.currentRequest();
      if (controller) {
        controller.abort();
      }
    }
  }))
);
```

**UI Component**:
```typescript
@Component({
  template: `
    @if (isLoading()) {
      <div class="loading-overlay">
        <div class="loading-content">
          <app-spinner />
          <p>{{ loadingMessage() }}</p>
          @if (canCancel()) {
            <button (click)="cancelLoading()" class="btn-cancel">
              Cancel
            </button>
          }
        </div>
      </div>
    }
  `
})
```

**Loading States**:
- **0-500ms**: No indicator (fast operations shouldn't flash UI)
- **500ms-2s**: Spinner + message (no cancel)
- **2s+**: Spinner + message + Cancel button

**Rationale**:
- 500ms delay prevents loading flicker for fast operations
- 2s threshold for cancellation balances UX and implementation
- AbortController is native browser API for request cancellation
- RxJS operators provide declarative timeout handling
- Signal store reactively updates UI based on loading state

**Alternatives Considered**:
1. **Immediate loading indicator**: Causes annoying flash for fast operations
2. **No cancellation**: Poor UX for slow networks or large datasets
3. **Promise-based cancellation**: More complex, less standardized than AbortController

**Backend Support**:
```typescript
// NestJS controller must support AbortSignal
@Get('bookmarks')
async getBookmarks(@Req() req: Request) {
  // Express/Fastify abort event
  req.on('close', () => {
    // Clean up ongoing database queries if possible
  });
}
```

---

## Decision 7: Tag Filter AND/OR Mode Implementation

### Context
Tag filtering must support both AND logic (all selected tags) and OR logic (any selected tag) with UI toggle and URL persistence (FR-029, FR-030, per clarification Q3).

### Decision: Mode Toggle with Server-Side Logic Translation

**Chosen Approach**: Frontend sends tags as separate filter entries; include mode parameter; backend interprets based on mode.

**URL Format**:
```
# OR mode (default): bookmark has at least one tag
?filters=tags:keyword:work&filters=tags:keyword:important&tagMode=or

# AND mode: bookmark must have all tags
?filters=tags:keyword:work&filters=tags:keyword:important&tagMode=and
```

**Backend Implementation**:
```typescript
// bookmarks.service.ts
buildTagFilterQuery(tags: string[], mode: 'and' | 'or', queryBuilder: QueryBuilder) {
  if (mode === 'or') {
    // SQL: WHERE bookmark.tags && ARRAY['work', 'important'] (PostgreSQL array overlap)
    queryBuilder.andWhere('bookmark.tags && ARRAY[:...tags]', { tags });
  } else {
    // SQL: WHERE bookmark.tags @> ARRAY['work', 'important'] (PostgreSQL array contains)
    queryBuilder.andWhere('bookmark.tags @> ARRAY[:...tags]', { tags });
  }
}
```

**Frontend UI**:
```typescript
@Component({
  selector: 'app-tag-filter',
  template: `
    <div class="tag-filter">
      <label>Tags</label>
      <app-tag-selector [(selected)]="selectedTags" />
      
      @if (selectedTags().length > 1) {
        <div class="tag-mode-toggle">
          <button [class.active]="tagMode() === 'or'"
                  (click)="setTagMode('or')">
            Any (OR)
          </button>
          <button [class.active]="tagMode() === 'and'"
                  (click)="setTagMode('and')">
            All (AND)
          </button>
        </div>
      }
      
      <small class="hint">
        @if (tagMode() === 'or') {
          Bookmarks with <strong>any</strong> selected tag
        } @else {
          Bookmarks with <strong>all</strong> selected tags
        }
      </small>
    </div>
  `
})
```

**Rationale**:
- Clear UI feedback showing logic mode
- Toggle only appears when multiple tags selected (single tag doesn't need AND/OR)
- Server-side logic ensures correct database query
- Mode persists in URL for shareable filtered views
- PostgreSQL array operators handle both modes efficiently

**Database Indexing**:
```sql
-- GIN index for fast tag queries
CREATE INDEX idx_bookmarks_tags ON bookmarks USING GIN (tags);
```

**Alternatives Considered**:
1. **Client-side filtering**: Doesn't scale with large collections, requires loading all data
2. **Separate filter types**: Adds complexity, harder to understand for users
3. **Always AND logic**: Less flexible, doesn't match common use cases (show work OR important)

---

## Implementation Recommendations

### Development Order (Critical Path)
1. **Backend Authorization** (FR-001): Owner verification for all operations
2. **Database Schema**: Ensure bookmark/collection entities with proper indexes
3. **Backend API**: GET bookmarks with filters/sort/pagination + DELETE bulk
4. **Frontend Store**: NgRx Signal store with state management
5. **URL Sync Service**: Bidirectional URL <-> Store synchronization
6. **Display Components**: List → Card → Moodboard (order by complexity)
7. **Filter UI**: Registry + individual filter components
8. **Selection System**: Multi-select with toolbar
9. **Loading States**: Indicators and cancellation
10. **E2E Testing**: Full user journey validation

### Testing Strategy
- **Unit**: Filter parsing, URL serialization, store methods, authorization logic
- **Integration**: API endpoints with filters, pagination, authorization
- **Component**: Display modes, filter interactions, selection behavior
- **E2E**: Complete bookmark browsing journey, URL sharing, reload persistence

### Performance Validation
- Load test with 1000 bookmark collection
- Network throttling for slow connections
- Browser testing across target browsers
- Lighthouse CI integration

### Documentation
- API documentation in Swagger
- Component library in Storybook (if applicable)
- Developer quickstart guide
- Architecture decision records (this document)

---

## Open Questions for Phase 1

*To be resolved during detailed design:*

1. ~~Tag AND/OR mode~~ - **RESOLVED** in Decision 7
2. ~~Performance degradation handling~~ - **RESOLVED** in Decision 6
3. ~~Selection persistence across views~~ - **RESOLVED** in Decision 4
4. Exact thumbnail dimensions for each display mode (design spec needed)
5. Empty state messaging variations (no bookmarks vs. no results vs. error)
6. Accessibility: Keyboard navigation flow for display mode switching
7. Mobile responsive breakpoints for Card/Moodboard grids

---

## References

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Constitution](../../.specify/memory/constitution.md)
- [Existing Filter Decorator](../../server/src/shared/decorators/parse-filters.decorator.ts)
- [Existing Sort Decorator](../../server/src/shared/decorators/parse-sorts.decorator.ts)

---

**Phase 0 Status**: ✅ Complete  
**Next Phase**: Phase 1 - Data Model and Contracts

