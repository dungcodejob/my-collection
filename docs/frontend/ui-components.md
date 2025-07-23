# UI Components - Spartan UI Component Library

## 📋 Tổng quan

Tài liệu này mô tả cách sử dụng và tùy chỉnh Spartan UI component library trong dự án My Collection. Spartan UI cung cấp các component hiện đại, accessible và có thể tùy chỉnh cao dựa trên shadcn/ui.

## 🎯 Spartan UI Overview

### Đặc điểm chính

- **Headless Components**: Logic tách biệt khỏi styling
- **Accessibility First**: Tuân thủ WAI-ARIA guidelines
- **Customizable**: Dễ dàng tùy chỉnh theme và styling
- **TypeScript**: Full TypeScript support
- **Angular Signals**: Tương thích với Angular signals

### Architecture

```
Spartan UI
├── Primitives (Headless logic)
├── Components (Styled components)
├── Themes (Design tokens)
└── Utilities (Helper functions)
```

## 🧩 Core Components

### 1. Button Component

```typescript
// Basic usage
@Component({
  template: `
    <hlm-button variant="default" size="default">
      Default Button
    </hlm-button>
    
    <hlm-button variant="destructive" size="sm">
      Delete
    </hlm-button>
    
    <hlm-button variant="outline" size="lg" [disabled]="loading()">
      @if (loading()) {
        <hlm-spinner class="mr-2 h-4 w-4" />
      }
      Save Changes
    </hlm-button>
  `
})
export class ButtonExampleComponent {
  loading = signal(false);
}
```

#### Button Variants

```typescript
// Available variants
type ButtonVariant = 
  | 'default' 
  | 'destructive' 
  | 'outline' 
  | 'secondary' 
  | 'ghost' 
  | 'link';

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

// Custom button component
@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [HlmButtonDirective, HlmSpinnerComponent],
  template: `
    <button 
      hlmBtn
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled() || loading()"
      (click)="handleClick()">
      
      @if (loading()) {
        <hlm-spinner class="mr-2 h-4 w-4" />
      }
      
      @if (icon() && !loading()) {
        <hlm-icon [name]="icon()" class="mr-2 h-4 w-4" />
      }
      
      <ng-content />
    </button>
  `
})
export class ActionButtonComponent {
  variant = input<ButtonVariant>('default');
  size = input<ButtonSize>('default');
  disabled = input(false);
  loading = input(false);
  icon = input<string>();
  
  click = output<void>();
  
  handleClick() {
    if (!this.disabled() && !this.loading()) {
      this.click.emit();
    }
  }
}
```

### 2. Input Components

```typescript
// Text Input
@Component({
  template: `
    <div class="space-y-2">
      <hlm-label for="email">Email</hlm-label>
      <input
        hlmInput
        id="email"
        type="email"
        placeholder="Enter your email"
        [value]="email()"
        (input)="email.set($event.target.value)" />
      
      @if (emailError()) {
        <p class="text-sm text-destructive">{{ emailError() }}</p>
      }
    </div>
  `
})
export class InputExampleComponent {
  email = signal('');
  emailError = signal('');
}

// Textarea
@Component({
  template: `
    <div class="space-y-2">
      <hlm-label for="description">Description</hlm-label>
      <textarea
        hlmInput
        id="description"
        rows="4"
        placeholder="Enter description..."
        [value]="description()"
        (input)="description.set($event.target.value)">
      </textarea>
    </div>
  `
})
export class TextareaExampleComponent {
  description = signal('');
}
```

### 3. Card Component

```typescript
@Component({
  selector: 'app-bookmark-card',
  standalone: true,
  imports: [
    HlmCardDirective,
    HlmCardHeaderDirective,
    HlmCardTitleDirective,
    HlmCardDescriptionDirective,
    HlmCardContentDirective,
    HlmCardFooterDirective
  ],
  template: `
    <div hlmCard class="w-full max-w-sm">
      <div hlmCardHeader>
        <h3 hlmCardTitle>{{ bookmark().title }}</h3>
        <p hlmCardDescription>{{ bookmark().description }}</p>
      </div>
      
      <div hlmCardContent>
        <div class="flex items-center space-x-2">
          <hlm-icon name="link" class="h-4 w-4" />
          <span class="text-sm text-muted-foreground">
            {{ bookmark().url }}
          </span>
        </div>
        
        <div class="flex flex-wrap gap-1 mt-2">
          @for (tag of bookmark().tags; track tag.id) {
            <hlm-badge variant="secondary">{{ tag.name }}</hlm-badge>
          }
        </div>
      </div>
      
      <div hlmCardFooter class="flex justify-between">
        <hlm-button variant="outline" size="sm" (click)="edit.emit()">
          Edit
        </hlm-button>
        <hlm-button variant="destructive" size="sm" (click)="delete.emit()">
          Delete
        </hlm-button>
      </div>
    </div>
  `
})
export class BookmarkCardComponent {
  bookmark = input.required<Bookmark>();
  
  edit = output<void>();
  delete = output<void>();
}
```

### 4. Dialog Component

```typescript
@Component({
  selector: 'app-bookmark-dialog',
  standalone: true,
  imports: [
    BrnDialogTriggerDirective,
    BrnDialogContentDirective,
    HlmDialogComponent,
    HlmDialogContentComponent,
    HlmDialogHeaderComponent,
    HlmDialogTitleDirective,
    HlmDialogDescriptionDirective,
    HlmDialogFooterComponent
  ],
  template: `
    <hlm-dialog>
      <button hlmBtn brnDialogTrigger>Add Bookmark</button>
      
      <hlm-dialog-content *brnDialogContent="let ctx">
        <hlm-dialog-header>
          <h3 hlmDialogTitle>Add New Bookmark</h3>
          <p hlmDialogDescription>
            Enter the details for your new bookmark.
          </p>
        </hlm-dialog-header>
        
        <form [formGroup]="bookmarkForm" (ngSubmit)="onSubmit(ctx)">
          <div class="space-y-4">
            <div>
              <hlm-label for="title">Title</hlm-label>
              <input hlmInput id="title" formControlName="title" />
            </div>
            
            <div>
              <hlm-label for="url">URL</hlm-label>
              <input hlmInput id="url" type="url" formControlName="url" />
            </div>
            
            <div>
              <hlm-label for="description">Description</hlm-label>
              <textarea hlmInput id="description" formControlName="description">
              </textarea>
            </div>
          </div>
          
          <hlm-dialog-footer>
            <hlm-button type="button" variant="outline" (click)="ctx.close()">
              Cancel
            </hlm-button>
            <hlm-button type="submit" [disabled]="bookmarkForm.invalid">
              Save Bookmark
            </hlm-button>
          </hlm-dialog-footer>
        </form>
      </hlm-dialog-content>
    </hlm-dialog>
  `
})
export class BookmarkDialogComponent {
  bookmarkForm = this.fb.group({
    title: ['', Validators.required],
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    description: ['']
  });
  
  constructor(private fb: FormBuilder) {}
  
  onSubmit(ctx: any) {
    if (this.bookmarkForm.valid) {
      // Handle form submission
      console.log(this.bookmarkForm.value);
      ctx.close();
    }
  }
}
```

### 5. Table Component

```typescript
@Component({
  selector: 'app-bookmark-table',
  standalone: true,
  imports: [
    HlmTableComponent,
    HlmTrowComponent,
    HlmThComponent,
    HlmTdComponent,
    HlmCaptionComponent
  ],
  template: `
    <hlm-table>
      <hlm-caption>A list of your bookmarks</hlm-caption>
      
      <hlm-trow>
        <hlm-th class="w-[100px]">Title</hlm-th>
        <hlm-th>URL</hlm-th>
        <hlm-th>Tags</hlm-th>
        <hlm-th>Created</hlm-th>
        <hlm-th class="text-right">Actions</hlm-th>
      </hlm-trow>
      
      @for (bookmark of bookmarks(); track bookmark.id) {
        <hlm-trow>
          <hlm-td class="font-medium">{{ bookmark.title }}</hlm-td>
          <hlm-td>
            <a [href]="bookmark.url" target="_blank" class="text-blue-600 hover:underline">
              {{ bookmark.url | slice:0:50 }}...
            </a>
          </hlm-td>
          <hlm-td>
            <div class="flex flex-wrap gap-1">
              @for (tag of bookmark.tags; track tag.id) {
                <hlm-badge variant="outline" size="sm">{{ tag.name }}</hlm-badge>
              }
            </div>
          </hlm-td>
          <hlm-td>{{ bookmark.createdAt | date:'short' }}</hlm-td>
          <hlm-td class="text-right">
            <hlm-button variant="ghost" size="sm" (click)="edit.emit(bookmark)">
              Edit
            </hlm-button>
            <hlm-button variant="ghost" size="sm" (click)="delete.emit(bookmark.id)">
              Delete
            </hlm-button>
          </hlm-td>
        </hlm-trow>
      }
    </hlm-table>
  `
})
export class BookmarkTableComponent {
  bookmarks = input.required<Bookmark[]>();
  
  edit = output<Bookmark>();
  delete = output<string>();
}
```

## 🎨 Theming & Customization

### CSS Variables

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}
```

### Custom Theme Service

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDark = signal(false);
  
  constructor() {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.isDark.set(savedTheme === 'dark' || (!savedTheme && systemDark));
    this.applyTheme();
  }
  
  toggleTheme() {
    this.isDark.update(dark => !dark);
    this.applyTheme();
    localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
  }
  
  private applyTheme() {
    const root = document.documentElement;
    if (this.isDark()) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
  
  get theme() {
    return this.isDark;
  }
}

// Theme toggle component
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [HlmButtonDirective, HlmIconComponent],
  template: `
    <button hlmBtn variant="ghost" size="icon" (click)="themeService.toggleTheme()">
      @if (themeService.theme()) {
        <hlm-icon name="sun" class="h-4 w-4" />
      } @else {
        <hlm-icon name="moon" class="h-4 w-4" />
      }
    </button>
  `
})
export class ThemeToggleComponent {
  constructor(public themeService: ThemeService) {}
}
```

## 🔧 Custom Components

### 1. Search Input Component

```typescript
@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [HlmInputDirective, HlmIconComponent, HlmButtonDirective],
  template: `
    <div class="relative">
      <hlm-icon 
        name="search" 
        class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      
      <input
        hlmInput
        type="text"
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="onInput($event)"
        (keydown.enter)="onSearch()"
        class="pl-10 pr-10" />
      
      @if (value()) {
        <button
          hlmBtn
          variant="ghost"
          size="icon"
          (click)="onClear()"
          class="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2">
          <hlm-icon name="x" class="h-3 w-3" />
        </button>
      }
    </div>
  `
})
export class SearchInputComponent {
  placeholder = input('Search...');
  value = input('');
  
  valueChange = output<string>();
  search = output<string>();
  clear = output<void>();
  
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(value);
  }
  
  onSearch() {
    this.search.emit(this.value());
  }
  
  onClear() {
    this.valueChange.emit('');
    this.clear.emit();
  }
}
```

### 2. Tag Input Component

```typescript
@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [
    HlmInputDirective,
    HlmBadgeDirective,
    HlmButtonDirective,
    HlmIconComponent
  ],
  template: `
    <div class="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] focus-within:ring-2 focus-within:ring-ring">
      @for (tag of selectedTags(); track tag.id) {
        <hlm-badge variant="secondary" class="flex items-center gap-1">
          {{ tag.name }}
          <button
            type="button"
            (click)="removeTag(tag)"
            class="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5">
            <hlm-icon name="x" class="h-3 w-3" />
          </button>
        </hlm-badge>
      }
      
      <input
        #tagInput
        type="text"
        placeholder="Add tags..."
        [value]="inputValue()"
        (input)="onInput($event)"
        (keydown)="onKeyDown($event)"
        class="flex-1 min-w-[120px] border-0 outline-0 bg-transparent" />
    </div>
    
    @if (suggestions().length > 0) {
      <div class="mt-1 border rounded-md bg-popover shadow-md max-h-48 overflow-y-auto">
        @for (suggestion of suggestions(); track suggestion.id) {
          <button
            type="button"
            (click)="selectSuggestion(suggestion)"
            class="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground">
            {{ suggestion.name }}
          </button>
        }
      </div>
    }
  `
})
export class TagInputComponent {
  selectedTags = input<Tag[]>([]);
  suggestions = input<Tag[]>([]);
  
  tagsChange = output<Tag[]>();
  searchTags = output<string>();
  
  inputValue = signal('');
  
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);
    this.searchTags.emit(value);
  }
  
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.inputValue().trim()) {
      event.preventDefault();
      this.addTag(this.inputValue().trim());
    } else if (event.key === 'Backspace' && !this.inputValue()) {
      const tags = this.selectedTags();
      if (tags.length > 0) {
        this.removeTag(tags[tags.length - 1]);
      }
    }
  }
  
  addTag(name: string) {
    const newTag: Tag = {
      id: crypto.randomUUID(),
      name,
      color: '#6b7280'
    };
    
    this.tagsChange.emit([...this.selectedTags(), newTag]);
    this.inputValue.set('');
  }
  
  removeTag(tag: Tag) {
    const updated = this.selectedTags().filter(t => t.id !== tag.id);
    this.tagsChange.emit(updated);
  }
  
  selectSuggestion(tag: Tag) {
    if (!this.selectedTags().some(t => t.id === tag.id)) {
      this.tagsChange.emit([...this.selectedTags(), tag]);
    }
    this.inputValue.set('');
  }
}
```

### 3. Data Table Component

```typescript
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    HlmTableComponent,
    HlmTrowComponent,
    HlmThComponent,
    HlmTdComponent,
    HlmButtonDirective,
    HlmIconComponent,
    HlmInputDirective
  ],
  template: `
    <div class="space-y-4">
      <!-- Search and filters -->
      <div class="flex items-center justify-between">
        <app-search-input
          [value]="searchValue()"
          (valueChange)="searchValue.set($event)"
          (search)="onSearch()" />
        
        <div class="flex items-center space-x-2">
          <hlm-button variant="outline" size="sm" (click)="exportData()">
            <hlm-icon name="download" class="mr-2 h-4 w-4" />
            Export
          </hlm-button>
        </div>
      </div>
      
      <!-- Table -->
      <div class="rounded-md border">
        <hlm-table>
          <hlm-trow>
            @for (column of columns(); track column.key) {
              <hlm-th 
                [class]="column.sortable ? 'cursor-pointer hover:bg-muted' : ''"
                (click)="column.sortable ? toggleSort(column.key) : null">
                <div class="flex items-center space-x-1">
                  <span>{{ column.label }}</span>
                  @if (column.sortable && sortColumn() === column.key) {
                    <hlm-icon 
                      [name]="sortDirection() === 'asc' ? 'chevron-up' : 'chevron-down'"
                      class="h-4 w-4" />
                  }
                </div>
              </hlm-th>
            }
            @if (actions().length > 0) {
              <hlm-th class="text-right">Actions</hlm-th>
            }
          </hlm-trow>
          
          @for (row of paginatedData(); track row.id) {
            <hlm-trow>
              @for (column of columns(); track column.key) {
                <hlm-td>
                  @if (column.template) {
                    <ng-container 
                      *ngTemplateOutlet="column.template; context: { $implicit: row, value: row[column.key] }" />
                  } @else {
                    {{ row[column.key] }}
                  }
                </hlm-td>
              }
              @if (actions().length > 0) {
                <hlm-td class="text-right">
                  @for (action of actions(); track action.label) {
                    <hlm-button
                      variant="ghost"
                      size="sm"
                      (click)="action.handler(row)"
                      class="mr-2">
                      @if (action.icon) {
                        <hlm-icon [name]="action.icon" class="mr-1 h-3 w-3" />
                      }
                      {{ action.label }}
                    </hlm-button>
                  }
                </hlm-td>
              }
            </hlm-trow>
          }
        </hlm-table>
      </div>
      
      <!-- Pagination -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-muted-foreground">
          Showing {{ startIndex() + 1 }} to {{ endIndex() }} of {{ filteredData().length }} results
        </p>
        
        <div class="flex items-center space-x-2">
          <hlm-button
            variant="outline"
            size="sm"
            [disabled]="currentPage() === 1"
            (click)="previousPage()">
            Previous
          </hlm-button>
          
          <span class="text-sm">
            Page {{ currentPage() }} of {{ totalPages() }}
          </span>
          
          <hlm-button
            variant="outline"
            size="sm"
            [disabled]="currentPage() === totalPages()"
            (click)="nextPage()">
            Next
          </hlm-button>
        </div>
      </div>
    </div>
  `
})
export class DataTableComponent<T extends { id: string }> {
  data = input.required<T[]>();
  columns = input.required<TableColumn<T>[]>();
  actions = input<TableAction<T>[]>([]);
  pageSize = input(10);
  
  searchValue = signal('');
  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  
  filteredData = computed(() => {
    let filtered = this.data();
    
    // Apply search filter
    const search = this.searchValue().toLowerCase();
    if (search) {
      filtered = filtered.filter(item =>
        this.columns().some(col =>
          String(item[col.key]).toLowerCase().includes(search)
        )
      );
    }
    
    // Apply sorting
    const sortCol = this.sortColumn();
    if (sortCol) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortCol];
        const bVal = b[sortCol];
        const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return this.sortDirection() === 'asc' ? result : -result;
      });
    }
    
    return filtered;
  });
  
  totalPages = computed(() => 
    Math.ceil(this.filteredData().length / this.pageSize())
  );
  
  startIndex = computed(() => 
    (this.currentPage() - 1) * this.pageSize()
  );
  
  endIndex = computed(() => 
    Math.min(this.startIndex() + this.pageSize(), this.filteredData().length)
  );
  
  paginatedData = computed(() => 
    this.filteredData().slice(this.startIndex(), this.endIndex())
  );
  
  toggleSort(column: string) {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }
  
  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }
  
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }
  
  onSearch() {
    this.currentPage.set(1);
  }
  
  exportData() {
    // Implement export functionality
    console.log('Exporting data:', this.filteredData());
  }
}

// Supporting interfaces
interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  template?: TemplateRef<any>;
}

interface TableAction<T> {
  label: string;
  icon?: string;
  handler: (item: T) => void;
}
```

## 📱 Responsive Design

### Responsive Utilities

```typescript
@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private breakpoints = {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)'
  };
  
  isMatching(breakpoint: keyof typeof this.breakpoints): Observable<boolean> {
    return new Observable(observer => {
      const mediaQuery = window.matchMedia(this.breakpoints[breakpoint]);
      
      observer.next(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => observer.next(e.matches);
      mediaQuery.addEventListener('change', handler);
      
      return () => mediaQuery.removeEventListener('change', handler);
    });
  }
}

// Responsive component
@Component({
  selector: 'app-responsive-layout',
  template: `
    <div class="container mx-auto px-4">
      @if (isMobile()) {
        <!-- Mobile layout -->
        <div class="space-y-4">
          <app-mobile-header />
          <app-mobile-content />
        </div>
      } @else {
        <!-- Desktop layout -->
        <div class="grid grid-cols-12 gap-6">
          <aside class="col-span-3">
            <app-sidebar />
          </aside>
          <main class="col-span-9">
            <app-main-content />
          </main>
        </div>
      }
    </div>
  `
})
export class ResponsiveLayoutComponent {
  private breakpointService = inject(BreakpointService);
  
  isMobile = toSignal(
    this.breakpointService.isMatching('md').pipe(map(matches => !matches)),
    { initialValue: false }
  );
}
```

## 🧪 Testing Components

### Component Testing

```typescript
describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
  });
  
  it('should emit search value on enter', () => {
    spyOn(component.search, 'emit');
    
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'test search';
    input.dispatchEvent(new Event('input'));
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    input.dispatchEvent(enterEvent);
    
    expect(component.search.emit).toHaveBeenCalledWith('test search');
  });
  
  it('should clear input when clear button is clicked', () => {
    fixture.componentRef.setInput('value', 'test');
    fixture.detectChanges();
    
    spyOn(component.valueChange, 'emit');
    spyOn(component.clear, 'emit');
    
    const clearButton = fixture.nativeElement.querySelector('button');
    clearButton.click();
    
    expect(component.valueChange.emit).toHaveBeenCalledWith('');
    expect(component.clear.emit).toHaveBeenCalled();
  });
});
```

## 🚀 Performance Optimization

### Lazy Loading

```typescript
// Lazy load heavy components
const HeavyDataTableComponent = lazy(() => 
  import('./heavy-data-table.component')
);

@Component({
  template: `
    @if (showTable()) {
      <app-heavy-data-table [data]="data()" />
    } @else {
      <hlm-button (click)="showTable.set(true)">
        Load Data Table
      </hlm-button>
    }
  `
})
export class LazyTableWrapperComponent {
  showTable = signal(false);
  data = input.required<any[]>();
}
```

### Virtual Scrolling

```typescript
@Component({
  selector: 'app-virtual-list',
  template: `
    <cdk-virtual-scroll-viewport 
      itemSize="60" 
      class="h-96 border rounded-md">
      
      <div 
        *cdkVirtualFor="let item of items(); trackBy: trackByFn"
        class="flex items-center p-4 border-b">
        
        <hlm-avatar class="mr-3">
          <img [src]="item.avatar" [alt]="item.name" />
        </hlm-avatar>
        
        <div>
          <h4 class="font-medium">{{ item.name }}</h4>
          <p class="text-sm text-muted-foreground">{{ item.email }}</p>
        </div>
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
export class VirtualListComponent {
  items = input.required<any[]>();
  
  trackByFn(index: number, item: any) {
    return item.id;
  }
}
```

---

**Cập nhật lần cuối**: 2024-12-19  
**Phiên bản**: 1.0.0  
**Tác giả**: My Collection Team