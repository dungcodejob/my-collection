# Developer Quickstart: Bookmark Collection Browser

**Feature**: 001-bookmark-browser | **Date**: 2025-11-09  
**Purpose**: Guide developers through setup, development, and testing workflow

## Overview

This guide helps you set up your development environment and start working on the Bookmark Collection Browser feature. It covers prerequisites, setup, development workflow, testing, and common tasks.

---

## Prerequisites

### Required Tools
- **Node.js**: v20+ (LTS recommended)
- **npm**: v10+
- **PostgreSQL**: 15+
- **Redis**: 7+ (for caching and sessions)
- **Git**: 2.40+

### Development Tools (Recommended)
- **VS Code** with extensions:
  - Angular Language Service
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - REST Client (for API testing)
- **Postman** or **Insomnia** (for API testing)
- **pgAdmin** or **TablePlus** (for database management)

### Knowledge Requirements
- TypeScript (intermediate)
- Angular 20+ with Signals
- NestJS (basic to intermediate)
- RxJS (basic observables and operators)
- PostgreSQL and SQL (basic queries)

---

## Repository Setup

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/yourorg/my-collection.git
cd my-collection

# Checkout feature branch
git checkout 001-bookmark-browser

# Install dependencies (from root)
npm install
```

### 2. Database Setup

```bash
# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Create database
createdb my_collection_dev

# Run migrations
cd server
npm run migration:run

# Optional: Seed test data
npm run seed:dev
```

**Manual Setup** (if not using Docker):
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE my_collection_dev;

-- Create user (if needed)
CREATE USER my_collection_user WITH ENCRYPTED PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE my_collection_dev TO my_collection_user;

-- Connect to database and run migrations
\c my_collection_dev
-- Then run npm run migration:run from server/
```

### 3. Redis Setup

```bash
# Start Redis (if using Docker)
docker-compose up -d redis

# Or install locally
# Windows: Download from https://redis.io/download
# Mac: brew install redis && brew services start redis
# Linux: sudo apt install redis-server && sudo systemctl start redis
```

### 4. Environment Configuration

Create environment files for both client and server:

**server/.env.development**:
```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_collection_dev
DB_USER=my_collection_user
DB_PASSWORD=dev_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_dev_jwt_secret_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_dev_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:4200

# Logging
LOG_LEVEL=debug
```

**client/.env.development**:
```env
API_BASE_URL=http://localhost:3000/api/v1
```

---

## Development Workflow

### Starting Development Servers

**Option 1: Run both concurrently** (recommended):
```bash
# From repository root
npm run dev

# This runs:
# - Frontend: http://localhost:4200
# - Backend: http://localhost:3000
# - API Docs: http://localhost:3000/api/docs
```

**Option 2: Run separately**:
```bash
# Terminal 1: Backend
cd server
npm run start:dev

# Terminal 2: Frontend
cd client
npm start
```

**Option 3: Using Nx** (monorepo tooling):
```bash
# Backend
npx nx serve api

# Frontend
npx nx serve web-app

# Run both
npx nx run-many --target=serve --projects=api,web-app
```

### Accessing the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs
- **GraphQL Playground** (if applicable): http://localhost:3000/graphql

### Development URLs

Navigate to bookmark browser:
```
http://localhost:4200/collections/[collection-id]/bookmarks
```

Example with filters and pagination:
```
http://localhost:4200/collections/123e4567-e89b-12d3-a456-426614174000/bookmarks?
  filters=title:keyword:react&
  filters=created:daterange:2024-01-01_2024-12-31&
  sort=created:desc&
  page=2&
  view=card&
  tagMode=or
```

---

## Project Structure

### Frontend Structure

```
client/libs/web/bookmark/
├── data-access/
│   └── src/lib/
│       ├── stores/
│       │   └── bookmark-browser.store.ts       # Main state management
│       ├── services/
│       │   ├── bookmark-browser.api.ts         # HTTP API calls
│       │   └── bookmark-state.service.ts       # URL sync service
│       └── models/
│           ├── bookmark.model.ts               # TypeScript interfaces
│           ├── filter.model.ts
│           └── view-state.model.ts
│
├── feature/
│   └── bookmark-browser/
│       └── src/lib/
│           ├── bookmark-browser.component.ts   # Main container
│           ├── bookmark-browser.component.html # Template
│           ├── bookmark-browser.component.css  # Styles
│           └── bookmark-browser.routes.ts      # Route config
│
└── ui/
    ├── bookmark-list/                          # List display mode
    ├── bookmark-card-grid/                     # Card display mode
    ├── bookmark-moodboard/                     # Moodboard display mode
    ├── bookmark-filters/                       # Filter UI
    ├── bookmark-toolbar/                       # Toolbar with actions
    └── bookmark-selection-bar/                 # Selection controls
```

### Backend Structure

```
server/src/
├── bookmarks/
│   ├── bookmarks.module.ts
│   ├── bookmarks.controller.ts                 # API endpoints
│   ├── bookmarks.service.ts                    # Business logic
│   ├── bookmarks.repository.ts                 # Data access
│   ├── entities/
│   │   └── bookmark.entity.ts                  # MikroORM entity
│   ├── dto/
│   │   ├── bookmark-query.dto.ts               # Query parameters
│   │   ├── bookmark-response.dto.ts            # Response shape
│   │   └── bulk-delete.dto.ts                  # Bulk operations
│   └── guards/
│       └── bookmark-owner.guard.ts             # Authorization
│
├── collections/
│   ├── collections.module.ts
│   ├── collections.controller.ts
│   ├── collections.service.ts
│   ├── entities/
│   │   └── collection.entity.ts
│   └── guards/
│       └── collection-owner.guard.ts
│
└── shared/
    └── decorators/
        ├── parse-filters.decorator.ts          # Existing (reuse)
        └── parse-sorts.decorator.ts            # Existing (reuse)
```

---

## Common Development Tasks

### 1. Generate New Component

```bash
# Using Nx
npx nx generate @nx/angular:component \
  --name=bookmark-list \
  --project=web-bookmark-ui-bookmark-list \
  --standalone=true \
  --changeDetection=OnPush \
  --style=css

# Or using Angular CLI
cd client
ng generate component bookmark-list --standalone --change-detection OnPush
```

### 2. Generate New Service

```bash
# Frontend service
npx nx generate @nx/angular:service \
  --name=bookmark-state \
  --project=web-bookmark-data-access

# Backend service
cd server
npx nest generate service bookmarks
```

### 3. Create Database Migration

```bash
cd server

# Generate migration from entity changes
npm run migration:create -- -n AddBookmarkTags

# Or auto-generate based on entity diff
npm run migration:generate -- -n AddBookmarkTags

# Run migrations
npm run migration:run

# Rollback last migration
npm run migration:down
```

### 4. Add New Filter Type

**Step 1**: Define filter in registry:
```typescript
// client/libs/web/bookmark/data-access/src/lib/filters/bookmark-filters.ts
export const BOOKMARK_FILTERS: FilterDefinition[] = [
  // ... existing filters
  {
    id: 'status',
    field: 'status',
    label: 'Status',
    type: 'keyword',
    component: StatusFilterComponent,
    serialize: (value: string) => `status:keyword:${value}`,
    deserialize: (raw: string) => raw.split(':')[2],
  },
];
```

**Step 2**: Create filter component:
```bash
npx nx generate @nx/angular:component \
  --name=status-filter \
  --project=web-bookmark-ui-bookmark-filters \
  --standalone=true
```

**Step 3**: Backend support (if needed):
```typescript
// server/src/bookmarks/bookmarks.service.ts
private applyFilters(qb: QueryBuilder, filters: ParsedFilter[]) {
  filters.forEach(filter => {
    switch (filter.field) {
      // ... existing cases
      case 'status':
        qb.andWhere('bookmark.status = ?', [filter.value]);
        break;
    }
  });
}
```

### 5. Run Tests

```bash
# Frontend unit tests
cd client
npm run test

# Watch mode
npm run test:watch

# Backend unit tests
cd server
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### 6. Linting and Formatting

```bash
# Lint entire project
npm run lint

# Lint and fix
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# From root (runs on all projects)
npx nx run-many --target=lint --all
```

### 7. Build for Production

```bash
# Frontend
cd client
npm run build:prod

# Backend
cd server
npm run build

# Both (from root)
npm run build
```

---

## Testing Strategy

### Unit Tests

**Frontend (Jest)**:
```typescript
// bookmark-browser.store.spec.ts
describe('BookmarkBrowserStore', () => {
  it('should update filters and reset to page 1', () => {
    const store = createBookmarkBrowserStore();
    store.setPage(5);
    store.addFilter({ field: 'title', type: 'keyword', value: 'react' });
    
    expect(store.page()).toBe(1);
    expect(store.filters()).toHaveLength(1);
  });
});
```

**Backend (Jest)**:
```typescript
// bookmarks.service.spec.ts
describe('BookmarksService', () => {
  it('should filter bookmarks by keyword', async () => {
    const result = await service.getBookmarks(collectionId, {
      filters: [{ field: 'title', type: 'keyword', value: 'react' }]
    });
    
    expect(result.bookmarks).toHaveLength(5);
    expect(result.bookmarks[0].title).toContain('react');
  });
});
```

### Integration Tests

```typescript
// bookmarks.controller.spec.ts
describe('BookmarksController (Integration)', () => {
  it('GET /collections/:id/bookmarks should return paginated bookmarks', () => {
    return request(app.getHttpServer())
      .get('/collections/123/bookmarks?page=1&pageSize=20')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.bookmarks).toBeDefined();
        expect(res.body.totalCount).toBeGreaterThanOrEqual(0);
      });
  });
});
```

### E2E Tests (Playwright)

```typescript
// bookmark-browser.e2e.spec.ts
import { test, expect } from '@playwright/test';

test('should filter bookmarks and maintain state on reload', async ({ page }) => {
  // Navigate to collection
  await page.goto('/collections/123/bookmarks');
  
  // Apply filter
  await page.fill('[data-testid="keyword-filter-input"]', 'react');
  await page.click('[data-testid="apply-filter-btn"]');
  
  // Verify URL
  expect(page.url()).toContain('filters=title:keyword:react');
  
  // Reload page
  await page.reload();
  
  // Verify filter persists
  const filterInput = page.locator('[data-testid="keyword-filter-input"]');
  await expect(filterInput).toHaveValue('react');
});
```

---

## Debugging

### Frontend Debugging (VS Code)

**launch.json**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Angular",
      "url": "http://localhost:4200",
      "webRoot": "${workspaceFolder}/client",
      "sourceMapPathOverrides": {
        "webpack:/*": "${webRoot}/*"
      }
    }
  ]
}
```

### Backend Debugging (VS Code)

**launch.json**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeArgs": ["-r", "ts-node/register", "-r", "tsconfig-paths/register"],
      "args": ["${workspaceFolder}/server/src/main.ts"],
      "cwd": "${workspaceFolder}/server",
      "protocol": "inspector",
      "sourceMaps": true
    }
  ]
}
```

### Common Issues

**Issue**: Frontend can't connect to backend  
**Solution**: Check CORS settings in `server/src/main.ts` and ensure API_BASE_URL is correct

**Issue**: Database connection fails  
**Solution**: Verify PostgreSQL is running and credentials in `.env` are correct

**Issue**: Migrations fail  
**Solution**: Check entity definitions match schema, run `npm run migration:generate` to see diff

**Issue**: Tests fail with module not found  
**Solution**: Run `npm install` and ensure `tsconfig.paths.json` is correct

---

## API Testing

### Using REST Client (VS Code Extension)

Create `bookmark-browser.http`:
```http
### Get bookmarks with filters
GET http://localhost:3000/api/v1/collections/{{collectionId}}/bookmarks
  ?filters=title:keyword:react
  &filters=created:daterange:2024-01-01_2024-12-31
  &sort=created:desc
  &page=1
  &pageSize=20
Authorization: Bearer {{jwt_token}}

### Bulk delete bookmarks
DELETE http://localhost:3000/api/v1/bookmarks
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

{
  "bookmarkIds": [
    "123e4567-e89b-12d3-a456-426614174001",
    "123e4567-e89b-12d3-a456-426614174002"
  ]
}
```

### Using cURL

```bash
# Get bookmarks
curl -X GET "http://localhost:3000/api/v1/collections/123/bookmarks?filters=title:keyword:react&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Bulk delete
curl -X DELETE "http://localhost:3000/api/v1/bookmarks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookmarkIds": ["123e4567-e89b-12d3-a456-426614174001"]
  }'
```

---

## Performance Profiling

### Frontend Performance

```bash
# Lighthouse CI
npm run lighthouse

# Angular DevTools (Chrome extension)
# Install: https://chrome.google.com/webstore/detail/angular-devtools
# Run app and open Chrome DevTools > Angular tab

# Bundle analysis
npm run build:stats
npx webpack-bundle-analyzer dist/client/stats.json
```

### Backend Performance

```bash
# Enable request logging
# In server/src/main.ts
app.use(morgan('dev'));

# Profile with Node.js
node --inspect-brk dist/main.js

# Database query logging (in .env)
LOG_QUERIES=true
```

---

## Git Workflow

### Creating a Feature Branch

```bash
# Update from development
git checkout development
git pull origin development

# Create feature branch
git checkout -b feature/bookmark-browser-filters

# Make changes and commit
git add .
git commit -m "feat(bookmark-browser): add tag filter with AND/OR mode"

# Push to remote
git push origin feature/bookmark-browser-filters
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, perf, test, chore

**Examples**:
```bash
feat(bookmark-browser): add display mode switching
fix(bookmark-browser): resolve selection state bug on filter change
docs(bookmark-browser): update API documentation
test(bookmark-browser): add E2E tests for URL state persistence
```

---

## Helpful Commands

### Nx Commands

```bash
# Show dependency graph
npx nx graph

# Run affected tests
npx nx affected:test

# Run affected lint
npx nx affected:lint

# Build affected projects
npx nx affected:build
```

### Database Commands

```bash
# Backup database
pg_dump -U my_collection_user my_collection_dev > backup.sql

# Restore database
psql -U my_collection_user my_collection_dev < backup.sql

# Connect to database
psql -U my_collection_user -d my_collection_dev

# Useful queries
\dt                      # List tables
\d bookmarks             # Describe bookmarks table
SELECT COUNT(*) FROM bookmarks WHERE collection_id = 'xxx';
```

---

## Resources

### Documentation
- [Feature Specification](./spec.md)
- [Technical Research](./research.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/api.yaml)
- [Project Constitution](../../.specify/memory/constitution.md)

### External Resources
- [Angular Documentation](https://angular.dev)
- [NgRx Signals](https://ngrx.io/guide/signals)
- [NestJS Documentation](https://docs.nestjs.com)
- [MikroORM Documentation](https://mikro-orm.io)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Spartan UI](https://www.spartan.ng/)

### Team Contacts
- **Tech Lead**: [Name]
- **Backend Lead**: [Name]
- **Frontend Lead**: [Name]
- **Design**: [Name]

---

## Next Steps

1. ✅ Review this quickstart guide
2. ✅ Set up development environment
3. ⏭️ Review [data-model.md](./data-model.md) for entity structure
4. ⏭️ Review [research.md](./research.md) for technical decisions
5. ⏭️ Review [contracts/api.yaml](./contracts/api.yaml) for API specification
6. ⏭️ Start implementing following the critical path in [plan.md](./plan.md)
7. ⏭️ Run `/speckit.tasks` to generate detailed task breakdown

---

**Quick start Status**: ✅ Complete  
**Ready for Development**: Yes  
**Next Command**: `/speckit.tasks` (when ready for task decomposition)

