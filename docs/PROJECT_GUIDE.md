# My Collection - Frontend Documentation

## Table of Contents

- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Frontend Project Structure](#frontend-project-structure)
- [Frontend Directory Purposes](#frontend-directory-purposes)
  - [/apps/client/](#appsclient)
  - [/libs/web/auth/](#libswebauth)
  - [/libs/web/core/](#libswebcore)
  - [/libs/web/shared/](#libswebshared)
  - [/libs/web/shared/ui/spartan/](#libswebshareduispartan)
  - [/libs/web/shell/](#libswebshell)
- [Core Frontend Architecture](#core-frontend-architecture)
  - [Nx Monorepo Architecture](#nx-monorepo-architecture)
  - [NgRx Signals State Management](#ngrx-signals-state-management)
  - [Feature-based Structure](#feature-based-structure)
  - [Component-driven Development](#component-driven-development)
  - [Path Mapping & Barrel Exports](#path-mapping--barrel-exports)
- [Development Workflow](#development-workflow)
  - [Code Quality Tools](#code-quality-tools)
  - [Build and Development](#build-and-development)
  - [State Management Patterns](#state-management-patterns)
  - [Component Architecture](#component-architecture)
- [Best Practices](#best-practices)
  - [1. State Management](#1-state-management)
  - [2. Component Design](#2-component-design)
  - [3. Code Organization](#3-code-organization)
  - [4. Performance](#4-performance)
  - [5. Testing](#5-testing)

## Project Overview

My Collection Frontend is a modern Angular application built for managing bookmarks and collections in a multi-tenant system. The project uses a monorepo architecture with Nx workspace to optimize development and code sharing between frontend modules.

## Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 20.1.0 | Main frontend framework for building user interfaces |
| **Nx Workspace** | 21.2.3 | Monorepo management and build system optimization |
| **NgRx Signals** | 19.2.1 | Modern state management using Angular signals |
| **TypeScript** | 5.8.2 | JavaScript development with type safety |
| **Tailwind CSS** | 4.1.10 | Utility-first CSS framework for styling |
| **Spartan UI** | 0.0.1-alpha.486 | UI component library based on Radix UI primitives |
| **RxJS** | 7.8.0 | Reactive programming with observables |
| **Angular CDK** | 20.1.0 | Component Development Kit for advanced UI components |
| **ng-icons** | 29.10.0 | Icon library with Lucide icons |
| **Jest** | 29.7.0 | Testing framework for unit tests |
| **ESLint** | 9.31.0 | Code linting and formatting |
| **Prettier** | 3.6.2 | Automatic code formatting |
| **Husky** | 9.1.7 | Git hooks for pre-commit validation |
| **Sentry** | 9.38.0 | Error monitoring and performance tracking |

## Frontend Project Structure

```
client/                              # Angular frontend application
├── apps/
│   └── client/                      # Main Angular application
│       ├── src/
│       │   ├── app/                 # Application root
│       │   │   ├── configurations/  # Environment-specific configs
│       │   │   │   ├── development/ # Development configuration
│       │   │   │   └── production/  # Production configuration
│       │   │   ├── environments/    # Environment files
│       │   │   ├── app.config.ts    # App configuration
│       │   │   ├── app.css          # Global app styles
│       │   │   ├── app.html         # App template
│       │   │   └── app.ts           # App component
│       │   ├── styles/              # Global styles
│       │   ├── index.html           # Main HTML template
│       │   ├── main.ts              # Application bootstrap
│       │   └── styles.css           # Global CSS
│       ├── public/                  # Static assets
│       │   └── favicon.ico          # App favicon
│       ├── project.json             # Nx project configuration
│       └── tsconfig.*.json          # TypeScript configurations
└── libs/                            # Shared libraries and features
    └── web/
        ├── auth/                    # Authentication module
        │   ├── data-access/         # Auth state management (NgRx Signals)
        │   │   ├── src/lib/state/   # Auth store, effects, reducers
        │   │   └── src/lib/models/  # Auth models and interfaces
        │   ├── feature/             # Auth UI components
        │   │   ├── login/           # Login feature module
        │   │   └── shell/           # Auth shell wrapper
        │   └── utils/               # Auth utilities and helpers
        ├── core/                    # Core application services
        │   ├── config/              # Configuration services
        │   ├── http/                # HTTP client setup and interceptors
        │   └── monitoring/          # Error monitoring (Sentry)
        ├── shared/                  # Shared resources
        │   ├── constants/           # Application constants
        │   ├── data-access/         # Shared state management
        │   ├── services/            # Shared services (storage, utilities)
        │   ├── ui/                  # UI components
        │   │   ├── layout/          # Layout components
        │   │   └── spartan/         # Spartan UI components
        │   │       ├── ui-avatar-helm/     # Avatar component
        │   │       ├── ui-button-helm/     # Button component
        │   │       ├── ui-card-helm/       # Card component
        │   │       ├── ui-dialog-helm/     # Dialog component
        │   │       ├── ui-form-field-helm/ # Form field component
        │   │       ├── ui-input-helm/      # Input component
        │   │       ├── ui-menu-helm/       # Menu component
        │   │       ├── ui-select-helm/     # Select component
        │   │       ├── ui-table-helm/      # Table component
        │   │       ├── ui-tooltip-helm/    # Tooltip component
        │   │       └── ...                 # Other UI components
        │   └── utils/               # Shared utility functions
        └── shell/                   # Application shell
            ├── feature/             # Shell features
            └── ui/                  # Shell UI components
                ├── layout/          # Main application layout
                ├── nav-bar/         # Navigation bar components
                ├── sidebar/         # Sidebar navigation
                └── top-bar/         # Top navigation bar
```

## Frontend Directory Purposes

### `/apps/client/`
**Main Angular Application**: The entry point of the application containing root app configuration, environment settings, and global styles.
- `src/app/`: Root component and application configuration
- `src/configurations/`: Environment-specific configurations (development/production)
- `src/environments/`: Environment files for different environments
- `public/`: Static assets like favicon, images

### `/libs/web/auth/`
**Authentication System**: Complete authentication module using NgRx Signals for state management.
- `data-access/`: Auth store, services, interceptors, and guards with NgRx Signals
- `feature/login/`: UI components and pages for login
- `feature/shell/`: Authentication shell wrapper
- `utils/`: Utilities and helpers for authentication

### `/libs/web/core/`
**Core Services**: Essential services imported once at the application level.
- `config/`: Application configuration services
- `http/`: HTTP client setup and configuration
- `monitoring/`: Error monitoring and logging services (Sentry integration)

### `/libs/web/shared/`
**Shared Resources**: Components, services, and utilities that can be reused throughout the application.
- `constants/`: Application-wide constants (API endpoints, configuration values)
- `data-access/`: Shared state management with NgRx Signals
- `services/`: Shared services (storage, utilities)
- `ui/layout/`: Layout components
- `ui/spartan/`: Spartan UI component library implementations
- `utils/`: Shared utility functions and helpers

### `/libs/web/shared/ui/spartan/`
**Spartan UI Components**: Custom UI component library based on Radix UI primitives.
- `ui-avatar-helm/`: Avatar component with fallback support
- `ui-button-helm/`: Button component with different variants
- `ui-card-helm/`: Card component for layout
- `ui-dialog-helm/`: Modal dialog component
- `ui-form-field-helm/`: Form field wrapper component
- `ui-input-helm/`: Input component with validation
- `ui-menu-helm/`: Menu and dropdown components
- `ui-select-helm/`: Select dropdown component
- `ui-table-helm/`: Table component with sorting/pagination
- `ui-tooltip-helm/`: Tooltip component
- And many other UI components...

### `/libs/web/shell/`
**Application Shell**: Main application layout and navigation components.
- `feature/`: Shell feature implementations
- `ui/layout/`: Main application layout structure
- `ui/nav-bar/`: Navigation bar components
- `ui/sidebar/`: Sidebar navigation with menu items
- `ui/top-bar/`: Top navigation bar with user actions

## Core Frontend Architecture

### **Nx Monorepo Architecture**
- **Organized Code Sharing**: Organized code sharing and build optimization
- **Library-based Structure**: Organized by libraries for reusability
- **Dependency Graph**: Dependency management between modules
- **Build Optimization**: Caching and incremental builds

### **NgRx Signals State Management**
- **Modern Reactive State**: Using Angular signals instead of traditional NgRx
- **Signal Stores**: State management with `signalStore()` API
- **Computed Signals**: Derived state that updates automatically
- **Effects**: Side effects handling with `rxMethod()`
- **Type Safety**: Full TypeScript support

### **Feature-based Structure**
- **Domain-driven Organization**: Organized by business domains
- **Layered Architecture**: 
  - `data-access`: State management and API calls
  - `feature`: UI components and pages
  - `ui`: Reusable UI components
  - `utils`: Utilities and helpers

### **Component-driven Development**
- **Spartan UI**: Custom component library based on Radix UI
- **Tailwind CSS**: Utility-first styling approach
- **Design System**: Consistent UI/UX patterns
- **Accessibility**: Built-in accessibility with Radix primitives

### **Path Mapping & Barrel Exports**
- **Clean Imports**: Using TypeScript path mapping
- **Barrel Exports**: Centralized exports from `index.ts` files
- **Scoped Packages**: `@client/web-*` naming convention

## Development Workflow

### **Code Quality Tools**
- **ESLint**: Automated code linting with Angular-specific rules
- **Prettier**: Code formatting consistency
- **Husky**: Git hooks for pre-commit validation
- **Jest**: Unit testing framework with Angular testing utilities
- **TypeScript**: Compile-time type checking

### **Build and Development**
- **Nx Build System**: Optimized builds with caching
- **Environment Configuration**: Separate configs for development/production
- **Hot Reload**: Fast development with live reload
- **Source Maps**: Debugging support in development

### **State Management Patterns**
```typescript
// NgRx Signals Store Example
export const AuthStore = signalStore(
  withState(initialState),
  withComputed((state) => ({
    isAuthenticated: computed(() => !!state.tokens()),
    currentUser: computed(() => state.user())
  })),
  withMethods((store) => ({
    login: rxMethod<LoginRequest>(
      pipe(
        exhaustMap((credentials) =>
          authService.login(credentials).pipe(
            tap((response) => patchState(store, { tokens: response.tokens }))
          )
        )
      )
    )
  }))
);
```

### **Component Architecture**
```typescript
// Spartan UI Component Example
@Component({
  selector: 'hlm-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button [ngClass]="computedClass()">
      <ng-content />
    </button>
  `
})
export class HlmButtonComponent {
  private readonly _variant = input<ButtonVariant>('default');
  private readonly _size = input<ButtonSize>('default');
  
  protected readonly computedClass = computed(() =>
    cn(buttonVariants({ 
      variant: this._variant(), 
      size: this._size() 
    }))
  );
}
```

## Best Practices

### **1. State Management**
- Use NgRx Signals for reactive state management
- Implement computed signals for derived state
- Use effects for side effects and API calls
- Maintain immutable state updates

### **2. Component Design**
- Create reusable components in `shared/ui`
- Use Spartan UI for consistent design system
- Implement proper input/output patterns
- Follow Angular style guide conventions

### **3. Code Organization**
- Organize by feature modules
- Use barrel exports for clean imports
- Maintain clear separation of concerns
- Follow Nx library boundaries

### **4. Performance**
- Use OnPush change detection strategy
- Implement lazy loading for feature modules
- Optimize bundle size with tree shaking
- Use Nx build caching for faster builds

### **5. Testing**
- Write unit tests for components and services
- Use Angular Testing Utilities
- Mock external dependencies
- Maintain good test coverage

This project represents a modern, scalable Angular architecture with strong separation of concerns, type safety, and maintainable code organization.

---

## 📝 Documentation Update Prompt

**When the project has changes in structure, technologies, or architecture, use the following prompt to update this documentation:**

```
I need to update the PROJECT_GUIDE.md file for the My Collection Frontend project.

Current project location: /Users/Shared/Projects/my-collection/client/

Please perform the following steps:

1. **Analyze current project structure:**
   - Check package.json to identify new technologies and versions
   - Explore directory structure in /client/apps/ and /client/libs/
   - Review changes in tsconfig.base.json for path mappings
   - Check nx.json for Nx workspace configuration

2. **Update sections in PROJECT_GUIDE.md:**
   - **Technologies Used**: Update versions and add new technologies
   - **Frontend Project Structure**: Update directory tree if changed
   - **Frontend Directory Purposes**: Add/modify descriptions for new/changed directories
   - **Core Frontend Architecture**: Update new patterns and approaches
   - **Development Workflow**: Add new tools or processes
   - **Best Practices**: Update according to new standards

3. **Ensure consistency:**
   - Check that all links in table of contents still work
   - Ensure code examples reflect current structure
   - Update descriptions to match actual implementation

4. **Maintain format and style:**
   - Use English for main content
   - Keep markdown structure and formatting
   - Update table of contents if new sections are added

Please analyze the project and update the documentation thoroughly and accurately.
```

**Note:** This prompt helps ensure the documentation stays synchronized with project development.