
## Technology Stack

### Frontend
- **Core**: [Angular](https://angular.io), [TypeScript](https://www.typescriptlang.org)
- **Build Tool**: [Nx](https://nx.dev)
- **State Management**: [NgRx Signals](https://ngrx.io/guide/signals)
- **UI Components**: [Spartan-ng](https://github.com/goetzrobin/spartan) with [Radix UI](https://www.radix-ui.com) primitives
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Icons**: [ng-icons](https://ng-icons.github.io/ng-icons)
- **Code Quality**: [ESLint](https://eslint.org), [Prettier](https://prettier.io)

### Backend
- **Core**: [NestJS](https://nestjs.com), [TypeScript](https://www.typescriptlang.org)
- **Database**: [MikroORM](https://mikro-orm.io)
- **Authentication**: [Passport.js](http://www.passportjs.org) with [JWT](https://jwt.io)
- **API Documentation**: [Swagger](https://swagger.io)
- **Architecture**: [CQRS](https://docs.nestjs.com/recipes/cqrs)
- **HTTP Client**: [Axios](https://axios-http.com)
- **Code Quality**: [ESLint](https://eslint.org), [Prettier](https://prettier.io)

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

