# Dumb Components Implementation Guide

## Table of Contents

1. [Definition of Dumb Components](#definition-of-dumb-components)
2. [Current Implementation Patterns](#current-implementation-patterns)
3. [Best Practices for Creating Dumb Components](#best-practices-for-creating-dumb-components)
4. [Practical Examples from Collection UI](#practical-examples-from-collection-ui)
5. [Step-by-Step Guide for Creating New Dumb Components](#step-by-step-guide-for-creating-new-dumb-components)

---

## Definition of Dumb Components

**Dumb Components** (also known as **Presentational Components**) are Angular components that focus solely on UI presentation and user interaction without containing business logic or state management. They are designed to be reusable, predictable, and easy to test.

### Key Characteristics

- **Data via Props Only**: Receive all data through input properties (`input()` signals)
- **No Business Logic**: Don't contain complex business rules or data manipulation
- **UI Presentation Focus**: Primarily concerned with how things look and basic user interactions
- **Stateless by Design**: Can have UI state (like form inputs, toggles) but no application state
- **Event Emission**: Communicate with parent components through output events (`output()` signals)
- **Reusability**: Designed to be used across different contexts and features

### Benefits

- **Testability**: Easy to unit test with predictable inputs and outputs
- **Reusability**: Can be used across multiple features and contexts
- **Maintainability**: Clear separation of concerns makes code easier to maintain
- **Performance**: Optimized change detection with `OnPush` strategy
- **Debugging**: Easier to debug due to isolated functionality

---

## Current Implementation Patterns

Based on the analysis of `e:\Projects\multi-tenant\my-collection\client\libs\web\collection\ui`, here are the current patterns:

### File Structure and Naming Conventions

```
collection-tree/
├── src/
│   ├── lib/
│   │   ├── collection-node/
│   │   │   ├── collection-node.ts          # Component implementation
│   │   │   ├── collection-node.html        # Template
│   │   │   ├── collection-node.css         # Styles
│   │   │   └── collection-node.spec.ts     # Unit tests
│   │   └── collection-tree/
│   │       ├── collection-tree.ts          # Component implementation
│   │       ├── collection-tree.html        # Template
│   │       ├── collection-tree.css         # Styles
│   │       ├── collection-tree.service.ts  # Service for state management
│   │       └── collection-tree.spec.ts     # Unit tests
│   └── index.ts                            # Public API exports
```

### Naming Conventions

- **Component Files**: `kebab-case.component-type.ts` (e.g., `collection-node.ts`)
- **Component Selectors**: `mc-` prefix with kebab-case (e.g., `mc-collection-node`)
- **Signal Properties**: `$` prefix for public signals (e.g., `$node`, `$isCollapsed`)
- **Private Signal Properties**: `_$` prefix (e.g., `_$internalState`)
- **Private Properties**: `_` prefix (e.g., `_collectionTreeService`)

### Component Structure Pattern

```typescript
@Component({
  selector: "mc-component-name",
  imports: [/* standalone imports */],
  templateUrl: "./component-name.html",
  styleUrl: "./component-name.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MCComponentName {
  // Private services
  private readonly _service = inject(SomeService);
  
  // Input signals (props)
  readonly $inputProp = input.required<Type>({ alias: "inputProp" });
  readonly $optionalProp = input<Type>(defaultValue, { alias: "optionalProp" });
  
  // Output signals (events)
  readonly eventName = output<Type>();
  
  // Computed signals (derived state)
  readonly $computedValue = computed(() => {
    return this.$inputProp().someProperty;
  });
  
  // UI state signals
  readonly $isCollapsed = signal(true);
  
  // Event handlers
  onSomeAction(): void {
    this.eventName.emit(someValue);
  }
}
```

### Prop Types and Interfaces Used

#### Collection Interface
```typescript
export type Collection = {
  readonly id: string;
  name: string;
  icon?: string;
  parentId?: string;
  children?: Collection[];
  isHasChild?: boolean;
  parentPath?: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
};
```

#### Input Patterns
```typescript
// Required inputs
readonly $node = input.required<Collection>({ alias: "node" });
readonly $tree = input.required<{ [key: string]: Collection[] }>({ alias: "tree" });

// Optional inputs with defaults
readonly $isDisplayRoot = input(true, { alias: "isDisplayRoot" });
```

#### Output Patterns
```typescript
// Event outputs
readonly nodeExpand = output<Collection>();
readonly nodeUpdate = output<Collection>();
readonly nodeDelete = output<Collection>();
readonly nodeSelect = output<Collection>();
```

### Styling Approaches

#### UI Framework Priority Order

**1. Spartan UI Components (Highest Priority)**
- Always use Spartan UI components when available
- Provides consistent design system and accessibility
- Pre-built Angular components with proper TypeScript support
- Includes both headless (BRN) and styled (HLM) variants

**2. Tailwind CSS Utilities (Second Priority)**
- Use Tailwind for custom styling and layout
- Utility-first approach for rapid development
- Consistent spacing, colors, and responsive design
- Dark mode support with `dark:` prefix

**3. Custom CSS (Lowest Priority)**
- Only when Spartan UI and Tailwind cannot achieve the desired result
- Use CSS custom properties for theme-aware styling
- Follow BEM methodology for custom class names

#### Spartan UI Integration Patterns

##### Available Spartan UI Components
```typescript
// Common Spartan UI imports for dumb components
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';
import { BrnMenuImports, HlmMenuImports } from '@spartan-ng/helm/menu';
import { BrnDialogImports, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { BrnSelectImports, HlmSelectImports } from '@spartan-ng/helm/select';
```

##### Spartan UI Button Examples
```html
<!-- Primary button with Spartan UI -->
<button hlmBtn variant="default" size="sm" (click)="onAction()">
  <ng-icon hlmIcon name="lucidePlus" size="16" />
  Add Item
</button>

<!-- Secondary button -->
<button hlmBtn variant="outline" size="sm" (click)="onCancel()">
  Cancel
</button>

<!-- Icon-only button -->
<button hlmBtn variant="ghost" size="icon" (click)="onEdit()">
  <ng-icon hlmIcon name="lucideEdit" size="16" />
</button>
```

##### Spartan UI Form Components
```html
<!-- Input with label -->
<div class="space-y-2">
  <label hlmLabel for="name">Collection Name</label>
  <input 
    hlmInput 
    id="name" 
    type="text" 
    placeholder="Enter collection name"
    [value]="$name()"
    (input)="onNameChange($event)" />
</div>

<!-- Select dropdown -->
<brn-select [value]="$selectedValue()" (valueChange)="onValueChange($event)">
  <button hlmBtn variant="outline" brnSelectTrigger>
    <span>{{ $selectedLabel() }}</span>
    <ng-icon hlmIcon name="lucideChevronDown" size="16" />
  </button>
  <div hlmSelectContent>
    @for (option of $options(); track option.id) {
      <button hlmSelectItem [value]="option.value">
        {{ option.label }}
      </button>
    }
  </div>
</brn-select>
```

#### Tailwind CSS Patterns

##### Layout and Spacing
```html
<!-- Flexbox layouts -->
<div class="flex items-center justify-between gap-3">
  <div class="flex-1">Content</div>
  <div class="shrink-0">Actions</div>
</div>

<!-- Grid layouts -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  @for (item of $items(); track item.id) {
    <div class="p-4 border rounded-lg">{{ item.name }}</div>
  }
</div>

<!-- Spacing utilities -->
<div class="space-y-4">        <!-- Vertical spacing -->
  <div class="space-x-2">      <!-- Horizontal spacing -->
    <span>Item 1</span>
    <span>Item 2</span>
  </div>
</div>
```

##### Responsive Design
```html
<!-- Mobile-first responsive classes -->
<div class="w-full sm:w-auto md:w-1/2 lg:w-1/3 xl:w-1/4">
  <!-- Responsive width -->
</div>

<!-- Responsive text and spacing -->
<h2 class="text-lg sm:text-xl md:text-2xl lg:text-3xl">
  Responsive Heading
</h2>

<div class="p-2 sm:p-4 md:p-6 lg:p-8">
  Responsive padding
</div>
```

##### Dark Mode Support
```html
<!-- Dark mode variants -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <button class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
    Dark mode button
  </button>
</div>

<!-- Border colors for dark mode -->
<div class="border border-gray-200 dark:border-gray-700">
  Content with theme-aware borders
</div>
```

##### State-based Styling
```html
<!-- Conditional classes with signals -->
<button 
  class="px-4 py-2 rounded-lg transition-colors"
  [class]="$buttonClasses()"
  [disabled]="!$isEnabled()">
  {{ $buttonText() }}
</button>

<!-- Computed classes in component -->
readonly $buttonClasses = computed(() => {
  const isActive = this.$isActive();
  const isEnabled = this.$isEnabled();
  
  return [
    'border',
    isEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
    isActive 
      ? 'bg-blue-500 text-white border-blue-500' 
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
    'dark:' + (isActive 
      ? 'bg-blue-600 border-blue-600' 
      : 'bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700')
  ].join(' ');
});
```

#### Custom CSS Guidelines (When Necessary)

##### CSS Custom Properties for Theming
```css
/* component.css */
.mc-custom-component {
  /* Use CSS custom properties for theme values */
  background-color: var(--background);
  color: var(--foreground);
  border-color: var(--border);
  
  /* Fallback to Tailwind theme values */
  background-color: theme('colors.white');
  color: theme('colors.gray.900');
  border-color: theme('colors.gray.200');
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .mc-custom-component {
    background-color: theme('colors.gray.900');
    color: theme('colors.gray.100');
    border-color: theme('colors.gray.700');
  }
}
```

##### BEM Methodology for Custom Classes
```css
/* Block */
.mc-image-gallery {
  display: grid;
  gap: theme('spacing.4');
}

/* Element */
.mc-image-gallery__item {
  position: relative;
  overflow: hidden;
  border-radius: theme('borderRadius.lg');
}

/* Modifier */
.mc-image-gallery__item--selected {
  ring: 2px solid theme('colors.blue.500');
}

.mc-image-gallery__item--loading {
  opacity: 0.5;
  pointer-events: none;
}
```

#### Complete Styling Example
```html
<!-- Combining Spartan UI + Tailwind + Custom CSS -->
<div class="mc-bookmark-card space-y-4 p-4 border rounded-lg">
  <!-- Spartan UI button with Tailwind spacing -->
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {{ $title() }}
    </h3>
    
    <!-- Spartan UI menu -->
    <brn-menu>
      <button hlmBtn variant="ghost" size="icon" brnMenuTrigger>
        <ng-icon hlmIcon name="lucideMoreVertical" size="16" />
      </button>
      <div hlmMenuContent class="w-48">
        <button hlmMenuItem (click)="onEdit()">
          <ng-icon hlmIcon name="lucideEdit" size="16" />
          Edit
        </button>
        <button hlmMenuItem (click)="onDelete()">
          <ng-icon hlmIcon name="lucideTrash" size="16" />
          Delete
        </button>
      </div>
    </brn-menu>
  </div>
  
  <!-- Tailwind layout with custom component -->
  <div class="mc-image-preview aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
    @if ($imageUrl()) {
      <img 
        class="w-full h-full object-cover"
        [src]="$imageUrl()" 
        [alt]="$title()"
        (load)="onImageLoad()"
        (error)="onImageError()" />
    } @else {
      <div class="flex items-center justify-center h-full text-gray-400">
        <ng-icon name="lucideImage" size="48" />
      </div>
    }
  </div>
  
  <!-- Spartan UI form elements -->
  <div class="space-y-2">
    <label hlmLabel>Description</label>
    <textarea 
      hlmInput
      class="min-h-[80px] resize-none"
      [value]="$description()"
      (input)="onDescriptionChange($event)">
    </textarea>
  </div>
</div>
```

### Composition Patterns

#### Parent-Child Communication
```typescript
// Parent component template
<mc-collection-node
  [node]="collection"
  (nodeSelect)="onSelectCollection($event)"
  (nodeUpdate)="onUpdateCollection($event)"
  (nodeDelete)="onDeleteCollection($event)">
</mc-collection-node>
```

#### Service Injection for Shared State
```typescript
// Components inject shared services for coordination
private readonly _collectionTreeService = inject(CollectionTreeService);
```

---

## Best Practices for Creating Dumb Components

### 1. Proper Component Decomposition

#### Single Responsibility Principle
- Each component should have one clear purpose
- Break down complex UI into smaller, focused components
- Separate concerns between presentation and logic

#### Example: Good Decomposition
```typescript
// ❌ Bad: Monolithic component
@Component({
  selector: 'mc-collection-manager',
  // ... handles tree display, node editing, deletion, creation
})

// ✅ Good: Decomposed components
@Component({ selector: 'mc-collection-tree' })     // Tree display
@Component({ selector: 'mc-collection-node' })     // Individual node
@Component({ selector: 'mc-collection-form' })     // Node editing
```

### 2. Type Safety Implementation

#### Strict Input Typing
```typescript
// ✅ Use specific types
readonly $node = input.required<Collection>({ alias: "node" });

// ❌ Avoid generic types
readonly $data = input.required<any>({ alias: "data" });
```

#### Output Event Typing
```typescript
// ✅ Typed outputs
readonly nodeSelect = output<Collection>();
readonly formSubmit = output<CreateCollectionRequest>();

// ❌ Untyped outputs
readonly action = output<any>();
```

### 3. Prop Design Guidelines

#### Input Design Principles
```typescript
// ✅ Required vs Optional clarity
readonly $node = input.required<Collection>({ alias: "node" });
readonly $isCollapsed = input(false, { alias: "isCollapsed" });

// ✅ Descriptive aliases
readonly $isDisplayRoot = input(true, { alias: "isDisplayRoot" });

// ✅ Computed derived state
readonly $hasChildren = computed(() => this.$node().isHasChild);
```

#### Avoid Prop Drilling
```typescript
// ❌ Prop drilling
<mc-parent [data]="data" [config]="config" [theme]="theme">
  <mc-child [data]="data" [config]="config" [theme]="theme">
    <mc-grandchild [data]="data" [config]="config" [theme]="theme">

// ✅ Use services for shared state
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly $theme = signal<Theme>('light');
}
```

### 4. Performance Considerations

#### OnPush Change Detection
```typescript
@Component({
  selector: 'mc-component',
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ Always use OnPush
})
```

#### Signal-based Reactivity
```typescript
// ✅ Use signals for reactive updates
readonly $filteredItems = computed(() => {
  const items = this.$items();
  const filter = this.$filter();
  return items.filter(item => item.name.includes(filter));
});

// ❌ Avoid manual change detection
ngOnChanges() {
  this.filteredItems = this.items.filter(/* ... */);
}
```

#### TrackBy Functions for Lists
```typescript
// Template
@for (item of $items(); track trackByFn) {
  <mc-item [data]="item" />
}

// Component
trackByFn = (index: number, item: Collection): string => item.id;
```

### 5. Accessibility Standards

#### Semantic HTML
```html
<!-- ✅ Use semantic elements -->
<nav aria-label="Collection navigation">
  <ul role="tree">
    <li role="treeitem" [attr.aria-expanded]="!$isCollapsed()">
      <button type="button" [attr.aria-label]="'Toggle ' + node.name">
        {{ node.name }}
      </button>
    </li>
  </ul>
</nav>
```

#### Keyboard Navigation
```typescript
@HostListener('keydown', ['$event'])
onKeyDown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'Enter':
    case ' ':
      this.onSelect();
      event.preventDefault();
      break;
    case 'ArrowRight':
      if (this.$hasChildren() && this.$isCollapsed()) {
        this.onToggleCollapse();
      }
      break;
  }
}
```

#### ARIA Attributes
```html
<button
  type="button"
  [attr.aria-expanded]="!$isCollapsed()"
  [attr.aria-label]="'Expand ' + node.name"
  (click)="onToggleCollapse()">
  <ng-icon [name]="$isCollapsed() ? 'chevronRight' : 'chevronDown'" />
</button>
```

---

## Practical Examples from Collection UI

### Example 1: MCCollectionNode Component

**Purpose**: Displays a single collection node with expand/collapse functionality and context menu.

**Key Features**:
- Receives collection data via props
- Emits events for user interactions
- Manages local UI state (collapsed/expanded)
- No business logic - delegates to service

```typescript
@Component({
  selector: "mc-collection-node",
  imports: [
    NgIconComponent,
    HlmButtonImports,
    HlmIconImports,
    BrnMenuImports,
    HlmMenuImports,
  ],
  templateUrl: "./collection-node.html",
  styleUrl: "./collection-node.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MCCollectionNode {
  private readonly _collectionTreeService = inject(CollectionTreeService);

  // Input: Required collection data
  readonly $node = input.required<Collection>({ alias: "node" });
  
  // Computed: Derived from service and input
  readonly $items = this._collectionTreeService.getNodeChildren(this.$node);
  
  // UI State: Local component state
  readonly $isSidebarCollapsed = signal(false);
  readonly $isCollapsed = signal(true);
  
  // Computed: Derived UI state
  readonly $isHasChild = computed(() => this.$node().isHasChild);
  readonly $collapseState = linkedSignal(() => 
    this.$isCollapsed() 
      ? expandCollapseState.collapsed 
      : expandCollapseState.expanded
  );

  // Event handlers - delegate to service
  onToggleCollapse(): void {
    const collapsed = !this.$isCollapsed();
    this.$isCollapsed.set(collapsed);
    
    if (!collapsed) {
      this._collectionTreeService.expand(this.$node());
    }
  }

  onSelect(): void {
    this._collectionTreeService.select(this.$node());
  }

  onUpdate(): void {
    this._collectionTreeService.update(this.$node());
  }

  onDelete(): void {
    this._collectionTreeService.delete(this.$node());
  }
}
```

**Template Pattern**:
```html
<div class="space-y-1">
  @let node = $node();
  
  <div class="block relative">
    <button 
      type="button"
      class="flex w-full items-center rounded-lg pl-8 pr-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      (click)="onSelect()">
      
      <div class="flex items-center gap-3">
        <ng-icon class="shrink-0" size="16" [name]="node.icon || 'lucideFolder'" />
        <span class="flex-1">{{ node.name }}</span>
      </div>
    </button>

    @if ($isHasChild()) {
      <button
        type="button"
        class="size-6 absolute left-1 top-1/2 -translate-y-1/2"
        [attr.aria-expanded]="!$isCollapsed()"
        (click)="onToggleCollapse()">
        <ng-icon 
          class="shrink-0 text-gray-400"
          size="16" 
          [name]="$isCollapsed() ? 'lucideChevronRight' : 'lucideChevronDown'" />
      </button>
    }

    <!-- Context Menu -->
    <brn-menu class="size-8 absolute right-1 top-1/2 -translate-y-1/2">
      <!-- Menu implementation -->
    </brn-menu>
  </div>

  @if (!$isCollapsed() && $isHasChild()) {
    <div class="ml-4 pl-3 border-gray-200 dark:border-gray-700">
      @for (item of $items(); track item.id) {
        <mc-collection-node [node]="item" />
      }
    </div>
  }
</div>
```

### Example 2: MCCollectionTree Component

**Purpose**: Container component that manages the overall tree structure and coordinates between nodes.

**Key Features**:
- Receives tree data and root node via props
- Emits events for all node interactions
- Uses service for state coordination
- Handles tree-level operations

```typescript
@Component({
  selector: "mc-collection-tree",
  imports: [MCCollectionNode],
  templateUrl: "./collection-tree.html",
  styleUrl: "./collection-tree.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MCCollectionTree {
  private readonly _collectionTreeService = inject(CollectionTreeService);
  private readonly _autoEffect = injectAutoEffect();

  // Inputs: Tree configuration
  readonly $root = input.required<Collection>({ alias: "node" });
  readonly $isDisplayRoot = input(true, { alias: "isDisplayRoot" });
  readonly $tree = input.required<{ [key: string]: Collection[] }>({ alias: "tree" });
  
  // Computed: Derived from service
  readonly $items = this._collectionTreeService.getNodeChildren(this.$root);

  // Outputs: Event delegation
  readonly nodeExpand = output<Collection>();
  readonly nodeUpdate = output<Collection>();
  readonly nodeDelete = output<Collection>();
  readonly nodeSelect = output<Collection>();

  constructor() {
    this.loadEffect();
    this.updateEffect();
    this.deleteEffect();
    this.expandEffect();
    this.selectEffect();
  }

  // Effect methods for event delegation
  private loadEffect(): void {
    this._autoEffect(() => {
      const tree = this.$tree();
      this._collectionTreeService.setTree(tree);
    });
  }

  private selectEffect(): void {
    this._autoEffect(() => {
      const selectedNode = this._collectionTreeService.$selectedNode();
      if (selectedNode) {
        this.nodeSelect.emit(selectedNode);
      }
    });
  }
  
  // ... other effect methods
}
```

### Reusable Patterns Identified

#### 1. Service Injection Pattern
```typescript
// Components inject shared services for coordination
private readonly _collectionTreeService = inject(CollectionTreeService);
```

#### 2. Signal-based Props Pattern
```typescript
// Required inputs with aliases
readonly $node = input.required<Collection>({ alias: "node" });

// Optional inputs with defaults
readonly $isDisplayRoot = input(true, { alias: "isDisplayRoot" });
```

#### 3. Computed Derived State Pattern
```typescript
// Derive state from inputs and services
readonly $items = this._collectionTreeService.getNodeChildren(this.$node);
readonly $isHasChild = computed(() => this.$node().isHasChild);
```

#### 4. Event Delegation Pattern
```typescript
// Delegate events through service to parent
onSelect(): void {
  this._collectionTreeService.select(this.$node());
}

// Parent listens to service changes and emits
private selectEffect(): void {
  this._autoEffect(() => {
    const selectedNode = this._collectionTreeService.$selectedNode();
    if (selectedNode) {
      this.nodeSelect.emit(selectedNode);
    }
  });
}
```

#### 5. UI State Management Pattern
```typescript
// Local UI state with signals
readonly $isCollapsed = signal(true);

// Linked signals for derived UI state
readonly $collapseState = linkedSignal(() => 
  this.$isCollapsed() 
    ? expandCollapseState.collapsed 
    : expandCollapseState.expanded
);
```

---

## Step-by-Step Guide for Creating New Dumb Components

### Step 1: File Creation Process

#### 1.1 Create Component Directory
```bash
# Navigate to the UI library
cd libs/web/[feature]/ui/[library-name]/src/lib

# Create component directory
mkdir my-component
cd my-component
```

#### 1.2 Create Component Files
```bash
# Create all necessary files
touch my-component.ts
touch my-component.html
touch my-component.css
touch my-component.spec.ts
```

### Step 2: Required Imports

#### 2.1 Component File Setup
```typescript
// my-component.ts
import { 
  ChangeDetectionStrategy, 
  Component, 
  computed, 
  input, 
  output, 
  signal 
} from '@angular/core';

// Import required UI components
import { NgIconComponent } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';

// Import domain types
import { YourDataType } from '../models';
```

#### 2.2 Test File Setup
```typescript
// my-component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { lucideIcon } from '@ng-icons/lucide';

import { MyComponent } from './my-component';
```

### Step 3: Component Skeleton

#### 3.1 Basic Component Structure
```typescript
@Component({
  selector: 'mc-my-component',
  imports: [
    NgIconComponent,
    HlmButtonImports,
    // ... other imports
  ],
  templateUrl: './my-component.html',
  styleUrl: './my-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MCMyComponent {
  // Private services (if needed)
  private readonly _someService = inject(SomeService);
  
  // Input signals
  readonly $data = input.required<YourDataType>({ alias: 'data' });
  readonly $isEnabled = input(true, { alias: 'isEnabled' });
  
  // Output signals
  readonly itemClick = output<YourDataType>();
  readonly stateChange = output<boolean>();
  
  // UI state signals
  readonly $isActive = signal(false);
  
  // Computed signals
  readonly $displayText = computed(() => {
    const data = this.$data();
    return data.name.toUpperCase();
  });
  
  // Event handlers
  onItemClick(): void {
    if (this.$isEnabled()) {
      this.itemClick.emit(this.$data());
    }
  }
  
  onToggleActive(): void {
    const newState = !this.$isActive();
    this.$isActive.set(newState);
    this.stateChange.emit(newState);
  }
}
```

### Step 4: Prop Type Definition

#### 4.1 Define Input Types
```typescript
// Define clear interfaces for complex inputs
type ComponentConfig = {
  readonly theme: 'light' | 'dark';
  readonly size: 'sm' | 'md' | 'lg';
  readonly variant: 'primary' | 'secondary';
};

// Use in component
readonly $config = input<ComponentConfig>({ 
  theme: 'light', 
  size: 'md', 
  variant: 'primary' 
}, { alias: 'config' });
```

#### 4.2 Define Output Types
```typescript
// Define event payload types
type SelectionEvent = {
  readonly item: YourDataType;
  readonly timestamp: Date;
  readonly source: 'click' | 'keyboard';
};

// Use in component
readonly itemSelect = output<SelectionEvent>();
```

### Step 5: Styling Integration

#### 5.1 CSS File Structure
```css
/* my-component.css */

/* Component root styles */
.mc-my-component {
  display: block;
  position: relative;
}

/* State-based styles */
.mc-my-component--active {
  background-color: theme('colors.blue.50');
}

.mc-my-component--disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Responsive styles */
@media (max-width: 768px) {
  .mc-my-component {
    padding: theme('spacing.2');
  }
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .mc-my-component--active {
    background-color: theme('colors.blue.900');
  }
}
```

#### 5.2 Template with Styling
```html
<!-- my-component.html -->
<div 
  class="mc-my-component"
  [class.mc-my-component--active]="$isActive()"
  [class.mc-my-component--disabled]="!$isEnabled()">
  
  @let data = $data();
  
  <button
    type="button"
    class="flex items-center gap-2 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
    [disabled]="!$isEnabled()"
    (click)="onItemClick()">
    
    <ng-icon 
      class="shrink-0" 
      size="16" 
      [name]="data.icon || 'lucideCircle'" />
    
    <span class="flex-1 text-left">{{ $displayText() }}</span>
    
    @if ($isActive()) {
      <ng-icon 
        class="shrink-0 text-green-500" 
        size="16" 
        name="lucideCheck" />
    }
  </button>
  
  <button
    type="button"
    class="mt-2 text-sm text-gray-500 hover:text-gray-700"
    (click)="onToggleActive()">
    {{ $isActive() ? 'Deactivate' : 'Activate' }}
  </button>
</div>
```

### Step 6: Export Setup

#### 6.1 Update Library Index
```typescript
// libs/web/[feature]/ui/[library-name]/src/index.ts
export * from './lib/my-component/my-component';
```

#### 6.2 Update Component Index (if exists)
```typescript
// libs/web/[feature]/ui/[library-name]/src/lib/index.ts
export * from './my-component/my-component';
```

### Step 7: Testing Setup

#### 7.1 Basic Test Structure
```typescript
// my-component.spec.ts
describe('MCMyComponent', () => {
  let component: MCMyComponent;
  let fixture: ComponentFixture<MCMyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MCMyComponent],
      providers: [
        provideIcons({ lucideCircle, lucideCheck }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MCMyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit itemClick when clicked and enabled', () => {
    const testData = { id: '1', name: 'Test', icon: 'lucideCircle' };
    spyOn(component.itemClick, 'emit');
    
    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('isEnabled', true);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(component.itemClick.emit).toHaveBeenCalledWith(testData);
  });

  it('should not emit itemClick when disabled', () => {
    const testData = { id: '1', name: 'Test', icon: 'lucideCircle' };
    spyOn(component.itemClick, 'emit');
    
    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('isEnabled', false);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(component.itemClick.emit).not.toHaveBeenCalled();
  });

  it('should toggle active state', () => {
    const testData = { id: '1', name: 'Test', icon: 'lucideCircle' };
    spyOn(component.stateChange, 'emit');
    
    fixture.componentRef.setInput('data', testData);
    fixture.detectChanges();

    expect(component.$isActive()).toBe(false);

    component.onToggleActive();

    expect(component.$isActive()).toBe(true);
    expect(component.stateChange.emit).toHaveBeenCalledWith(true);
  });
});
```

### Step 8: Usage Example

#### 8.1 Parent Component Usage
```typescript
// parent.component.ts
@Component({
  selector: 'mc-parent',
  imports: [MCMyComponent],
  template: `
    <mc-my-component
      [data]="selectedItem"
      [isEnabled]="isFormValid"
      (itemClick)="onItemSelected($event)"
      (stateChange)="onStateChanged($event)" />
  `,
})
export class MCParentComponent {
  readonly selectedItem = signal<YourDataType>({ 
    id: '1', 
    name: 'Sample Item', 
    icon: 'lucideCircle' 
  });
  
  readonly isFormValid = signal(true);

  onItemSelected(item: YourDataType): void {
    console.log('Item selected:', item);
    // Handle selection logic
  }

  onStateChanged(isActive: boolean): void {
    console.log('State changed:', isActive);
    // Handle state change logic
  }
}
```

---

## Conclusion

This documentation provides a comprehensive guide for implementing Dumb Components in the My Collection project. By following these patterns and best practices, you can create reusable, maintainable, and performant UI components that integrate seamlessly with the existing codebase.

### Key Takeaways

1. **Use Angular 20+ signals** for all props and state management
2. **Follow the established naming conventions** with `mc-` prefix and kebab-case
3. **Implement OnPush change detection** for optimal performance
4. **Separate concerns** between presentation and business logic
5. **Use TypeScript strictly** for type safety and better developer experience
6. **Follow accessibility standards** for inclusive user interfaces
7. **Write comprehensive tests** for reliability and maintainability

### Next Steps

- Review existing components for consistency with these patterns
- Create component library documentation for team reference
- Establish code review guidelines based on these best practices
- Consider creating component generators/schematics for faster development

Version: 1.0.0 | Ratified: 2025-11-02 | Last Amended: 2025-11-02