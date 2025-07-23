# Routing & Navigation - Angular Router Configuration

## 📋 Tổng quan

Tài liệu này mô tả cấu hình routing và navigation trong ứng dụng My Collection sử dụng Angular Router với các tính năng hiện đại như standalone components, lazy loading, và guards.

## 🎯 Routing Architecture

### Route Structure

```
/
├── /auth
│   ├── /login
│   ├── /register
│   └── /forgot-password
├── /dashboard
├── /bookmarks
│   ├── /
│   ├── /new
│   ├── /:id
│   └── /:id/edit
├── /collections
│   ├── /
│   ├── /new
│   ├── /:id
│   └── /:id/edit
├── /tags
├── /profile
│   ├── /settings
│   └── /preferences
└── /admin (role-based)
```

## 🔧 Route Configuration

### Main Routes

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Auth routes (lazy loaded)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
    canActivate: [() => !inject(AuthService).isAuthenticated()]
  },
  
  // Protected routes
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - My Collection'
  },
  
  // Bookmarks feature
  {
    path: 'bookmarks',
    loadChildren: () => import('./features/bookmarks/bookmark.routes').then(m => m.bookmarkRoutes),
    canActivate: [authGuard]
  },
  
  // Collections feature
  {
    path: 'collections',
    loadChildren: () => import('./features/collections/collection.routes').then(m => m.collectionRoutes),
    canActivate: [authGuard]
  },
  
  // Tags feature
  {
    path: 'tags',
    loadComponent: () => import('./features/tags/tag-list.component').then(m => m.TagListComponent),
    canActivate: [authGuard],
    title: 'Tags - My Collection'
  },
  
  // Profile routes
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes),
    canActivate: [authGuard]
  },
  
  // Admin routes
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [authGuard, adminGuard]
  },
  
  // 404 page
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found - My Collection'
  }
];
```

### Feature Routes

```typescript
// features/bookmarks/bookmark.routes.ts
import { Routes } from '@angular/router';
import { bookmarkResolver } from './resolvers/bookmark.resolver';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const bookmarkRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./bookmark-list.component').then(m => m.BookmarkListComponent),
    title: 'Bookmarks - My Collection'
  },
  {
    path: 'new',
    loadComponent: () => import('./bookmark-form.component').then(m => m.BookmarkFormComponent),
    canDeactivate: [unsavedChangesGuard],
    title: 'New Bookmark - My Collection'
  },
  {
    path: ':id',
    loadComponent: () => import('./bookmark-detail.component').then(m => m.BookmarkDetailComponent),
    resolve: {
      bookmark: bookmarkResolver
    },
    title: (route) => `${route.data['bookmark']?.title || 'Bookmark'} - My Collection`
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./bookmark-form.component').then(m => m.BookmarkFormComponent),
    resolve: {
      bookmark: bookmarkResolver
    },
    canDeactivate: [unsavedChangesGuard],
    title: (route) => `Edit ${route.data['bookmark']?.title || 'Bookmark'} - My Collection`
  }
];

// features/auth/auth.routes.ts
export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login.component').then(m => m.LoginComponent),
    title: 'Login - My Collection'
  },
  {
    path: 'register',
    loadComponent: () => import('./register.component').then(m => m.RegisterComponent),
    title: 'Register - My Collection'
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Forgot Password - My Collection'
  }
];
```

## 🛡️ Route Guards

### Authentication Guard

```typescript
// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Redirect to login with return URL
  const returnUrl = router.routerState.snapshot.url;
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl } 
  });
  
  return false;
};
```

### Admin Guard

```typescript
// core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.hasRole('admin')) {
    return true;
  }
  
  // Redirect to dashboard if not admin
  router.navigate(['/dashboard']);
  return false;
};
```

### Unsaved Changes Guard

```typescript
// core/guards/unsaved-changes.guard.ts
import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate(): boolean | Promise<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component.canDeactivate && !component.canDeactivate()) {
    return confirm('You have unsaved changes. Are you sure you want to leave?');
  }
  return true;
};

// Usage in component
@Component({
  selector: 'app-bookmark-form',
  template: `
    <form [formGroup]="bookmarkForm" (ngSubmit)="onSubmit()">
      <!-- form fields -->
    </form>
  `
})
export class BookmarkFormComponent implements CanComponentDeactivate {
  bookmarkForm = this.fb.group({
    title: ['', Validators.required],
    url: ['', Validators.required],
    description: ['']
  });
  
  private initialFormValue = this.bookmarkForm.value;
  
  canDeactivate(): boolean {
    return JSON.stringify(this.bookmarkForm.value) === JSON.stringify(this.initialFormValue);
  }
  
  onSubmit() {
    if (this.bookmarkForm.valid) {
      // Save logic
      this.initialFormValue = this.bookmarkForm.value;
    }
  }
}
```

## 🔍 Route Resolvers

### Bookmark Resolver

```typescript
// features/bookmarks/resolvers/bookmark.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { BookmarkService } from '../services/bookmark.service';
import { Bookmark } from '../models/bookmark.model';

export const bookmarkResolver: ResolveFn<Bookmark> = (route) => {
  const bookmarkService = inject(BookmarkService);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;
  
  return bookmarkService.getBookmark(id).pipe(
    catchError(() => {
      router.navigate(['/bookmarks']);
      return EMPTY;
    })
  );
};
```

### User Profile Resolver

```typescript
// features/profile/resolvers/profile.resolver.ts
export const profileResolver: ResolveFn<UserProfile> = () => {
  const profileService = inject(ProfileService);
  const authService = inject(AuthService);
  
  const userId = authService.getCurrentUser()?.id;
  if (!userId) {
    return EMPTY;
  }
  
  return profileService.getProfile(userId);
};
```

## 🧭 Navigation Service

### Navigation Helper Service

```typescript
// core/services/navigation.service.ts
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private router = inject(Router);
  private location = inject(Location);
  
  // Navigation history
  private history: string[] = [];
  private maxHistoryLength = 10;
  
  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe((event: NavigationEnd) => {
      this.addToHistory(event.url);
    });
  }
  
  // Navigate with state
  navigateWithState(commands: any[], state?: any) {
    return this.router.navigate(commands, { state });
  }
  
  // Navigate back or to fallback
  navigateBack(fallbackUrl = '/dashboard') {
    if (this.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate([fallbackUrl]);
    }
  }
  
  // Navigate to bookmark with filters preserved
  navigateToBookmark(id: string, preserveQueryParams = true) {
    const navigationExtras: NavigationExtras = {};
    
    if (preserveQueryParams) {
      navigationExtras.queryParamsHandling = 'preserve';
    }
    
    return this.router.navigate(['/bookmarks', id], navigationExtras);
  }
  
  // Navigate with confirmation
  async navigateWithConfirmation(commands: any[], message: string) {
    const confirmed = await this.showConfirmDialog(message);
    if (confirmed) {
      return this.router.navigate(commands);
    }
    return false;
  }
  
  // Get current route data
  getCurrentRouteData<T = any>(): T | null {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.data as T;
  }
  
  // Check if current route matches
  isCurrentRoute(url: string): boolean {
    return this.router.url === url;
  }
  
  // Get query params as signal
  getQueryParams() {
    return toSignal(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.routerState.root.firstChild?.snapshot.queryParams || {})
      ),
      { initialValue: {} }
    );
  }
  
  private addToHistory(url: string) {
    this.history.push(url);
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }
  
  private async showConfirmDialog(message: string): Promise<boolean> {
    // In a real app, you might use a custom dialog service
    return confirm(message);
  }
}
```

## 🎨 Navigation Components

### Main Navigation

```typescript
@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, HlmButtonDirective, HlmIconComponent],
  template: `
    <nav class="flex items-center space-x-4">
      <a 
        routerLink="/dashboard"
        routerLinkActive="bg-accent text-accent-foreground"
        class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
        <hlm-icon name="home" class="mr-2 h-4 w-4" />
        Dashboard
      </a>
      
      <a 
        routerLink="/bookmarks"
        routerLinkActive="bg-accent text-accent-foreground"
        class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
        <hlm-icon name="bookmark" class="mr-2 h-4 w-4" />
        Bookmarks
      </a>
      
      <a 
        routerLink="/collections"
        routerLinkActive="bg-accent text-accent-foreground"
        class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
        <hlm-icon name="folder" class="mr-2 h-4 w-4" />
        Collections
      </a>
      
      <a 
        routerLink="/tags"
        routerLinkActive="bg-accent text-accent-foreground"
        class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
        <hlm-icon name="tag" class="mr-2 h-4 w-4" />
        Tags
      </a>
    </nav>
  `
})
export class MainNavComponent {}
```

### Breadcrumb Navigation

```typescript
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, HlmIconComponent],
  template: `
    <nav class="flex items-center space-x-2 text-sm text-muted-foreground">
      @for (crumb of breadcrumbs(); track crumb.url; let isLast = $last) {
        @if (!isLast) {
          <a 
            [routerLink]="crumb.url"
            class="hover:text-foreground transition-colors">
            {{ crumb.label }}
          </a>
          <hlm-icon name="chevron-right" class="h-4 w-4" />
        } @else {
          <span class="text-foreground font-medium">{{ crumb.label }}</span>
        }
      }
    </nav>
  `
})
export class BreadcrumbComponent implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  
  breadcrumbs = signal<Breadcrumb[]>([]);
  
  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.breadcrumbs.set(this.createBreadcrumbs(this.activatedRoute.root));
    });
  }
  
  private createBreadcrumbs(route: ActivatedRoute, url = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;
    
    if (children.length === 0) {
      return breadcrumbs;
    }
    
    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }
      
      const label = child.snapshot.data['breadcrumb'] || this.getDefaultLabel(routeURL);
      if (label) {
        breadcrumbs.push({ label, url });
      }
      
      return this.createBreadcrumbs(child, url, breadcrumbs);
    }
    
    return breadcrumbs;
  }
  
  private getDefaultLabel(url: string): string {
    const labelMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'bookmarks': 'Bookmarks',
      'collections': 'Collections',
      'tags': 'Tags',
      'profile': 'Profile',
      'settings': 'Settings'
    };
    
    return labelMap[url] || url.charAt(0).toUpperCase() + url.slice(1);
  }
}

interface Breadcrumb {
  label: string;
  url: string;
}
```

### Tab Navigation

```typescript
@Component({
  selector: 'app-tab-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="border-b border-border">
      <nav class="flex space-x-8">
        @for (tab of tabs(); track tab.path) {
          <a
            [routerLink]="tab.path"
            routerLinkActive="border-primary text-primary"
            class="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors">
            {{ tab.label }}
          </a>
        }
      </nav>
    </div>
  `
})
export class TabNavComponent {
  tabs = input.required<TabItem[]>();
}

interface TabItem {
  label: string;
  path: string;
}

// Usage
@Component({
  template: `
    <div class="space-y-6">
      <app-tab-nav [tabs]="profileTabs" />
      <router-outlet />
    </div>
  `
})
export class ProfileLayoutComponent {
  profileTabs: TabItem[] = [
    { label: 'Profile', path: '/profile' },
    { label: 'Settings', path: '/profile/settings' },
    { label: 'Preferences', path: '/profile/preferences' }
  ];
}
```

## 🔄 Route Animations

### Route Transition Animations

```typescript
// core/animations/route.animations.ts
import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ left: '-100%' })
    ], { optional: true }),
    query(':leave', [
      style({ left: '0%' })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('300ms ease-in', style({ left: '100%' }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms ease-in', style({ left: '0%' }))
      ], { optional: true })
    ])
  ])
]);

// Usage in component
@Component({
  selector: 'app-root',
  template: `
    <div [@routeAnimations]="getRouteAnimationData()">
      <router-outlet />
    </div>
  `,
  animations: [slideInAnimation]
})
export class AppComponent {
  constructor(private router: Router) {}
  
  getRouteAnimationData() {
    return this.router.routerState.root.firstChild?.snapshot.data?.['animation'];
  }
}

// Add animation data to routes
{
  path: 'bookmarks',
  loadComponent: () => import('./bookmark-list.component'),
  data: { animation: 'BookmarksPage' }
}
```

## 📱 Mobile Navigation

### Mobile Menu Component

```typescript
@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, HlmButtonDirective, HlmIconComponent],
  template: `
    <!-- Mobile menu button -->
    <button
      hlmBtn
      variant="ghost"
      size="icon"
      (click)="isOpen.set(!isOpen())"
      class="md:hidden">
      <hlm-icon [name]="isOpen() ? 'x' : 'menu'" class="h-6 w-6" />
    </button>
    
    <!-- Mobile menu overlay -->
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
        (click)="isOpen.set(false)">
        
        <div 
          class="fixed left-0 top-0 h-full w-64 bg-background border-r shadow-lg"
          (click)="$event.stopPropagation()">
          
          <div class="flex items-center justify-between p-4 border-b">
            <h2 class="text-lg font-semibold">My Collection</h2>
            <button hlmBtn variant="ghost" size="icon" (click)="isOpen.set(false)">
              <hlm-icon name="x" class="h-5 w-5" />
            </button>
          </div>
          
          <nav class="p-4 space-y-2">
            @for (item of navItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-accent text-accent-foreground"
                (click)="isOpen.set(false)"
                class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                <hlm-icon [name]="item.icon" class="mr-3 h-4 w-4" />
                {{ item.label }}
              </a>
            }
          </nav>
        </div>
      </div>
    }
  `
})
export class MobileNavComponent {
  isOpen = signal(false);
  
  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/bookmarks', label: 'Bookmarks', icon: 'bookmark' },
    { path: '/collections', label: 'Collections', icon: 'folder' },
    { path: '/tags', label: 'Tags', icon: 'tag' },
    { path: '/profile', label: 'Profile', icon: 'user' }
  ];
}
```

## 🧪 Testing Routes

### Route Testing

```typescript
describe('BookmarkRoutes', () => {
  let router: Router;
  let location: Location;
  let fixture: ComponentFixture<any>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(bookmarkRoutes)],
      providers: [
        { provide: BookmarkService, useValue: jasmine.createSpyObj('BookmarkService', ['getBookmark']) }
      ]
    }).compileComponents();
    
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(TestComponent);
  });
  
  it('should navigate to bookmark list', async () => {
    await router.navigate(['/bookmarks']);
    expect(location.path()).toBe('/bookmarks');
  });
  
  it('should navigate to bookmark detail', async () => {
    await router.navigate(['/bookmarks', '123']);
    expect(location.path()).toBe('/bookmarks/123');
  });
  
  it('should redirect to login when not authenticated', async () => {
    // Mock unauthenticated state
    spyOn(TestBed.inject(AuthService), 'isAuthenticated').and.returnValue(false);
    
    await router.navigate(['/bookmarks']);
    expect(location.path()).toBe('/auth/login?returnUrl=%2Fbookmarks');
  });
});

@Component({
  template: '<router-outlet></router-outlet>'
})
class TestComponent {}
```

### Guard Testing

```typescript
describe('AuthGuard', () => {
  let guard: typeof authGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  
  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
    
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });
  
  it('should allow access when authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);
    
    const result = TestBed.runInInjectionContext(() => authGuard());
    
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
  
  it('should redirect to login when not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);
    
    const result = TestBed.runInInjectionContext(() => authGuard());
    
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], jasmine.any(Object));
  });
});
```

## 🚀 Performance Optimization

### Preloading Strategies

```typescript
// core/strategies/custom-preloading.strategy.ts
@Injectable()
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Preload routes marked with preload: true
    if (route.data?.['preload']) {
      return load();
    }
    
    // Preload based on user behavior
    if (this.shouldPreload(route)) {
      return load();
    }
    
    return of(null);
  }
  
  private shouldPreload(route: Route): boolean {
    // Custom logic based on user patterns, connection speed, etc.
    return navigator.connection?.effectiveType === '4g';
  }
}

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(CustomPreloadingStrategy)
    )
  ]
};
```

---

**Cập nhật lần cuối**: 2024-12-19  
**Phiên bản**: 1.0.0  
**Tác giả**: My Collection Team