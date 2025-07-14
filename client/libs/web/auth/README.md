# Authentication System with NgRx Signals

Hệ thống xác thực hoàn chỉnh sử dụng Angular và NgRx Signals để quản lý state.

## Tính năng chính

### 🔐 AuthStore (NgRx Signals)

- **State Management**: Quản lý trạng thái authentication bằng NgRx signals
- **Reactive**: Sử dụng signals để cập nhật UI tự động
- **Type-safe**: TypeScript interfaces cho tất cả data structures
- **Persistent**: Tự động lưu/tải tokens từ localStorage
- **Error Handling**: Xử lý lỗi HTTP một cách thông minh

### 🛡️ AuthService

- **Wrapper**: Cung cấp API đơn giản để tương tác với AuthStore
- **Backward Compatibility**: Duy trì interface tương thích với code cũ
- **Signal Exposure**: Expose store signals cho reactive programming

### 🔄 AuthInterceptor

- **Auto Token Attachment**: Tự động gắn JWT token vào API requests
- **Smart Refresh**: Tự động refresh token khi gặp lỗi 401
- **Endpoint Filtering**: Bỏ qua auth endpoints

### 🛣️ Route Guards

- **authGuard**: Bảo vệ routes cần authentication
- **guestGuard**: Ngăn user đã login truy cập login page
- **Redirect Support**: Lưu returnUrl để redirect sau khi login

### 🎨 UI Components

- **LoginComponent**: Form đăng nhập với validation và error handling
- **AuthHeaderComponent**: Header hiển thị thông tin user và menu
- **AuthShellComponent**: Layout wrapper cho authenticated pages
- **DashboardComponent**: Trang dashboard mẫu

## Cấu trúc thư mục

```
libs/web/auth/
├── data-access/
│   ├── auth.store.ts          # NgRx Signals Store
│   ├── auth.service.ts        # Service wrapper
│   ├── auth.interceptor.ts    # HTTP Interceptor
│   └── auth.guard.ts          # Route Guards
├── feature/
│   ├── login/                 # Login component
│   └── shell/                 # Shell & Header components
└── utils/                     # Utilities (if needed)
```

## Cách sử dụng

### 1. Cấu hình trong app.config.ts

```typescript
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authInterceptor } from "@client/web/auth/data-access";

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
```

### 2. Cấu hình routes trong app.routes.ts

```typescript
import { authGuard, guestGuard } from "@client/web/auth/data-access";

export const appRoutes: Route[] = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  {
    path: "login",
    loadComponent: () =>
      import("@client/web/auth/feature/login").then(m => m.WebAuthFeatureLogin),
    canActivate: [guestGuard],
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./dashboard/dashboard.component").then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
];
```

### 3. Sử dụng AuthStore trong components

```typescript
import { Component, inject } from "@angular/core";
import { AuthStore } from "@client/web/auth/data-access";

@Component({
  template: `
    @if (authStore.isAuthenticated()) {
      <p>Xin chào {{ authStore.user()?.name }}!</p>
      @if (authStore.isLoading()) {
        <p>Đang tải...</p>
      }
      @if (authStore.error()) {
        <p class="error">{{ authStore.error() }}</p>
      }
    }
  `,
})
export class MyComponent {
  readonly authStore = inject(AuthStore);
}
```

### 4. Sử dụng AuthService (Backward Compatible)

```typescript
import { Component, inject } from "@angular/core";
import { AuthService } from "@client/web/auth/data-access";

@Component({})
export class MyComponent {
  private readonly authService = inject(AuthService);

  login() {
    this.authService.login({ email: "user@example.com", password: "password" });
  }

  logout() {
    this.authService.logout();
  }

  // Sử dụng signals
  readonly user = this.authService.user;
  readonly isLoading = this.authService.isLoadingSignal;
}
```

### 5. Gọi API với token tự động

```typescript
import { HttpClient } from "@angular/common/http";

@Injectable()
export class UserService {
  private readonly http = inject(HttpClient);

  getUsers() {
    // Token sẽ tự động được gắn vào header
    return this.http.get("/api/users");
  }
}
```

## API Endpoints mong đợi

Hệ thống mong đợi các API endpoints sau:

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/register` - Đăng ký (optional)

### Login Request/Response

```typescript
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Tính năng NgRx Signals

### Signals được expose

```typescript
// Từ AuthStore
const authStore = inject(AuthStore);

// State signals
const user = authStore.user(); // User | null
const accessToken = authStore.accessToken(); // string | null
const refreshToken = authStore.refreshToken(); // string | null
const isLoading = authStore.isLoading(); // boolean
const error = authStore.error(); // string | null

// Computed signals
const isAuthenticated = authStore.isAuthenticated(); // boolean
const currentUser = authStore.currentUser(); // User | null
```

### Methods

```typescript
// Login (rxMethod)
authStore.login({ email: "user@example.com", password: "password" });

// Logout
authStore.logout();

// Refresh token (rxMethod)
authStore.refreshToken();

// Utility methods
authStore.clearError();
authStore.setLoading(true);
authStore.updateAccessToken("new-token");
```

## Bảo mật

- ✅ Tokens được lưu trong localStorage (có thể chuyển sang httpOnly cookies)
- ✅ Automatic token refresh khi hết hạn
- ✅ Route guards bảo vệ authenticated routes
- ✅ HTTP interceptor xử lý token attachment
- ✅ Error handling cho các trường hợp authentication failure

## Dependencies

- `@angular/core` ^20.0.0
- `@angular/common` ^20.0.0
- `@angular/router` ^20.0.0
- `@angular/forms` ^20.0.0
- `@ngrx/signals` ^19.2.1
- `primeng` ^19.1.3
- `rxjs` ^7.8.0

## Migration từ BehaviorSubject

Hệ thống đã được migrate từ BehaviorSubject sang NgRx Signals:

### Trước (BehaviorSubject)

```typescript
// Observable-based
authService.authState$.subscribe(state => {
  if (state.isAuthenticated) {
    // Handle authenticated state
  }
});
```

### Sau (NgRx Signals)

```typescript
// Signal-based
effect(() => {
  if (authStore.isAuthenticated()) {
    // Handle authenticated state
  }
});

// Hoặc trong template
@if (authStore.isAuthenticated()) {
  <p>User is authenticated</p>
}
```

## Lợi ích của NgRx Signals

1. **Performance**: Signals chỉ update khi giá trị thực sự thay đổi
2. **Simplicity**: Không cần subscribe/unsubscribe
3. **Type Safety**: Compile-time type checking
4. **Reactive**: Tự động update UI khi state thay đổi
5. **Debugging**: Dễ debug hơn với Angular DevTools
6. **Modern**: Sử dụng Angular signals architecture mới nhất
