# Implementation Plan: Add Bookmark Dialog

**Branch**: `001-add-bookmark-dialog` | **Date**: 2025-01-06 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-add-bookmark-dialog/spec.md`

## Summary

The Add Bookmark Dialog feature enables users to quickly save web bookmarks with automatic metadata extraction. Users enter a URL, the system fetches metadata (title, description, images) from the website, and populates a form. Users can customize all metadata fields, select from multiple images, upload custom images, or provide image URLs before saving. The feature includes duplicate URL detection with confirmation dialog, comprehensive validation, and error handling for network failures and invalid inputs.

**Technical Approach**: 
- Frontend: Angular standalone component with NgRx Signals for state management
- Backend: NestJS endpoint for metadata extraction using Cheerio for web scraping
- Image handling: Support for uploads (max 5MB) and URL validation
- Duplicate detection: Database query with user-friendly confirmation dialog

## Technical Context

**Language/Version**: TypeScript 5.8.2 (Frontend & Backend)  
**Primary Dependencies**: 
- Frontend: Angular 20.1.0, NgRx Signals 20.0.0, Spartan UI 0.0.1-alpha.543, Tailwind CSS 4.1.10
- Backend: NestJS 11.0.1, MikroORM 6.4.16, Cheerio 1.1.2, Axios 1.12.1

**Storage**: PostgreSQL 15+ with MikroORM (bookmark data, user associations)  
**Testing**: Jest 29.7.0 (unit/integration), Playwright (E2E for critical flows)  
**Target Platform**: Web application (Chrome, Firefox, Safari, Edge), Mobile-responsive (375px+)  
**Project Type**: Web (monorepo with separate frontend/backend)  
**Performance Goals**: 
- Dialog load < 500ms
- Metadata fetch < 5s (95% success rate)
- Image upload/preview < 3s
- API response < 500ms (p95)

**Constraints**: 
- Image file size max 5MB
- Title max 200 chars, Description max 1000 chars, Notes max 2000 chars
- Metadata fetch timeout 10s
- Support 10+ images per URL (display up to 10)

**Scale/Scope**: 
- Multi-user system (10k+ concurrent users)
- No hard limit on bookmarks per user
- Mobile-first responsive design

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Monorepo Architecture ✅ PASS
- **Frontend**: Code in `client/libs/web/bookmark/` following Nx structure
- **Backend**: Code in `server/src/modules/bookmark/` following NestJS modules
- **Layers**: Clear separation of `data-access`, `feature`, `ui` layers
- **No violations**: Feature follows established monorepo patterns

### II. TypeScript-First Development ✅ PASS
- **Strict Mode**: All code uses `strict: true` TypeScript
- **Type Safety**: DTOs, interfaces, and models fully typed
- **No `any` types**: Except for third-party library integrations (documented)
- **Validation**: Runtime validation with `class-validator`

### III. Testing Requirements ✅ PASS
- **Unit Tests**: Required for services, utilities, validators
- **Component Tests**: Required for dialog component and image gallery
- **Integration Tests**: Required for metadata fetch API and bookmark creation
- **E2E Tests**: Required for complete bookmark creation flow
- **Coverage**: Target 80%+ for critical paths

### IV. Code Quality & Consistency ✅ PASS
- **ESLint**: Pre-commit hooks enforce linting
- **Prettier**: Auto-formatting enabled
- **Naming**: kebab-case files, PascalCase classes, camelCase variables
- **Commits**: Conventional Commits format (`feat(bookmark): add dialog`)
- **Reviews**: Minimum 1 approval required

### V. State Management Pattern ✅ PASS
- **Frontend**: NgRx Signals `signalStore()` for dialog state
- **Computed Signals**: For form validation, image selection state
- **Effects**: `rxMethod()` for API calls (metadata fetch, bookmark save)
- **Backend**: Service layer for business logic, repository pattern for data access

### VI. API Design & Documentation ✅ PASS
- **REST**: POST `/api/v1/bookmarks` (create), GET `/api/v1/metadata?url=...` (fetch)
- **Swagger**: Full OpenAPI documentation with `@ApiOperation`, `@ApiResponse`
- **DTOs**: Request/response validation with `class-validator` decorators
- **Status Codes**: 200 (success), 201 (created), 400 (validation), 409 (duplicate), 500 (error)

### VII. Security & Authentication ✅ PASS
- **Authentication**: JWT required for all bookmark operations
- **Authorization**: Users can only create/view their own bookmarks
- **Input Validation**: URL validation, file type/size validation, XSS prevention
- **Image Upload**: Virus scanning, file type whitelist (JPEG, PNG, GIF, WebP)
- **Rate Limiting**: Prevent abuse of metadata fetch API

**Overall Status**: ✅ **ALL GATES PASSED** - No constitution violations

## Project Structure

### Documentation (this feature)

```text
specs/001-add-bookmark-dialog/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - Technology decisions
├── data-model.md        # Phase 1 output - Entity definitions
├── quickstart.md        # Phase 1 output - Integration guide
├── contracts/           # Phase 1 output - API specifications
│   ├── create-bookmark.yaml
│   ├── fetch-metadata.yaml
│   └── upload-image.yaml
├── checklists/          # Quality validation
│   └── requirements.md
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
# Frontend Structure
client/libs/web/bookmark/
├── feature/
│   └── add-bookmark-dialog/        # NEW: Dialog feature
│       ├── src/
│       │   ├── lib/
│       │   │   ├── add-bookmark-dialog.component.ts
│       │   │   ├── add-bookmark-dialog.component.html
│       │   │   ├── add-bookmark-dialog.component.css
│       │   │   ├── add-bookmark-dialog.store.ts    # NgRx Signals store
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── project.json
│       ├── tsconfig.json
│       └── README.md
├── ui/
│   ├── image-gallery/                # NEW: Image selection component
│   │   ├── src/lib/image-gallery.component.ts
│   │   └── ...
│   └── url-input/                    # NEW: URL input with validation
│       ├── src/lib/url-input.component.ts
│       └── ...
├── data-access/                      # EXISTING: Extend bookmark store
│   └── src/lib/
│       ├── bookmark.store.ts         # MODIFY: Add create methods
│       ├── bookmark.service.ts       # MODIFY: Add API calls
│       ├── models/
│       │   ├── bookmark.model.ts     # MODIFY: Add new fields
│       │   └── metadata.model.ts     # NEW: Metadata response model
│       └── index.ts

# Backend Structure
server/src/modules/bookmark/
├── commands/                         # NEW: CQRS commands
│   ├── create-bookmark.command.ts
│   └── handlers/
│       └── create-bookmark.handler.ts
├── queries/                          # NEW: CQRS queries
│   ├── check-duplicate.query.ts
│   └── handlers/
│       └── check-duplicate.handler.ts
├── dto/
│   ├── create-bookmark.dto.ts        # NEW: Request DTO
│   ├── bookmark-response.dto.ts      # MODIFY: Add new fields
│   └── metadata-response.dto.ts      # NEW: Metadata DTO
├── entities/
│   └── bookmark.entity.ts            # MODIFY: Add notes, image fields
├── bookmark.controller.ts            # MODIFY: Add create endpoint
├── bookmark.service.ts               # MODIFY: Add create logic
└── bookmark.module.ts                # MODIFY: Register new providers

server/src/modules/crawl/             # EXISTING: Metadata extraction
├── crawl.service.ts                  # MODIFY: Add metadata extraction
├── dto/
│   └── metadata-request.dto.ts       # NEW: URL validation DTO
└── crawl.controller.ts               # MODIFY: Add metadata endpoint

server/src/common/services/
└── file-upload.service.ts            # NEW: Image upload handling
```

**Structure Decision**: Web application structure (Option 2) selected. This feature extends existing bookmark module in both frontend (`client/libs/web/bookmark/`) and backend (`server/src/modules/bookmark/`). New components follow Nx library structure with clear separation of `feature`, `ui`, and `data-access` layers. Backend follows NestJS modular architecture with CQRS pattern for bookmark creation.

## Complexity Tracking

> No constitution violations - this section is empty.

---

**Next Steps**: Proceed to Phase 0 (Research) to resolve technical decisions and document best practices.
