# Implementation Plan: Bookmark Collection Browser

**Branch**: `001-bookmark-browser` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-bookmark-browser/spec.md`

## Summary

Implement a bookmark collection browser feature allowing users to view, filter, sort, and manage bookmarks within their own collections. The feature provides three display modes (List, Card, Moodboard), dynamic filtering with URL synchronization, multi-select capabilities, and bulk delete operations. All view state (filters, sort, pagination, display mode) persists in URL parameters enabling shareable filtered views and seamless page reloads.

**Technical Approach**: Angular standalone components with NgRx Signals for state management, NestJS backend with existing filter/sort decorators, URL-based state synchronization using Router query params, owner-only authorization model, and extensible filter architecture for future expansion.

## Technical Context

**Language/Version**: TypeScript with Angular 20+ (frontend) and NestJS (backend)
**Primary Dependencies**: 
- Frontend: NgRx Signals, Spartan UI (Radix primitives), Tailwind CSS, Angular Router
- Backend: NestJS, MikroORM, class-validator, class-transformer, Passport.js (JWT)
**Storage**: PostgreSQL 15+ (bookmark and collection entities with owner relationships)
**Testing**: Jest (unit/integration), Playwright (E2E for critical user journeys)
**Target Platform**: Web application (Chrome, Firefox, Safari, Edge - modern evergreen browsers)
**Project Type**: Monorepo web application with separate frontend (Angular/Nx) and backend (NestJS)
**Performance Goals**: 
- Page load < 2 seconds for collections up to 1000 bookmarks
- Filter application < 1 second
- Display mode switching < 500ms
**Constraints**: 
- URL length limited to ~2000 characters (browser limit)
- No real-time sync (manual refresh only)
- Owner-only access (no sharing in v1)
- Session-based selection state (not persisted)
**Scale/Scope**: 
- Support 1000+ bookmarks per collection
- 15-20 simultaneous filters
- 50+ selected bookmarks without performance degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **I. Monorepo Architecture**
- Frontend code in `client/libs/web/bookmark/` with Nx structure
- Backend code in `server/src/bookmarks/` with NestJS modules
- Clear layers: data-access, feature, ui, utils
- Leverages existing shared decorators (`parse-filters`, `parse-sorts`)

✅ **II. TypeScript-First Development**
- All code in TypeScript with strict mode
- Explicit types for bookmark entities, DTOs, filter definitions
- Type guards for URL parameter parsing
- Generic types for extensible filter system

✅ **III. Testing Requirements**
- Unit tests: Services, utilities, state stores, filter parsing
- Component tests: Display modes, filter UI, selection interactions
- Integration tests: API endpoints, authorization, filter/sort/pagination
- E2E tests: Full bookmark browsing journey, URL state restoration

✅ **IV. Code Quality & Consistency**
- ESLint + Prettier enforcement
- Conventional Commits format
- Naming conventions: kebab-case files, PascalCase classes, camelCase functions
- Pre-commit hooks enabled

✅ **V. State Management Pattern**
- Frontend: NgRx Signals (`signalStore`) for bookmark collection view state
- Computed signals for filtered/sorted results
- `rxMethod()` for API calls and side effects
- Backend: Repository pattern with MikroORM, service layer for business logic

✅ **VI. API Design & Documentation**
- RESTful endpoints: GET `/api/v1/collections/:id/bookmarks`
- DELETE `/api/v1/bookmarks` (bulk delete)
- Swagger decorators on all endpoints
- Reuses existing filter/sort decorators
- DTO validation with class-validator

✅ **VII. Security & Authentication**
- JWT authentication required
- Owner-only authorization checks (FR-001)
- Input validation on all filters
- Sanitization of user-provided filter values
- Authorization guards on all routes

✅ **VIII. Styling Best Practices**
- Tailwind utility-first approach in templates
- Minimal `@apply` usage (only for base styles)
- Component-scoped CSS for complex states only
- Leverage Spartan UI components for consistent patterns

### Quality Gates Status

**Pre-Phase 0**: ✅ PASS
- All non-negotiable principles applicable and achievable
- No architectural violations requiring justification
- Existing codebase patterns support feature requirements

**Post-Phase 1**: *To be validated after design artifacts created*

## Project Structure

### Documentation (this feature)

```text
specs/001-bookmark-browser/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (technical decisions)
├── data-model.md        # Phase 1 output (entities and relationships)
├── quickstart.md        # Phase 1 output (developer guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── api.yaml         # OpenAPI specification
├── checklists/          # Quality validation
│   └── requirements.md  # Specification checklist (completed)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
client/
└── libs/
    └── web/
        └── bookmark/
            ├── data-access/
            │   └── src/lib/
            │       ├── stores/
            │       │   └── bookmark-browser.store.ts       # NgRx Signal store
            │       ├── services/
            │       │   ├── bookmark-browser.api.ts         # API service
            │       │   └── bookmark-state.service.ts       # URL state sync
            │       └── models/
            │           ├── bookmark.model.ts               # Bookmark interface
            │           ├── filter.model.ts                 # Filter definitions
            │           └── view-state.model.ts             # View state interface
            ├── feature/
            │   └── bookmark-browser/
            │       └── src/lib/
            │           ├── bookmark-browser.component.ts   # Main container
            │           ├── bookmark-browser.component.html
            │           └── bookmark-browser.routes.ts      # Routing config
            └── ui/
                ├── bookmark-list/
                │   └── src/lib/
                │       └── bookmark-list.component.ts      # List display mode
                ├── bookmark-card-grid/
                │   └── src/lib/
                │       └── bookmark-card-grid.component.ts # Card display mode
                ├── bookmark-moodboard/
                │   └── src/lib/
                │       └── bookmark-moodboard.component.ts # Moodboard display mode
                ├── bookmark-filters/
                │   └── src/lib/
                │       ├── bookmark-filters.component.ts   # Filter UI
                │       └── filter-components/              # Individual filter types
                ├── bookmark-toolbar/
                │   └── src/lib/
                │       └── bookmark-toolbar.component.ts   # Toolbar with actions
                └── bookmark-selection-bar/
                    └── src/lib/
                        └── bookmark-selection-bar.component.ts # Selection controls

server/
└── src/
    ├── bookmarks/
    │   ├── bookmarks.module.ts
    │   ├── bookmarks.controller.ts                     # API endpoints
    │   ├── bookmarks.service.ts                        # Business logic
    │   ├── bookmarks.repository.ts                     # Data access
    │   ├── entities/
    │   │   └── bookmark.entity.ts                      # MikroORM entity
    │   ├── dto/
    │   │   ├── bookmark-query.dto.ts                   # Query params
    │   │   ├── bookmark-response.dto.ts                # Response shape
    │   │   └── bulk-delete.dto.ts                      # Bulk operations
    │   └── guards/
    │       └── bookmark-owner.guard.ts                 # Authorization
    ├── collections/
    │   ├── collections.module.ts
    │   ├── collections.controller.ts
    │   ├── collections.service.ts
    │   ├── entities/
    │   │   └── collection.entity.ts                    # MikroORM entity
    │   └── guards/
    │       └── collection-owner.guard.ts               # Authorization
    └── shared/
        └── decorators/
            ├── parse-filters.decorator.ts              # Existing (reuse)
            └── parse-sorts.decorator.ts                # Existing (reuse)
```

**Structure Decision**: Monorepo web application following Nx feature library pattern. Frontend organized by layer (data-access, feature, ui) with bookmark domain. Backend follows NestJS modular architecture with bookmarks and collections modules. Reuses existing shared decorators for filter/sort parsing to maintain consistency across the application.

## Complexity Tracking

> No constitutional violations requiring justification. All requirements align with established patterns.

## Phase 0: Research & Technical Decisions

**Status**: ✅ Complete

See [research.md](./research.md) for detailed technical decisions on:
- URL state synchronization strategy
- Filter extensibility architecture
- Display mode switching implementation
- Selection state management across views
- Performance optimization for large collections
- Loading indicator and cancellation patterns

## Phase 1: Design & Contracts

**Status**: ✅ Complete

Deliverables:
- ✅ [data-model.md](./data-model.md) - Bookmark and Collection entities, Filter definitions, validation rules
- ✅ [contracts/api.yaml](./contracts/api.yaml) - OpenAPI specification for endpoints
- ✅ [quickstart.md](./quickstart.md) - Developer setup and workflow guide
- ✅ Agent context updated with technology stack

## Phase 2: Task Decomposition

**Status**: Pending Phase 1 completion

Generated by `/speckit.tasks` command (separate execution after planning phase).

## Implementation Notes

### Critical Path
1. Backend authorization (FR-001) - required for all operations
2. URL state synchronization - foundation for all view persistence
3. Display mode components - core viewing capability
4. Filter system - primary user value

### Risk Mitigation
- **URL length limits**: Implement warning at 1800 characters, test with 20+ filters
- **Performance with 1000 bookmarks**: Implement pagination server-side, test with dataset
- **Selection state consistency**: Comprehensive state machine testing across all transitions
- **Browser compatibility**: Cross-browser testing for URL parameter handling

### Dependencies
- Existing `parse-filters.decorator.ts` and `parse-sorts.decorator.ts` must support all required filter types
- Authentication system must provide user context for authorization
- Bookmark and Collection entities must exist in database schema

### Future Considerations (Phase 2+)
- Saved filter presets (deferred per clarification Q2)
- Collection sharing (not in v1 per clarification Q2)
- Additional bulk operations beyond delete (per clarification Q1)
- Real-time updates (deferred per clarification Q5)
