# Tasks: Add Bookmark Dialog

**Input**: Design documents from `/specs/001-add-bookmark-dialog/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED per constitution (80%+ coverage for critical paths)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `client/libs/web/bookmark/`
- **Backend**: `server/src/modules/bookmark/`, `server/src/modules/crawl/`
- Paths shown below follow monorepo structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Install Cheerio dependency in backend package.json (npm install cheerio@1.1.2)
- [ ] T002 Install Axios HTTP client in backend package.json (npm install axios@1.12.1)
- [ ] T003 [P] Create Nx library for add-bookmark-dialog feature using Angular generator (client/libs/web/bookmark/feature/add-bookmark-dialog)
- [ ] T004 [P] Create Nx library for image-gallery UI component using Angular generator (client/libs/web/bookmark/ui/image-gallery)
- [ ] T005 [P] Create Nx library for url-input UI component using Angular generator (client/libs/web/bookmark/ui/url-input)
- [ ] T006 Configure TypeScript strict mode in all new library tsconfig.json files
- [ ] T007 Setup ESLint and Prettier for new libraries (copy from existing bookmark libs)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Create database migration file for bookmark entity in server/src/database/migrations/
- [ ] T009 Add notes column (TEXT) to bookmarks table in migration file
- [ ] T010 Add favicon_url column (VARCHAR 2048) to bookmarks table in migration file
- [ ] T011 Add composite index idx_bookmarks_user_url on (user_id, url) in migration file
- [ ] T012 Add check constraint for notes length (max 2000 chars) in migration file
- [ ] T013 Run database migration (npm run migration:up in server/)
- [ ] T014 Update Bookmark entity in server/src/modules/bookmark/entities/bookmark.entity.ts (add notes and faviconUrl fields with MikroORM decorators)
- [ ] T015 Create MetadataResponseDto in server/src/modules/crawl/dto/metadata-response.dto.ts with validation decorators
- [ ] T016 Create MetadataRequestDto in server/src/modules/crawl/dto/metadata-request.dto.ts with URL validation
- [ ] T017 Create CreateBookmarkDto in server/src/modules/bookmark/dto/create-bookmark.dto.ts with all validation decorators
- [ ] T018 Update BookmarkResponseDto in server/src/modules/bookmark/dto/bookmark-response.dto.ts (add notes and faviconUrl fields)
- [ ] T019 Create DuplicateCheckResponseDto in server/src/modules/bookmark/dto/duplicate-check-response.dto.ts
- [ ] T020 Create metadata.model.ts interface in client/libs/web/bookmark/data-access/src/lib/models/
- [ ] T021 Update bookmark.model.ts interface in client/libs/web/bookmark/data-access/src/lib/models/ (add notes and faviconUrl fields)
- [ ] T022 Configure CORS settings in server/src/main.ts to allow frontend requests
- [ ] T023 Setup Redis caching module in server/src/configs/cache.config.ts (for metadata caching)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Bookmark Creation (Priority: P1) 🎯 MVP

**Goal**: Enable users to quickly save bookmarks by entering a URL, fetching metadata automatically, and saving with minimal effort

**Independent Test**: Open dialog → Enter URL → Fetch metadata → Save → Verify bookmark created

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T024 [P] [US1] Create unit test for CrawlService.extractMetadata in server/src/modules/crawl/crawl.service.spec.ts
- [ ] T025 [P] [US1] Create unit test for CreateBookmarkHandler in server/src/modules/bookmark/commands/handlers/create-bookmark.handler.spec.ts
- [ ] T026 [P] [US1] Create integration test for POST /api/v1/bookmarks endpoint in server/test/bookmark.e2e-spec.ts
- [ ] T027 [P] [US1] Create integration test for GET /api/v1/metadata endpoint in server/test/metadata.e2e-spec.ts
- [ ] T028 [P] [US1] Create component test for AddBookmarkDialogComponent in client/libs/web/bookmark/feature/add-bookmark-dialog/src/lib/add-bookmark-dialog.component.spec.ts
- [ ] T029 [P] [US1] Create E2E test for complete bookmark creation flow in client/apps/client-e2e/src/add-bookmark.spec.ts

### Implementation for User Story 1

**Backend - Metadata Extraction**

- [ ] T030 [P] [US1] Implement CrawlService.extractMetadata method in server/src/modules/crawl/crawl.service.ts (Cheerio HTML parsing)
- [ ] T031 [P] [US1] Implement CrawlService.extractTitle helper in server/src/modules/crawl/crawl.service.ts (og:title, twitter:title, <title>)
- [ ] T032 [P] [US1] Implement CrawlService.extractDescription helper in server/src/modules/crawl/crawl.service.ts (og:description, meta description)
- [ ] T033 [P] [US1] Implement CrawlService.extractImages helper in server/src/modules/crawl/crawl.service.ts (og:image, img tags, max 10)
- [ ] T034 [P] [US1] Implement CrawlService.extractFavicon helper in server/src/modules/crawl/crawl.service.ts (link rel=icon)
- [ ] T035 [US1] Add metadata caching logic in CrawlService (Redis, 24-hour TTL) in server/src/modules/crawl/crawl.service.ts
- [ ] T036 [US1] Create GET /metadata endpoint in server/src/modules/crawl/crawl.controller.ts with @ApiOperation decorators
- [ ] T037 [US1] Add rate limiting to metadata endpoint (60 requests/minute per user) in server/src/modules/crawl/crawl.controller.ts

**Backend - Bookmark Creation**

- [ ] T038 [P] [US1] Create CreateBookmarkCommand in server/src/modules/bookmark/commands/create-bookmark.command.ts
- [ ] T039 [US1] Create CreateBookmarkHandler in server/src/modules/bookmark/commands/handlers/create-bookmark.handler.ts (CQRS pattern)
- [ ] T040 [US1] Implement bookmark creation logic in CreateBookmarkHandler (validate, create entity, persist)
- [ ] T041 [US1] Add duplicate URL check in CreateBookmarkHandler (query by user_id and url)
- [ ] T042 [US1] Create POST /bookmarks endpoint in server/src/modules/bookmark/bookmark.controller.ts with @ApiOperation decorators
- [ ] T043 [US1] Register CreateBookmarkHandler in server/src/modules/bookmark/bookmark.module.ts (CqrsModule providers)
- [ ] T044 [US1] Add JWT authentication guard to bookmark endpoints in server/src/modules/bookmark/bookmark.controller.ts

**Frontend - Data Access Layer**

- [ ] T045 [P] [US1] Create BookmarkService.fetchMetadata method in client/libs/web/bookmark/data-access/src/lib/bookmark.service.ts
- [ ] T046 [P] [US1] Create BookmarkService.createBookmark method in client/libs/web/bookmark/data-access/src/lib/bookmark.service.ts
- [ ] T047 [P] [US1] Create BookmarkService.checkDuplicate method in client/libs/web/bookmark/data-access/src/lib/bookmark.service.ts
- [ ] T048 [US1] Create AddBookmarkDialogStore using signalStore() in client/libs/web/bookmark/feature/add-bookmark-dialog/src/lib/add-bookmark-dialog.store.ts
- [ ] T049 [US1] Add state properties (url, title, description, metadata, isLoading, error) to AddBookmarkDialogStore
- [ ] T050 [US1] Add computed signals (isValid, canSave, hasChanges) to AddBookmarkDialogStore
- [ ] T051 [US1] Implement fetchMetadata effect using rxMethod() in AddBookmarkDialogStore
- [ ] T052 [US1] Implement saveBookmark effect using rxMethod() in AddBookmarkDialogStore

**Frontend - Dialog Component**

- [ ] T053 [US1] Create AddBookmarkDialogComponent in client/libs/web/bookmark/feature/add-bookmark-dialog/src/lib/add-bookmark-dialog.component.ts
- [ ] T054 [US1] Create dialog template in client/libs/web/bookmark/feature/add-bookmark-dialog/src/lib/add-bookmark-dialog.component.html (Spartan UI Dialog)
- [ ] T055 [US1] Add URL input field with validation in dialog template
- [ ] T056 [US1] Add "Fetch Metadata" button with loading state in dialog template
- [ ] T057 [US1] Add title input field (reactive forms) in dialog template
- [ ] T058 [US1] Add description textarea (reactive forms) in dialog template
- [ ] T059 [US1] Add image preview section in dialog template
- [ ] T060 [US1] Add "Save" and "Cancel" buttons in dialog template
- [ ] T061 [US1] Implement URL validation logic in AddBookmarkDialogComponent
- [ ] T062 [US1] Implement metadata fetch on button click in AddBookmarkDialogComponent
- [ ] T063 [US1] Implement form population from metadata in AddBookmarkDialogComponent
- [ ] T064 [US1] Implement save bookmark logic in AddBookmarkDialogComponent
- [ ] T065 [US1] Implement dialog close logic (Cancel, X, outside click) in AddBookmarkDialogComponent
- [ ] T066 [US1] Add loading indicators (spinner) during metadata fetch in dialog template
- [ ] T067 [US1] Add error message display in dialog template
- [ ] T068 [US1] Style dialog with Tailwind CSS in client/libs/web/bookmark/feature/add-bookmark-dialog/src/lib/add-bookmark-dialog.component.css
- [ ] T069 [US1] Add keyboard shortcuts (Enter to save, Esc to close) in AddBookmarkDialogComponent
- [ ] T070 [US1] Implement focus trap within dialog (CDK FocusTrap) in AddBookmarkDialogComponent

**Frontend - Integration**

- [ ] T071 [US1] Export AddBookmarkDialogComponent from client/libs/web/bookmark/feature/add-bookmark-dialog/src/index.ts
- [ ] T072 [US1] Add "Add Bookmark" button to bookmarks list page in client/apps/client/src/app/
- [ ] T073 [US1] Implement dialog open/close logic in parent component
- [ ] T074 [US1] Add success notification on bookmark creation (ngx-sonner toast)
- [ ] T075 [US1] Refresh bookmark list after successful creation

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Customize Bookmark Metadata (Priority: P2)

**Goal**: Allow users to edit auto-fetched metadata (title, description, image selection) and add personal notes before saving

**Independent Test**: Fetch metadata → Edit title/description → Add notes → Select different image → Save → Verify customized data

### Tests for User Story 2

- [ ] T076 [P] [US2] Create unit test for image selection logic in AddBookmarkDialogStore
- [ ] T077 [P] [US2] Create component test for form editing in AddBookmarkDialogComponent.spec.ts
- [ ] T078 [P] [US2] Create component test for ImageGalleryComponent in client/libs/web/bookmark/ui/image-gallery/src/lib/image-gallery.component.spec.ts

### Implementation for User Story 2

**Frontend - Image Gallery Component**

- [ ] T079 [P] [US2] Create ImageGalleryComponent in client/libs/web/bookmark/ui/image-gallery/src/lib/image-gallery.component.ts
- [ ] T080 [US2] Create image gallery template in client/libs/web/bookmark/ui/image-gallery/src/lib/image-gallery.component.html
- [ ] T081 [US2] Implement image grid layout (responsive, max 10 images) in gallery template
- [ ] T082 [US2] Add image selection logic (radio buttons or click to select) in ImageGalleryComponent
- [ ] T083 [US2] Add selected image highlight/border in gallery template
- [ ] T084 [US2] Implement lazy loading for images (IntersectionObserver) in ImageGalleryComponent
- [ ] T085 [US2] Style image gallery with Tailwind CSS in client/libs/web/bookmark/ui/image-gallery/src/lib/image-gallery.component.css
- [ ] T086 [US2] Export ImageGalleryComponent from client/libs/web/bookmark/ui/image-gallery/src/index.ts

**Frontend - Form Enhancements**

- [ ] T087 [US2] Add notes textarea field to dialog template in add-bookmark-dialog.component.html
- [ ] T088 [US2] Add character counter for title (200 max) in dialog template
- [ ] T089 [US2] Add character counter for description (1000 max) in dialog template
- [ ] T090 [US2] Add character counter for notes (2000 max) in dialog template
- [ ] T091 [US2] Integrate ImageGalleryComponent into dialog template
- [ ] T092 [US2] Implement image selection state management in AddBookmarkDialogStore
- [ ] T093 [US2] Add selectedImageUrl to store state and update on image selection
- [ ] T094 [US2] Implement form dirty state tracking (hasChanges computed signal)
- [ ] T095 [US2] Add confirmation prompt if user re-fetches metadata with unsaved edits
- [ ] T096 [US2] Implement field validation (required fields, max lengths) in AddBookmarkDialogComponent
- [ ] T097 [US2] Display validation errors inline in dialog template

**Backend - Notes Field Support**

- [ ] T098 [US2] Update CreateBookmarkHandler to accept and save notes field
- [ ] T099 [US2] Add notes field validation in CreateBookmarkDto (max 2000 chars)
- [ ] T100 [US2] Update Swagger documentation for notes field in bookmark.controller.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Custom Image Selection (Priority: P3)

**Goal**: Enable users to upload custom images or provide image URLs instead of using auto-fetched images

**Independent Test**: Fetch metadata → Upload custom image OR enter image URL → Save → Verify custom image used

### Tests for User Story 3

- [ ] T101 [P] [US3] Create unit test for FileUploadService in server/src/common/services/file-upload.service.spec.ts
- [ ] T102 [P] [US3] Create integration test for POST /bookmarks/images/presigned-url endpoint in server/test/image-upload.e2e-spec.ts
- [ ] T103 [P] [US3] Create integration test for POST /bookmarks/images/validate endpoint in server/test/image-validation.e2e-spec.ts
- [ ] T104 [P] [US3] Create component test for image upload in AddBookmarkDialogComponent.spec.ts

### Implementation for User Story 3

**Backend - Image Upload Service**

- [ ] T105 [P] [US3] Create FileUploadService in server/src/common/services/file-upload.service.ts
- [ ] T106 [US3] Implement generatePresignedUrl method in FileUploadService (AWS S3 or compatible)
- [ ] T107 [US3] Implement validateImageFile method in FileUploadService (type, size, dimensions)
- [ ] T108 [US3] Implement sanitizeFilename method in FileUploadService (prevent path traversal)
- [ ] T109 [US3] Create ImageUploadRequestDto in server/src/modules/bookmark/dto/image-upload-request.dto.ts
- [ ] T110 [US3] Create ImageUploadResponseDto in server/src/modules/bookmark/dto/image-upload-response.dto.ts
- [ ] T111 [US3] Create POST /bookmarks/images/presigned-url endpoint in server/src/modules/bookmark/bookmark.controller.ts
- [ ] T112 [US3] Add rate limiting to image upload endpoint (30 requests/minute per user)

**Backend - Image URL Validation**

- [ ] T113 [P] [US3] Create ImageUrlValidationRequestDto in server/src/modules/bookmark/dto/image-url-validation-request.dto.ts
- [ ] T114 [P] [US3] Create ImageUrlValidationResponseDto in server/src/modules/bookmark/dto/image-url-validation-response.dto.ts
- [ ] T115 [US3] Implement validateImageUrl method in FileUploadService (check URL, MIME type, dimensions)
- [ ] T116 [US3] Create POST /bookmarks/images/validate endpoint in server/src/modules/bookmark/bookmark.controller.ts
- [ ] T117 [US3] Register FileUploadService in server/src/modules/bookmark/bookmark.module.ts

**Frontend - Image Upload UI**

- [ ] T118 [US3] Add file input (hidden) for image upload in dialog template
- [ ] T119 [US3] Add "Upload Image" button that triggers file input in dialog template
- [ ] T120 [US3] Add "Image URL" input field in dialog template
- [ ] T121 [US3] Add "Revert to Default" button in dialog template
- [ ] T122 [US3] Implement file selection handler in AddBookmarkDialogComponent
- [ ] T123 [US3] Implement file validation (type, size) in AddBookmarkDialogComponent
- [ ] T124 [US3] Implement image upload flow (request presigned URL → upload to S3 → get final URL) in AddBookmarkDialogComponent
- [ ] T125 [US3] Add upload progress indicator in dialog template
- [ ] T126 [US3] Implement custom image URL validation in AddBookmarkDialogComponent
- [ ] T127 [US3] Implement image preview for custom URL in AddBookmarkDialogComponent
- [ ] T128 [US3] Implement revert to default image logic in AddBookmarkDialogComponent
- [ ] T129 [US3] Add isUploadingImage state to AddBookmarkDialogStore
- [ ] T130 [US3] Add uploadImage effect using rxMethod() in AddBookmarkDialogStore
- [ ] T131 [US3] Add validateImageUrl effect using rxMethod() in AddBookmarkDialogStore
- [ ] T132 [US3] Display image upload errors in dialog template

**Frontend - Image Service**

- [ ] T133 [P] [US3] Create ImageService.getPresignedUrl method in client/libs/web/bookmark/data-access/src/lib/image.service.ts
- [ ] T134 [P] [US3] Create ImageService.uploadToS3 method in client/libs/web/bookmark/data-access/src/lib/image.service.ts
- [ ] T135 [P] [US3] Create ImageService.validateImageUrl method in client/libs/web/bookmark/data-access/src/lib/image.service.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Duplicate Detection & Confirmation

**Goal**: Implement duplicate URL detection with user-friendly confirmation dialog

**Purpose**: Cross-cutting concern that affects User Story 1 (save flow)

- [ ] T136 Create CheckDuplicateQuery in server/src/modules/bookmark/queries/check-duplicate.query.ts
- [ ] T137 Create CheckDuplicateHandler in server/src/modules/bookmark/queries/handlers/check-duplicate.handler.ts
- [ ] T138 Implement duplicate check logic in CheckDuplicateHandler (query by user_id and url)
- [ ] T139 Create GET /bookmarks/check-duplicate endpoint in server/src/modules/bookmark/bookmark.controller.ts
- [ ] T140 Register CheckDuplicateHandler in server/src/modules/bookmark/bookmark.module.ts
- [ ] T141 Add duplicate check before save in AddBookmarkDialogComponent
- [ ] T142 Create duplicate confirmation dialog template (nested dialog or alert)
- [ ] T143 Display existing bookmark details in confirmation (title, created date, link)
- [ ] T144 Add "View Existing" and "Save Anyway" buttons to confirmation
- [ ] T145 Implement "View Existing" logic (navigate to bookmark detail)
- [ ] T146 Implement "Save Anyway" logic (proceed with save despite duplicate)
- [ ] T147 Add showDuplicateConfirmation state to AddBookmarkDialogStore
- [ ] T148 Add duplicateBookmark state to AddBookmarkDialogStore

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T149 [P] Add accessibility attributes (ARIA labels, roles) to dialog in add-bookmark-dialog.component.html
- [ ] T150 [P] Test keyboard navigation (Tab, Shift+Tab, Enter, Esc) in dialog
- [ ] T151 [P] Test screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] T152 [P] Add loading skeletons for metadata fetch in dialog template
- [ ] T153 [P] Implement error retry mechanism for failed metadata fetch
- [ ] T154 [P] Add empty state message when no images available
- [ ] T155 [P] Implement responsive design for mobile (375px+) in dialog CSS
- [ ] T156 [P] Add animation transitions (dialog open/close, image selection) in dialog CSS
- [ ] T157 [P] Optimize image loading (lazy load, WebP format, compression)
- [ ] T158 [P] Add telemetry/analytics events (dialog opened, metadata fetched, bookmark saved)
- [ ] T159 [P] Update Swagger documentation with all endpoints and examples
- [ ] T160 [P] Create README.md for add-bookmark-dialog library with usage examples
- [ ] T161 [P] Add JSDoc comments to all public methods in services and components
- [ ] T162 [P] Run linting and fix any issues (npm run lint:fix)
- [ ] T163 [P] Run Prettier formatting (npm run format)
- [ ] T164 Verify all tests pass (npm run test)
- [ ] T165 Verify E2E tests pass (npm run test:e2e)
- [ ] T166 Check test coverage meets 80%+ threshold
- [ ] T167 Run quickstart.md validation (manual testing of integration steps)
- [ ] T168 Performance testing (dialog load < 500ms, metadata fetch < 5s)
- [ ] T169 Security audit (npm audit, dependency check)
- [ ] T170 Create demo video or GIF showing feature in action

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Duplicate Detection (Phase 6)**: Can be done in parallel with User Stories or after
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Extends US1/US2 but independently testable
- **Duplicate Detection**: Integrates with US1 save flow

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- DTOs and models before services
- Services before controllers/components
- Backend endpoints before frontend integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Backend and frontend work within a story can proceed in parallel (after DTOs/models)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T024: "Unit test for CrawlService.extractMetadata"
Task T025: "Unit test for CreateBookmarkHandler"
Task T026: "Integration test for POST /bookmarks"
Task T027: "Integration test for GET /metadata"
Task T028: "Component test for AddBookmarkDialogComponent"
Task T029: "E2E test for complete flow"

# Launch backend metadata extraction tasks together:
Task T030: "Implement CrawlService.extractMetadata"
Task T031: "Implement CrawlService.extractTitle"
Task T032: "Implement CrawlService.extractDescription"
Task T033: "Implement CrawlService.extractImages"
Task T034: "Implement CrawlService.extractFavicon"

# Launch frontend service methods together:
Task T045: "Create BookmarkService.fetchMetadata"
Task T046: "Create BookmarkService.createBookmark"
Task T047: "Create BookmarkService.checkDuplicate"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Duplicate Detection → Test → Deploy/Demo
6. Polish phase → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (backend + frontend)
   - Developer B: User Story 2 (backend + frontend)
   - Developer C: User Story 3 (backend + frontend)
3. Stories complete and integrate independently
4. Team collaborates on Duplicate Detection and Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests MUST be written first (TDD approach per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`

---

**Total Tasks**: 170  
**User Story 1 (P1 - MVP)**: 52 tasks  
**User Story 2 (P2)**: 25 tasks  
**User Story 3 (P3)**: 35 tasks  
**Duplicate Detection**: 13 tasks  
**Setup + Foundational**: 23 tasks  
**Polish**: 22 tasks  

**Parallel Opportunities**: 45+ tasks can run in parallel  
**Estimated MVP Time**: 3-5 days (User Story 1 only)  
**Estimated Full Feature Time**: 10-15 days (all user stories)

