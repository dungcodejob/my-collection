# Technical Documentation

## Project Overview
My Collection is a modern web bookmark application built with a microservices architecture. The application allows users to organize and manage their favorite links with features like categorization, tagging, and sharing.

## System Architecture

### 1. Frontend Architecture
- **Framework**: Angular
- **State Management**: NgRx Signals
- **UI Components**: Spartan-ng UI
- **Styling**: TailwindCSS
- **Icons**: ng-icons

#### Frontend Structure
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

### 2. Backend Architecture
- **Framework**: NestJS
- **Database ORM**: MikroORM
- **Authentication**: Passport.js with JWT
- **API Documentation**: Swagger/OpenAPI
- **CQRS Pattern**: NestJS CQRS module

#### Backend Structure
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

## Development Environment

### Prerequisites
- Node.js (LTS version)
- Docker and Docker Compose
- Git

### Setup Instructions
1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd client
   npm install

   # Backend
   cd server
   npm install
   ```

3. Start the development environment:
   ```bash
   # Start infrastructure services
   docker-compose -f ./deployments/docker-compose/infrastructure.yaml up -d

   # Start frontend
   cd client
   npm run dev

   # Start backend
   cd server
   npm run dev
   ```

## Database Management

### Migrations
- Generate new migration:
  ```bash
  npm run migration:generate -- src/data/migrations/new-migration-name
  ```

- Run migrations:
  ```bash
  npm run migration:run
  ```

## API Documentation
- Swagger documentation is available at `/swagger` endpoint for each microservice
- API testing can be done using the REST Client VSCode plugin

## Testing
- Frontend: Jest for unit testing
- Backend: Jest for unit testing
- Test commands:
  ```bash
  # Frontend
  cd client
  npm test

  # Backend
  cd server
  npm test
  ```

## Deployment
- Docker-based deployment
- Infrastructure services managed through Docker Compose
- Microservices can be built and deployed independently

## Security Considerations
- JWT-based authentication
- Secure password hashing
- CORS configuration
- Input validation
- Rate limiting

## Performance Optimization
- Caching strategies
- Database indexing
- Lazy loading
- Code splitting
- Asset optimization

## Monitoring and Logging
- Application logging
- Error tracking
- Performance monitoring
- User activity tracking

## Future Improvements
1. Implement OAuth integration
2. Add search and filter functionality
3. Develop browser extensions
4. Create mobile applications
5. Implement collaborative features
6. Add usage statistics
7. Develop broken link checker
8. Implement cloud sync
9. Add import/export functionality

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 