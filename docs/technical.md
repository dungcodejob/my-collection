
# My Collection - Technology Stack

## 📋 Technology Overview

My Collection uses a modern technology stack with a focus on performance, developer experience, and maintainability.

## 🎨 Frontend Stack

### Core Framework
| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Angular** | 20.1.0 | Main frontend framework | [angular.dev](https://angular.dev) |
| **TypeScript** | 5.8.2 | Type-safe JavaScript | [typescriptlang.org](https://www.typescriptlang.org) |
| **Nx Workspace** | 21.2.3 | Monorepo management | [nx.dev](https://nx.dev) |

### State Management
| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **NgRx Signals** | 19.2.1 | Modern reactive state management | [ngrx.io/guide/signals](https://ngrx.io/guide/signals) |
| **RxJS** | 7.8.0 | Reactive programming | [rxjs.dev](https://rxjs.dev) |

### UI & Styling
| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Spartan UI** | 0.0.1-alpha.486 | Component library (Radix primitives) | [spartan.ng](https://spartan.ng) |
| **Tailwind CSS** | 4.1.10 | Utility-first CSS framework | [tailwindcss.com](https://tailwindcss.com) |
| **ng-icons** | 29.10.0 | Icon library with Lucide icons | [ng-icons.github.io](https://ng-icons.github.io/ng-icons) |
| **Angular CDK** | 20.1.0 | Component Development Kit | [material.angular.io/cdk](https://material.angular.io/cdk) |

### Development Tools
| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **ESLint** | 9.31.0 | Code linting | [eslint.org](https://eslint.org) |
| **Prettier** | 3.6.2 | Code formatting | [prettier.io](https://prettier.io) |
| **Jest** | 29.7.0 | Testing framework | [jestjs.io](https://jestjs.io) |
| **Husky** | 9.1.7 | Git hooks | [typicode.github.io/husky](https://typicode.github.io/husky) |

### Monitoring & Analytics
| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Sentry** | 9.38.0 | Error monitoring | [sentry.io](https://sentry.io) |

## 🔧 Backend Stack

### Core Framework
| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **NestJS** | Latest | Server-side framework | [nestjs.com](https://nestjs.com) |
| **TypeScript** | Latest | Type-safe JavaScript | [typescriptlang.org](https://www.typescriptlang.org) |
| **Node.js** | LTS | JavaScript runtime | [nodejs.org](https://nodejs.org) |

### Database & ORM
| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **MikroORM** | Latest | TypeScript ORM | [mikro-orm.io](https://mikro-orm.io) |
| **PostgreSQL** | 15+ | Primary database | [postgresql.org](https://postgresql.org) |
| **Redis** | 7+ | Caching & sessions | [redis.io](https://redis.io) |

### Authentication & Security
| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Passport.js** | Latest | Authentication middleware | [passportjs.org](http://www.passportjs.org) |
| **JWT** | Latest | Token-based authentication | [jwt.io](https://jwt.io) |
| **bcrypt** | Latest | Password hashing | [npmjs.com/package/bcrypt](https://www.npmjs.com/package/bcrypt) |

### API & Documentation
| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Swagger/OpenAPI** | Latest | API documentation | [swagger.io](https://swagger.io) |
| **Axios** | Latest | HTTP client | [axios-http.com](https://axios-http.com) |

### Architecture Patterns
| Pattern | Purpose | Documentation |
|---------|---------|---------------|
| **CQRS** | Command Query Responsibility Segregation | [docs.nestjs.com/recipes/cqrs](https://docs.nestjs.com/recipes/cqrs) |
| **Event Sourcing** | Event-driven architecture | [NestJS Events](https://docs.nestjs.com/techniques/events) |

### Development Tools
| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **ESLint** | Latest | Code linting | [eslint.org](https://eslint.org) |
| **Prettier** | Latest | Code formatting | [prettier.io](https://prettier.io) |
| **Jest** | Latest | Testing framework | [jestjs.io](https://jestjs.io) |

## 🐳 Infrastructure & DevOps

### Containerization
| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **Docker** | Containerization | [docker.com](https://docker.com) |
| **Docker Compose** | Multi-container orchestration | [docs.docker.com/compose](https://docs.docker.com/compose) |

### Package Management
| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **pnpm** | Fast, disk space efficient package manager | [pnpm.io](https://pnpm.io) |

## 📦 Key Dependencies

### Frontend Dependencies
```json
{
  "@angular/core": "^20.1.0",
  "@angular/common": "^20.1.0",
  "@angular/router": "^20.1.0",
  "@angular/forms": "^20.1.0",
  "@ngrx/signals": "^19.2.1",
  "@spartan-ng/ui-core": "^0.0.1-alpha.486",
  "tailwindcss": "^4.1.10",
  "ng-icons": "^29.10.0",
  "rxjs": "^7.8.0"
}
```

### Backend Dependencies
```json
{
  "@nestjs/core": "^latest",
  "@nestjs/common": "^latest",
  "@nestjs/platform-express": "^latest",
  "@mikro-orm/core": "^latest",
  "@mikro-orm/postgresql": "^latest",
  "@nestjs/passport": "^latest",
  "@nestjs/jwt": "^latest",
  "@nestjs/swagger": "^latest",
  "bcrypt": "^latest",
  "passport-jwt": "^latest"
}
```

## 🔧 Development Environment

### Prerequisites
- **Node.js**: LTS version (18+)
- **pnpm**: Latest version
- **Docker**: For database services
- **Git**: Version control

### IDE Recommendations
- **Primary**: Trae AI (current)
- **Alternative**: VS Code with Angular extensions
- **Extensions**: 
  - Angular Language Service
  - Prettier
  - ESLint
  - GitLens

## 🚀 Performance Considerations

### Frontend Optimizations
- **OnPush Change Detection**: All components use OnPush
- **Lazy Loading**: Feature modules are lazy loaded
- **Tree Shaking**: Unused code elimination
- **Bundle Splitting**: Code splitting by routes
- **Service Workers**: PWA capabilities

### Backend Optimizations
- **Database Indexing**: Optimized database queries
- **Caching Strategy**: Redis caching for frequent queries
- **Connection Pooling**: Database connection optimization
- **Compression**: Response compression
- **Rate Limiting**: API rate limiting

## 🔒 Security Features

### Frontend Security
- **CSP Headers**: Content Security Policy
- **XSS Protection**: Input sanitization
- **HTTPS Only**: Secure communication
- **Token Storage**: Secure token management

### Backend Security
- **JWT Tokens**: Stateless authentication
- **Password Hashing**: bcrypt with salt
- **CORS Configuration**: Cross-origin resource sharing
- **Input Validation**: Request validation pipes
- **Rate Limiting**: API abuse prevention

## 📊 Monitoring & Logging

### Error Tracking
- **Sentry**: Frontend error monitoring
- **NestJS Logger**: Backend logging
- **Performance Monitoring**: Core Web Vitals

### Analytics
- **Custom Events**: User interaction tracking
- **Performance Metrics**: Load time monitoring
- **Error Rates**: Error frequency tracking

## 🔄 Version Management

### Versioning Strategy
- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **Release Branches**: Feature → Develop → Main
- **Hotfix Process**: Direct to main for critical fixes

### Dependency Updates
- **Monthly Reviews**: Regular dependency updates
- **Security Patches**: Immediate security updates
- **Breaking Changes**: Careful evaluation and testing

---

**Last updated**: $(date)
**Version**: 1.0.0

## Folder Structure

#### Frontend
```
.
└── root
    ├── apps
    │   └── web
    └── libs
        └── web (dir)
            ├── shell (dir)
            │   ├── feature (angular:lib) - for configure any forRoot modules
            │   └── ui
            │       └── layout (angular:lib)
            ├── auth (dir)
            │   ├── feature (angular:lib) - authentication components and logic
            │   └── data-access (workspace:lib) - auth state management and services
            ├── bookmarks (dir)
            │   ├── data-access (angular:lib) - bookmarks state management and services
            │   ├── features
            │   │   ├── list (angular:lib BookmarksListComponent)
            │   │   └── detail (angular:lib BookmarkDetailComponent)
            │   └── ui (dir)
            │       └── bookmark-card (angular:lib, SCAM for Component)
            ├── collections (dir)
            │   ├── data-access (angular:lib) - collections state management
            │   ├── feature (angular:lib) - collections management
            │   └── ui (dir)
            │       ├── collection-list (angular:lib, SCAM for Component)
            │       └── collection-detail (angular:lib, SCAM for Component)
            ├── tags (dir)
            │   ├── data-access (angular:lib)
            │   ├── feature (angular:lib)
            │   └── ui (dir)
            │       ├── tag-list (angular:lib, SCAM for Component)
            │       └── tag-input (angular:lib, SCAM for Component)
            └── shared (dir)
                ├── app-config (injection token for environment)
                ├── data-access (angular:lib) - shared API calls and services
                ├── ui (dir)
                │   ├── button (angular:lib, SCAM for Component)
                │   ├── card (angular:lib, SCAM for Component)
                │   └── form (angular:lib, SCAM for Component)
                ├── pipes (dir)
                │   ├── date (angular:lib)
                │   └── truncate (angular:lib)
                ├── directives (dir)
                │   ├── tooltip (angular:lib)
                │   └── click-outside (angular:lib)
                └── utils (angular:lib)
                    ├── guards (angular:lib)
                    ├── interceptors (angular:lib)
                    └── validators (angular:lib)
```


#### Backend
```
server/
├── src/                            # Source code
│   ├── authentication/             # Authentication module
│   ├── common/                     # Shared utilities
│   │   ├── constants/             # Application constants
│   │   ├── decorators/            # Custom decorators
│   │   ├── entities/              # Base entities
│   │   ├── errors/                # Error handling
│   │   ├── interceptors/          # HTTP interceptors
│   │   ├── models/                # Shared models
│   │   ├── repositories/          # Base repositories
│   │   └── services/              # Shared services
│   ├── configs/                    # Configuration files
│   ├── database/                   # Database configuration
│   ├── modules/                    # Feature modules
│   │   ├── bookmark/              # Bookmark management
│   │   ├── collection/            # Collection management
│   │   ├── crawl/                 # Web crawling functionality
│   │   ├── security/              # Security features
│   │   ├── tag/                   # Tag management
│   │   └── user/                  # User management
│   ├── app.controller.spec.ts     # App controller tests
│   ├── app.module.ts              # Root module
│   └── main.ts                    # Application entry point
├── test/                           # Test files
├── .eslintrc.js                    # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── nest-cli.json                   # NestJS CLI configuration
├── package.json                    # Project dependencies
├── pnpm-lock.yaml                  # PNPM lock file
├── tsconfig.build.json             # TypeScript build config
└── tsconfig.json                   # TypeScript configuration
```

