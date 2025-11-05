# State Management System Documentation

## 1. Overview

### Purpose of the Documentation
This documentation provides a comprehensive guide to the state management system implemented in the My Collection application. It serves as a technical reference for understanding the architecture, patterns, and best practices used throughout the application's state management layer.

### Target Audience
This documentation is intended for:
- Frontend developers working with Angular and NgRx Signals
- Team members implementing new features requiring state management
- Code reviewers and maintainers
- New team members onboarding to the project

### Scope of the State Management System
The state management system covers:
- Authentication state management
- Bookmark collection and management
- Collection organization and hierarchy
- API integration patterns
- Loading states and error handling
- Data persistence and synchronization

## 2. Technical Stack

### Core State Management Libraries
- **@ngrx/signals**: Version `^20.0.0` - Primary state management library using Angular Signals
- **Angular**: Version `20.1.0` - Framework providing reactive primitives and dependency injection
- **RxJS**: Reactive programming library for handling asynchronous operations

### Complementary Technologies
- **TypeScript**: Strict typing for state definitions and type safety
- **Angular HTTP Client**: For API communication and interceptors
- **Custom Signal Store Features**: Extended functionality for status management and entity handling

### Development Tools
- **Angular DevTools**: For debugging and state inspection
- **TypeScript ESLint**: Code quality and consistency enforcement
- **Prettier**: Code formatting

## 3. Folder Structure

### Authentication Data Access (`client/libs/web/auth/data-access`)
```
auth/data-access/
├── src/lib/
│   ├── models/                    # Type definitions and interfaces
│   │   ├── auth-tokens.ts         # Authentication token models
│   │   ├── login-credentials.ts   # Login form data types
│   │   └── index.ts              # Barrel exports
│   ├── state/                     # State management implementation
│   │   ├── auth.api.ts           # API service for authentication
│   │   ├── auth.effects.ts       # Side effects handling
│   │   ├── auth.event.ts         # Event definitions
│   │   ├── auth.reducer.ts       # State reducers
│   │   └── auth.store.ts         # Main store configuration
│   └── index.ts                  # Main barrel export
```

**Purpose**: Manages user authentication state, token handling, and session management.

### Bookmark Data Access (`client/libs/web/bookmark/data-access`)
```
bookmark/data-access/
├── src/lib/
│   ├── models/                    # Data transfer objects and types
│   │   ├── bookmark-create.dto.ts # Creation payload structure
│   │   ├── bookmark-filter.dto.ts # Filtering and search parameters
│   │   ├── bookmark-update.dto.ts # Update payload structure
│   │   ├── bookmark.dto.ts       # Main bookmark entity type
│   │   └── index.ts              # Barrel exports
│   ├── services/                  # API communication layer
│   │   ├── bookmark.api.ts       # HTTP service for bookmark operations
│   │   └── index.ts              # Service exports
│   ├── stores/                    # State store implementation
│   │   ├── bookmark.store.ts     # Signal store configuration
│   │   └── index.ts              # Store exports
│   └── index.ts                  # Main barrel export
```

**Purpose**: Handles bookmark CRUD operations, filtering, and state management for bookmark entities.

### Collection Data Access (`client/libs/web/collection/data-access`)
```
collection/data-access/
├── src/lib/
│   ├── models/                    # Collection-related types
│   │   ├── collection-filter.ts  # Filter and query parameters
│   │   ├── collection.ts         # Main collection entity
│   │   ├── create-collection.ts  # Creation payload
│   │   ├── delete-collection.ts  # Deletion parameters
│   │   ├── move-collection.ts    # Move operation payload
│   │   ├── update-collection.ts  # Update payload
│   │   └── index.ts              # Model exports
│   ├── services/                  # API and adapter services
│   │   ├── collection.adapter.ts # Data transformation layer
│   │   ├── collection.api.ts     # HTTP service implementation
│   │   ├── collection.mock.api.ts # Mock service for testing
│   │   └── index.ts              # Service exports
│   ├── stores/                    # State management
│   │   ├── collection.store.ts   # Signal store with hierarchical support
│   │   └── index.ts              # Store exports
│   └── index.ts                  # Main barrel export
```

**Purpose**: Manages collection hierarchies, organization, and relationships between collections and bookmarks.

### File Naming Conventions
- **Models**: Use descriptive names with `.ts` extension (e.g., `bookmark.dto.ts`)
- **Services**: End with `.api.ts` for HTTP services, `.adapter.ts` for data transformation
- **Stores**: End with `.store.ts` for state management implementations
- **Types**: Use kebab-case with descriptive suffixes (`.dto.ts`, `.filter.ts`)

### Relationship Between Folders
- **Auth**: Provides authentication context for all other modules
- **Bookmark**: Depends on auth for user-specific data, integrates with collections
- **Collection**: Hierarchical container for bookmarks, depends on auth for ownership

## 4. API Integration

### Standard Patterns for API State Management

#### HTTP Service Implementation
```typescript
@Injectable({ providedIn: "root" })
export class HttpService implements OnInitConfig {
  protected readonly _http = inject(HttpClient);
  protected readonly _headers = new HttpHeaders({ "Content-Type": "application/json" });
  protected readonly _options = { headers: this._headers, withCredentials: true };
  protected _baseUrl!: string;

  get<T extends ResponseDto>(url: string, options?: Partial<HttpOptions>): Observable<T> {
    const mergedOptions = this._mergeOptions(options);
    return this._http.get<T>(this._baseUrl + url, mergedOptions);
  }

  post<T extends ResponseDto, K = unknown>(
    url: string, 
    body: K, 
    options?: Partial<HttpOptions>
  ): Observable<T> {
    const mergedOptions = this._mergeOptions(options);
    return this._http.post<T>(this._baseUrl + url, body, mergedOptions);
  }
}
```

#### API Service Pattern
```typescript
@Injectable({ providedIn: "root" })
export class BookmarkApi {
  private readonly _http = inject(HttpService);

  loadBookmarks(filter?: BookmarkFilterDto): Observable<ListResponseDto<BookmarkDto>> {
    return this._http.get<ListResponseDto<BookmarkDto>>(
      API_ENDPOINTS.BOOKMARKS.BASE,
      { params: filter }
    );
  }

  createBookmark(bookmark: BookmarkCreateDto): Observable<SingleResponseDto<BookmarkDto>> {
    return this._http.post<SingleResponseDto<BookmarkDto>>(
      API_ENDPOINTS.BOOKMARKS.BASE,
      bookmark
    );
  }
}
```

### HTTP Integration Patterns

The application uses the `tapHandleApi` utility for consistent HTTP API integration across all stores:

```typescript
// tapHandleApi provides unified handling for API calls
import { tapHandleApi } from "@client/web-core-http";

// Example from bookmark.store.ts
load: rxMethod<BookmarkFilterDto>(
  pipe(
    switchMap(filter =>
      _bookmarkApi.loadBookmarks(filter).pipe(
        tapHandleApi({
          successFn: result => {
            patchState(store, setAllEntities(result.items));
          },
          errorFn: error => {
            console.error('Failed to load bookmarks:', error);
          },
          statusFn: status => {
            patchState(store, setStatus(status, bookmarkStatusNames.list));
          },
        })
      )
    )
  )
)
```

#### tapHandleApi Features

The `tapHandleApi` operator provides:

- **Automatic Status Management**: Sets status to "pending" → "fulfilled" or error
- **Response Data Unwrapping**: Automatically extracts data from `ResponseDto<T>`
- **Consistent Error Handling**: Standardized error processing and logging
- **Type Safety**: Full TypeScript support with generic types
- **Flexible Callbacks**: Optional success, error, status, and finalization handlers

#### tapHandleApi Configuration

```typescript
type ApiHandleOptions<TData, TError> = {
  successFn: (data: TData) => void;        // Required: Handle successful response
  errorFn?: (error: TError) => void;       // Optional: Handle errors
  statusFn?: (status: Status) => void;     // Optional: Track loading states
  finalFn?: () => void;                    // Optional: Cleanup/finalization
};
```

### Error Handling Patterns

#### Custom Error Operators
```typescript
// Generic error handling
export function tapError<T>(
  callback?: (error: HttpErrorResponse) => void
): OperatorFunction<T, T> {
  return catchError((error: HttpErrorResponse) => {
    if (callback) {
      callback(error);
    }
    return EMPTY; // Complete the stream
  });
}

// Validation-specific error handling
export function tapValidationErrors<T>(
  callback: (error: HttpErrorResponse) => void
): OperatorFunction<HttpClientResponse<T>, HttpClientResponse<T>> {
  return catchError((error: HttpErrorResponse | Error) => {
    if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.BadRequest) {
      callback(error);
      return EMPTY;
    }
    throw error; // Re-throw non-validation errors
  });
}
```


### Loading State Management

#### Status Feature Implementation
```typescript
export function withStatus<Name extends string>(config?: { name: Name }) {
  return signalStoreFeature(
    withState(() => ({ status: "idle" as Status })),
    withComputed((store) => {
      const $status = store.status as Signal<Status>;
      return {
        $isPending: computed(() => $status() === "pending"),
        $isFulfilled: computed(() => $status() === "fulfilled"),
        $error: computed(() => {
          const status = $status();
          return typeof status === "object" ? status.error : null;
        }),
      };
    })
  );
}

// Usage in store methods
async loadBookmarks(filter?: BookmarkFilterDto): Promise<void> {
  patchState(this, setPending("load"));
  
  try {
    const response = await firstValueFrom(this._api.loadBookmarks(filter));
    patchState(this, 
      setAllEntities(response.result.data),
      setFulfilled("load")
    );
  } catch (error) {
    patchState(this, setError(error, "load"));
  }
}
```

## 5. Store Architecture

### Core Store Implementation

#### Signal Store Configuration
```typescript
export const BookmarkStore = signalStore(
  { providedIn: "root" },
  
  // Entity management for bookmark collections
  withEntities<BookmarkDto>(),
  
  // Status tracking for async operations
  withStatus({ names: bookmarkStatusNames }),
  
  // Additional state properties
  withProps<BookmarkStateWithFeature>(() => ({
    filter: null,
    selectedBookmarkId: null,
  })),
  
  // Computed values and derived state
  withComputed(({ entities, selectedBookmarkId }) => ({
    selectedBookmark: computed(() => {
      const id = selectedBookmarkId();
      return id ? entities().find(b => b.id === id) : null;
    }),
  })),
  
  // Store methods for state mutations
  withMethods((store, api = inject(BookmarkApi)) => ({
    async loadBookmarks(filter?: BookmarkFilterDto): Promise<void> {
      // Implementation with status management
    },
    
    async createBookmark(bookmark: BookmarkCreateDto): Promise<void> {
      // Implementation with optimistic updates
    },
  }))
);
```

### Store Initialization Process

1. **Dependency Injection**: Services are injected using Angular's `inject()` function
2. **Initial State**: Default values are set for entities, status, and properties
3. **Computed Signals**: Derived state is calculated reactively
4. **Method Binding**: Async operations are bound with proper error handling

### Store Configuration Options

#### Entity Management
- `withEntities<T>()`: Provides CRUD operations for entity collections
- `setAllEntities()`: Replaces entire entity collection
- `addEntity()`: Adds single entity with deduplication
- `updateEntity()`: Updates existing entity by ID
- `removeEntity()`: Removes entity by ID

#### Status Management
- `withStatus({ names: [...] })`: Creates named status states
- `setPending(name)`: Sets loading state for specific operation
- `setFulfilled(name)`: Sets success state
- `setError(error, name)`: Sets error state with error details

#### State Properties
- `withProps<T>()`: Adds custom state properties
- `withComputed()`: Creates reactive computed values
- `withMethods()`: Defines store actions and mutations

### Sample Store Structure
```typescript
// State shape for BookmarkStore
interface BookmarkState {
  // Entity management
  entities: BookmarkDto[];
  ids: string[];
  
  // Status tracking
  loadStatus: Status;
  createStatus: Status;
  updateStatus: Status;
  deleteStatus: Status;
  
  // Additional properties
  filter: BookmarkFilterDto | null;
  selectedBookmarkId: string | null;
  
  // Computed signals (read-only)
  $isLoadPending: Signal<boolean>;
  $loadError: Signal<unknown>;
  selectedBookmark: Signal<BookmarkDto | null>;
}
```

## 6. Using State

### Component-Level State Usage

#### Injecting Stores
```typescript
@Component({
  selector: 'app-bookmark-list',
  templateUrl: './bookmark-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkListComponent {
  private readonly _bookmarkStore = inject(BookmarkStore);
  
  // Reactive state access
  protected readonly $bookmarks = this._bookmarkStore.entities;
  protected readonly $isLoading = this._bookmarkStore.$isLoadPending;
  protected readonly $error = this._bookmarkStore.$loadError;
  
  ngOnInit(): void {
    this._bookmarkStore.loadBookmarks();
  }
  
  onCreateBookmark(bookmark: BookmarkCreateDto): void {
    this._bookmarkStore.createBookmark(bookmark);
  }
}
```

#### Template Usage
```html
<div class="bookmark-list">
  @if ($isLoading()) {
    <div class="loading-spinner">Loading bookmarks...</div>
  } @else if ($error()) {
    <div class="error-message">Error: {{ $error() }}</div>
  } @else {
    @for (bookmark of $bookmarks(); track bookmark.id) {
      <bookmark-card [bookmark]="bookmark" />
    }
  }
</div>
```

### Global State Access Patterns

#### Cross-Store Dependencies
```typescript
export const CollectionStore = signalStore(
  { providedIn: "root" },
  withState<CollectionState>(() => ({ ... })),
  withMethods((store, bookmarkStore = inject(BookmarkStore)) => ({
    async deleteCollection(id: string): Promise<void> {
      // Update collection state
      await this._api.deleteCollection(id);
      
      // Trigger bookmark refresh if needed
      bookmarkStore.loadBookmarks();
    },
  }))
);
```

### State Update Mechanisms

#### Optimistic Updates
```typescript
async createBookmark(bookmark: BookmarkCreateDto): Promise<void> {
  // Optimistic update
  const tempId = generateTempId();
  const optimisticBookmark = { ...bookmark, id: tempId };
  
  patchState(this, 
    addEntity(optimisticBookmark),
    setPending("create")
  );
  
  try {
    const response = await firstValueFrom(this._api.createBookmark(bookmark));
    
    // Replace optimistic entity with real data
    patchState(this, 
      updateEntity({ id: tempId, changes: response.result }),
      setFulfilled("create")
    );
  } catch (error) {
    // Rollback optimistic update
    patchState(this, 
      removeEntity(tempId),
      setError(error, "create")
    );
  }
}
```

#### Batch Updates
```typescript
async updateMultipleBookmarks(updates: BookmarkUpdateDto[]): Promise<void> {
  patchState(this, setPending("batchUpdate"));
  
  try {
    const responses = await Promise.all(
      updates.map(update => firstValueFrom(this._api.updateBookmark(update)))
    );
    
    // Apply all updates in single state patch
    patchState(this, 
      ...responses.map(response => updateEntity({
        id: response.result.id,
        changes: response.result
      })),
      setFulfilled("batchUpdate")
    );
  } catch (error) {
    patchState(this, setError(error, "batchUpdate"));
  }
}
```

### Performance Considerations

#### Signal Optimization
- Use `computed()` for derived state to leverage automatic memoization
- Avoid creating signals in component methods; prefer class properties
- Use `OnPush` change detection strategy with signal-based components

#### Memory Management
- Implement cleanup in `ngOnDestroy` for long-running subscriptions
- Use `takeUntilDestroyed()` operator for automatic subscription cleanup
- Consider implementing store reset methods for memory-intensive operations

## 7. Types of State

### Classification of State Types

#### Local Component State
**Purpose**: UI-specific state that doesn't need to be shared
**Examples**: Form validation, modal visibility, local filters
**Implementation**: Component-level signals or reactive forms

```typescript
@Component({...})
export class BookmarkFormComponent {
  private readonly _isModalOpen = signal(false);
  private readonly _validationErrors = signal<string[]>([]);
  
  protected readonly $canSubmit = computed(() => 
    this._form.valid && !this._validationErrors().length
  );
}
```

#### Global Application State
**Purpose**: Data shared across multiple components and routes
**Examples**: User authentication, bookmark collections, application settings
**Implementation**: Injectable signal stores

```typescript
export const AuthStore = signalStore(
  { providedIn: "root" },
  withState<AuthState>(() => ({ ... }))
);
```

#### Session State
**Purpose**: Temporary state that persists during user session
**Examples**: Navigation history, temporary selections, draft data
**Implementation**: Session storage integration with signal stores

```typescript
export const SessionStore = signalStore(
  { providedIn: "root" },
  withState(() => ({ draftBookmark: null })),
  withStorageSync({
    key: 'session-state',
    storage: () => sessionStorage
  })
);
```

#### Persistent State
**Purpose**: Data that survives browser sessions and page reloads
**Examples**: User preferences, cached data, offline state
**Implementation**: Local storage integration with signal stores

### Recommended Handling for Each State Type

#### Local State Guidelines
- Keep state close to where it's used
- Use component-level signals for simple UI state
- Implement reactive forms for complex form state
- Avoid lifting state unnecessarily

#### Global State Guidelines
- Use signal stores for shared business logic
- Implement proper error boundaries
- Design for concurrent access patterns
- Consider state normalization for complex relationships

#### Session State Guidelines
- Implement automatic cleanup on session end
- Use for navigation state and temporary data
- Consider security implications for sensitive data
- Implement fallback for storage unavailability

#### Persistent State Guidelines
- Implement versioning for schema changes
- Use encryption for sensitive data
- Implement migration strategies
- Consider storage quotas and cleanup policies

### State Persistence Strategies

#### Storage Sync Feature
```typescript
export function withStorageSync<T>(config: {
  key: string;
  storage: () => Storage;
  serialize?: (state: T) => string;
  deserialize?: (data: string) => T;
}) {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        // Load from storage on initialization
        const stored = config.storage().getItem(config.key);
        if (stored) {
          const data = config.deserialize?.(stored) ?? JSON.parse(stored);
          patchState(store, data);
        }
        
        // Save to storage on state changes
        effect(() => {
          const state = getState(store);
          const serialized = config.serialize?.(state) ?? JSON.stringify(state);
          config.storage().setItem(config.key, serialized);
        });
      }
    })
  );
}
```

### State Validation Approaches

#### Runtime Validation
```typescript
export function withValidation<T>(validator: (state: T) => boolean) {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        effect(() => {
          const state = getState(store);
          if (!validator(state)) {
            console.warn('Invalid state detected:', state);
            // Implement recovery logic
          }
        });
      }
    })
  );
}
```

#### Type-Safe State Updates
```typescript
// Use branded types for additional type safety
type BookmarkId = string & { readonly brand: unique symbol };
type CollectionId = string & { readonly brand: unique symbol };

interface TypedBookmarkState {
  selectedBookmarkId: BookmarkId | null;
  selectedCollectionId: CollectionId | null;
}
```

## 8. Best Practices

### State Organization Guidelines

#### Store Separation
- **Single Responsibility**: Each store should manage one domain of state
- **Bounded Context**: Align stores with business domain boundaries
- **Dependency Direction**: Higher-level stores can depend on lower-level ones, not vice versa

### HTTP API Integration Guidelines

#### Always Use tapHandleApi
- **Consistent Error Handling**: Ensures uniform error processing across all API calls
- **Automatic Status Management**: Handles pending/fulfilled/error states automatically
- **Type Safety**: Provides full TypeScript support with proper generic types
- **Response Unwrapping**: Automatically extracts data from ResponseDto wrapper

#### Implementation Best Practices
```typescript
// ✅ Good: Complete tapHandleApi usage
load: rxMethod<BookmarkFilterDto>(
  pipe(
    switchMap(filter =>
      _bookmarkApi.loadBookmarks(filter).pipe(
        tapHandleApi({
          successFn: result => {
            patchState(store, setAllEntities(result.items));
          },
          errorFn: error => {
            console.error('Failed to load bookmarks:', error);
            // Additional error handling logic
          },
          statusFn: status => {
            patchState(store, setStatus(status, bookmarkStatusNames.list));
          },
        })
      )
    )
  )
)

// ❌ Avoid: Manual error handling without tapHandleApi
load: rxMethod<BookmarkFilterDto>(
  pipe(
    switchMap(filter => {
      patchState(store, setPending('load'));
      return _bookmarkApi.loadBookmarks(filter).pipe(
        tap(result => {
          patchState(store, setAllEntities(result.data), setFulfilled('load'));
        }),
        catchError(error => {
          patchState(store, setError(error, 'load'));
          return EMPTY;
        })
      );
    })
  )
)
```

#### Error Handling Guidelines
- **Provide Context**: Include operation-specific error messages
- **Log Appropriately**: Use console.error for development, proper logging service for production
- **Handle Different Error Types**: Distinguish between validation, network, and server errors
- **User-Friendly Messages**: Transform technical errors into user-understandable messages

#### State Shape Design
```typescript
// ✅ Good: Normalized and flat structure
interface BookmarkState {
  entities: Record<string, BookmarkDto>;
  ids: string[];
  selectedId: string | null;
  filter: BookmarkFilterDto | null;
}

// ❌ Avoid: Deeply nested structures
interface BadBookmarkState {
  bookmarks: {
    [categoryId: string]: {
      items: BookmarkDto[];
      metadata: {
        lastUpdated: Date;
        count: number;
      };
    };
  };
}
```

### State Update Optimization Techniques

#### Batch Updates
```typescript
// ✅ Good: Single state patch for multiple changes
patchState(store, 
  addEntity(newBookmark),
  updateEntity({ id: existingId, changes: updates }),
  setFulfilled("operation")
);

// ❌ Avoid: Multiple separate patches
patchState(store, addEntity(newBookmark));
patchState(store, updateEntity({ id: existingId, changes: updates }));
patchState(store, setFulfilled("operation"));
```

#### Selective Updates
```typescript
// ✅ Good: Update only changed properties
updateEntity({ 
  id: bookmarkId, 
  changes: { title: newTitle, lastModified: new Date() } 
});

// ❌ Avoid: Replacing entire entity
setEntity({ ...existingBookmark, title: newTitle });
```

### Testing Strategies

#### Store Testing
```typescript
describe('BookmarkStore', () => {
  let store: InstanceType<typeof BookmarkStore>;
  let mockApi: jasmine.SpyObj<BookmarkApi>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('BookmarkApi', ['loadBookmarks', 'createBookmark']);
    
    TestBed.configureTestingModule({
      providers: [
        BookmarkStore,
        { provide: BookmarkApi, useValue: mockApi }
      ]
    });
    
    store = TestBed.inject(BookmarkStore);
  });

  it('should load bookmarks successfully', async () => {
    const mockBookmarks = [{ id: '1', title: 'Test' }];
    mockApi.loadBookmarks.and.returnValue(of({ result: { data: mockBookmarks } }));

    await store.loadBookmarks();

    expect(store.entities()).toEqual(mockBookmarks);
    expect(store.$isLoadPending()).toBeFalse();
  });
});
```

#### Component Testing with Stores
```typescript
describe('BookmarkListComponent', () => {
  let component: BookmarkListComponent;
  let mockStore: jasmine.SpyObj<BookmarkStore>;

  beforeEach(() => {
    mockStore = jasmine.createSpyObj('BookmarkStore', ['loadBookmarks'], {
      entities: signal([]),
      $isLoadPending: signal(false)
    });

    TestBed.configureTestingModule({
      imports: [BookmarkListComponent],
      providers: [{ provide: BookmarkStore, useValue: mockStore }]
    });

    const fixture = TestBed.createComponent(BookmarkListComponent);
    component = fixture.componentInstance;
  });

  it('should load bookmarks on init', () => {
    component.ngOnInit();
    expect(mockStore.loadBookmarks).toHaveBeenCalled();
  });
});
```

### Debugging Methods

#### Store State Inspection
```typescript
// Development helper for state debugging
export function withDevtools<T>(storeName: string) {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        if (!environment.production) {
          effect(() => {
            const state = getState(store);
            console.group(`${storeName} State Update`);
            console.log('Current State:', state);
            console.groupEnd();
          });
        }
      }
    })
  );
}
```

#### Error Tracking
```typescript
export function withErrorTracking() {
  return signalStoreFeature(
    withMethods((store) => ({
      trackError(error: unknown, operation: string): void {
        console.error(`Error in ${operation}:`, error);
        
        // Send to error tracking service
        if (environment.production) {
          errorTrackingService.captureException(error, {
            tags: { operation, store: store.constructor.name }
          });
        }
      }
    }))
  );
}
```

## 9. Implementation Steps

### Step-by-Step Guide for Creating New State

#### 1. Define Models and Types
```typescript
// models/feature.dto.ts
export interface FeatureDto {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureCreateDto {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface FeatureUpdateDto {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface FeatureFilterDto {
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

#### 2. Implement API Service
```typescript
// services/feature.api.ts
@Injectable({ providedIn: 'root' })
export class FeatureApi {
  private readonly _http = inject(HttpService);

  loadFeatures(filter?: FeatureFilterDto): Observable<ListResponseDto<FeatureDto>> {
    return this._http.get<ListResponseDto<FeatureDto>>(
      API_ENDPOINTS.FEATURES.BASE,
      { params: filter }
    );
  }

  createFeature(feature: FeatureCreateDto): Observable<SingleResponseDto<FeatureDto>> {
    return this._http.post<SingleResponseDto<FeatureDto>>(
      API_ENDPOINTS.FEATURES.BASE,
      feature
    );
  }

  updateFeature(feature: FeatureUpdateDto): Observable<SingleResponseDto<FeatureDto>> {
    return this._http.put<SingleResponseDto<FeatureDto>>(
      API_ENDPOINTS.FEATURES.BY_ID(feature.id),
      feature
    );
  }

  deleteFeature(id: string): Observable<ResponseDto<void>> {
    return this._http.delete<ResponseDto<void>>(
      API_ENDPOINTS.FEATURES.BY_ID(id)
    );
  }
}
```

#### 3. Create Signal Store
```typescript
// stores/feature.store.ts
const featureStatusNames = ['load', 'create', 'update', 'delete'] as const;

interface FeatureState {
  filter: FeatureFilterDto | null;
  selectedFeatureId: string | null;
}

export const FeatureStore = signalStore(
  { providedIn: 'root' },
  
  withEntities<FeatureDto>(),
  withStatus({ names: featureStatusNames }),
  withState<FeatureState>(() => ({
    filter: null,
    selectedFeatureId: null,
  })),
  
  withComputed(({ entities, selectedFeatureId }) => ({
    selectedFeature: computed(() => {
      const id = selectedFeatureId();
      return id ? entities().find(f => f.id === id) : null;
    }),
    
    activeFeatures: computed(() => 
      entities().filter(f => f.isActive)
    ),
  })),
  
  withMethods((store, api = inject(FeatureApi)) => ({
    async loadFeatures(filter?: FeatureFilterDto): Promise<void> {
      patchState(store, { filter }, setPending('load'));
      
      try {
        const response = await firstValueFrom(api.loadFeatures(filter));
        patchState(store, 
          setAllEntities(response.result.data),
          setFulfilled('load')
        );
      } catch (error) {
        patchState(store, setError(error, 'load'));
      }
    },

    async createFeature(feature: FeatureCreateDto): Promise<void> {
      patchState(store, setPending('create'));
      
      try {
        const response = await firstValueFrom(api.createFeature(feature));
        patchState(store, 
          addEntity(response.result),
          setFulfilled('create')
        );
      } catch (error) {
        patchState(store, setError(error, 'create'));
      }
    },

    selectFeature(id: string | null): void {
      patchState(store, { selectedFeatureId: id });
    },
  }))
);
```

### Required Configurations

#### 1. API Endpoints
```typescript
// shared/constants/api.ts
export const API_ENDPOINTS = {
  // ... existing endpoints
  FEATURES: {
    BASE: '/features',
    BY_ID: (id: string) => `/features/${id}`,
  },
} as const;
```

#### 2. Module Exports
```typescript
// index.ts files for barrel exports
export * from './models';
export * from './services';
export * from './stores';
```

#### 3. Provider Configuration
```typescript
// app.config.ts or feature module
export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    FeatureStore,
    FeatureApi,
  ],
};
```

### Testing Procedures

#### 1. Unit Tests for Store
```typescript
describe('FeatureStore', () => {
  let store: InstanceType<typeof FeatureStore>;
  let mockApi: jasmine.SpyObj<FeatureApi>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('FeatureApi', [
      'loadFeatures', 'createFeature', 'updateFeature', 'deleteFeature'
    ]);
    
    TestBed.configureTestingModule({
      providers: [
        FeatureStore,
        { provide: FeatureApi, useValue: mockApi }
      ]
    });
    
    store = TestBed.inject(FeatureStore);
  });

  describe('loadFeatures', () => {
    it('should load features successfully', async () => {
      const mockFeatures = [
        { id: '1', name: 'Feature 1', isActive: true }
      ];
      mockApi.loadFeatures.and.returnValue(
        of({ result: { data: mockFeatures } })
      );

      await store.loadFeatures();

      expect(store.entities()).toEqual(mockFeatures);
      expect(store.$isLoadPending()).toBeFalse();
      expect(store.$loadError()).toBeNull();
    });

    it('should handle load errors', async () => {
      const error = new Error('Load failed');
      mockApi.loadFeatures.and.returnValue(throwError(() => error));

      await store.loadFeatures();

      expect(store.entities()).toEqual([]);
      expect(store.$isLoadPending()).toBeFalse();
      expect(store.$loadError()).toBe(error);
    });
  });
});
```

#### 2. Integration Tests
```typescript
describe('FeatureStore Integration', () => {
  let store: InstanceType<typeof FeatureStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FeatureStore, FeatureApi, HttpService]
    });
    
    store = TestBed.inject(FeatureStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should perform full CRUD cycle', async () => {
    // Test create
    const createPromise = store.createFeature({ name: 'New Feature' });
    const createReq = httpMock.expectOne('/api/features');
    createReq.flush({ result: { id: '1', name: 'New Feature' } });
    await createPromise;

    expect(store.entities()).toHaveSize(1);
  });
});
```

### Integration Checklist

#### Pre-Implementation
- [ ] Define clear domain boundaries
- [ ] Design normalized state shape
- [ ] Plan API endpoints and contracts
- [ ] Consider error handling scenarios
- [ ] Design for testability

#### Implementation
- [ ] Create type definitions
- [ ] Implement API service with proper error handling
- [ ] Create signal store with all required features
- [ ] Add proper TypeScript types throughout
- [ ] Implement optimistic updates where appropriate

#### Testing
- [ ] Unit tests for all store methods
- [ ] Integration tests for API interactions
- [ ] Component tests with mocked stores
- [ ] Error scenario testing
- [ ] Performance testing for large datasets

#### Documentation
- [ ] Update API documentation
- [ ] Document new state patterns
- [ ] Add usage examples
- [ ] Update architectural decision records

#### Deployment
- [ ] Code review with focus on state management patterns
- [ ] Performance testing in staging environment
- [ ] Monitor error rates and performance metrics
- [ ] Plan rollback strategy if needed

## 10. Complete Implementation Example

### Creating a New Store with tapHandleApi

Here's a complete example of implementing a new store using the `tapHandleApi` pattern:

#### 1. Define Models
```typescript
// models/task.dto.ts
export interface TaskDto {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCreateDto {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export interface TaskUpdateDto {
  id: string;
  title?: string;
  description?: string;
  isCompleted?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export interface TaskFilterDto {
  search?: string;
  isCompleted?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueBefore?: Date;
}
```

#### 2. Implement API Service
```typescript
// services/task.api.ts
@Injectable({ providedIn: 'root' })
export class TaskApi {
  private readonly _http = inject(HttpService);

  loadTasks(filter?: TaskFilterDto): Observable<ListResponseDto<TaskDto>> {
    return this._http.get<ListResponseDto<TaskDto>>(
      API_ENDPOINTS.TASKS.BASE,
      { params: filter }
    );
  }

  createTask(task: TaskCreateDto): Observable<SingleResponseDto<TaskDto>> {
    return this._http.post<SingleResponseDto<TaskDto>>(
      API_ENDPOINTS.TASKS.BASE,
      task
    );
  }

  updateTask(task: TaskUpdateDto): Observable<SingleResponseDto<TaskDto>> {
    return this._http.put<SingleResponseDto<TaskDto>>(
      API_ENDPOINTS.TASKS.BY_ID(task.id),
      task
    );
  }

  deleteTask(id: string): Observable<ResponseDto<void>> {
    return this._http.delete<ResponseDto<void>>(
      API_ENDPOINTS.TASKS.BY_ID(id)
    );
  }
}
```

#### 3. Create Signal Store with tapHandleApi
```typescript
// stores/task.store.ts
import { tapHandleApi } from '@client/web-core-http';

const taskStatusNames = ['load', 'create', 'update', 'delete'] as const;

interface TaskState {
  filter: TaskFilterDto | null;
  selectedTaskId: string | null;
}

export const TaskStore = signalStore(
  { providedIn: 'root' },
  
  withEntities<TaskDto>(),
  withStatus({ names: taskStatusNames }),
  withState<TaskState>(() => ({
    filter: null,
    selectedTaskId: null,
  })),
  
  withComputed(({ entities, selectedTaskId }) => ({
    selectedTask: computed(() => {
      const id = selectedTaskId();
      return id ? entities().find(t => t.id === id) : null;
    }),
    
    completedTasks: computed(() => 
      entities().filter(t => t.isCompleted)
    ),
    
    pendingTasks: computed(() => 
      entities().filter(t => !t.isCompleted)
    ),
    
    highPriorityTasks: computed(() => 
      entities().filter(t => t.priority === 'high')
    ),
  })),
  
  withMethods((store, _taskApi = inject(TaskApi)) => ({
    // Load tasks using tapHandleApi
    load: rxMethod<TaskFilterDto | undefined>(
      pipe(
        switchMap(filter =>
          _taskApi.loadTasks(filter).pipe(
            tapHandleApi({
              successFn: result => {
                patchState(store, 
                  { filter },
                  setAllEntities(result.items)
                );
              },
              errorFn: error => {
                console.error('Failed to load tasks:', error);
              },
              statusFn: status => {
                patchState(store, setStatus(status, taskStatusNames[0]));
              },
            })
          )
        )
      )
    ),

    // Create task using tapHandleApi
    create: rxMethod<TaskCreateDto>(
      pipe(
        switchMap(task =>
          _taskApi.createTask(task).pipe(
            tapHandleApi({
              successFn: result => {
                patchState(store, addEntity(result));
              },
              errorFn: error => {
                console.error('Failed to create task:', error);
              },
              statusFn: status => {
                patchState(store, setStatus(status, taskStatusNames[1]));
              },
            })
          )
        )
      )
    ),

    // Update task using tapHandleApi
    update: rxMethod<TaskUpdateDto>(
      pipe(
        switchMap(task =>
          _taskApi.updateTask(task).pipe(
            tapHandleApi({
              successFn: result => {
                patchState(store, updateEntity({
                  id: result.id,
                  changes: result
                }));
              },
              errorFn: error => {
                console.error('Failed to update task:', error);
              },
              statusFn: status => {
                patchState(store, setStatus(status, taskStatusNames[2]));
              },
            })
          )
        )
      )
    ),

    // Delete task using tapHandleApi
    delete: rxMethod<string>(
      pipe(
        switchMap(id =>
          _taskApi.deleteTask(id).pipe(
            tapHandleApi({
              successFn: () => {
                patchState(store, removeEntity(id));
              },
              errorFn: error => {
                console.error('Failed to delete task:', error);
              },
              statusFn: status => {
                patchState(store, setStatus(status, taskStatusNames[3]));
              },
            })
          )
        )
      )
    ),

    // Synchronous methods
    selectTask(id: string | null): void {
      patchState(store, { selectedTaskId: id });
    },

    clearFilter(): void {
      patchState(store, { filter: null });
    },

    toggleTaskCompletion: rxMethod<string>(
      pipe(
        switchMap(id => {
          const task = store.entities().find(t => t.id === id);
          if (!task) return EMPTY;
          
          return _taskApi.updateTask({
            id,
            isCompleted: !task.isCompleted
          }).pipe(
            tapHandleApi({
              successFn: result => {
                patchState(store, updateEntity({
                  id: result.id,
                  changes: result
                }));
              },
              errorFn: error => {
                console.error('Failed to toggle task completion:', error);
              },
              statusFn: status => {
                patchState(store, setStatus(status, taskStatusNames[2]));
              },
            })
          );
        })
      )
    ),
  }))
);
```

#### 4. Component Usage
```typescript
// components/task-list.component.ts
@Component({
  selector: 'app-task-list',
  template: `
    <div class="task-list">
      @if ($isLoadPending()) {
        <div class="loading">Loading tasks...</div>
      } @else if ($loadError()) {
        <div class="error">Error: {{ $loadError() }}</div>
      } @else {
        @for (task of $tasks(); track task.id) {
          <div class="task-item" [class.completed]="task.isCompleted">
            <h3>{{ task.title }}</h3>
            <p>{{ task.description }}</p>
            <button (click)="onToggleCompletion(task.id)">
              {{ task.isCompleted ? 'Mark Incomplete' : 'Mark Complete' }}
            </button>
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent implements OnInit {
  private readonly _taskStore = inject(TaskStore);
  
  // Reactive state access
  protected readonly $tasks = this._taskStore.entities;
  protected readonly $isLoadPending = this._taskStore.$isLoadPending;
  protected readonly $loadError = this._taskStore.$loadError;
  protected readonly $selectedTask = this._taskStore.selectedTask;
  
  ngOnInit(): void {
    // Load tasks on component initialization
    this._taskStore.load();
  }
  
  onToggleCompletion(taskId: string): void {
    this._taskStore.toggleTaskCompletion(taskId);
  }
  
  onCreateTask(task: TaskCreateDto): void {
    this._taskStore.create(task);
  }
  
  onFilterTasks(filter: TaskFilterDto): void {
    this._taskStore.load(filter);
  }
}
```

#### 5. Testing the Store
```typescript
// task.store.spec.ts
describe('TaskStore', () => {
  let store: InstanceType<typeof TaskStore>;
  let mockApi: jasmine.SpyObj<TaskApi>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('TaskApi', [
      'loadTasks', 'createTask', 'updateTask', 'deleteTask'
    ]);
    
    TestBed.configureTestingModule({
      providers: [
        TaskStore,
        { provide: TaskApi, useValue: mockApi }
      ]
    });
    
    store = TestBed.inject(TaskStore);
  });

  it('should load tasks successfully using tapHandleApi', fakeAsync(() => {
    const mockTasks = [
      { id: '1', title: 'Test Task', isCompleted: false, priority: 'high' }
    ];
    mockApi.loadTasks.and.returnValue(
      of({ items: mockTasks, total: 1 })
    );

    store.load();
    tick();

    expect(store.entities()).toEqual(mockTasks);
    expect(store.$isLoadPending()).toBeFalse();
    expect(store.$loadError()).toBeNull();
  }));

  it('should handle errors properly with tapHandleApi', fakeAsync(() => {
    const error = new Error('Load failed');
    mockApi.loadTasks.and.returnValue(throwError(() => error));

    store.load();
    tick();

    expect(store.entities()).toEqual([]);
    expect(store.$isLoadPending()).toBeFalse();
    expect(store.$loadError()).toBeTruthy();
  }));
});
```

This complete example demonstrates:
- **Consistent API Integration**: All HTTP calls use `tapHandleApi` for uniform error handling
- **Reactive Methods**: Using `rxMethod` for async operations
- **Type Safety**: Full TypeScript support throughout
- **Status Management**: Automatic handling of loading states
- **Error Handling**: Centralized error processing
- **Testability**: Easy to mock and test

---

This documentation provides a comprehensive guide to the state management system in the My Collection application. It should be updated as the system evolves and new patterns are introduced.

Version: 1.0.0 | Ratified: 2025-11-02 | Last Amended: 2025-11-02