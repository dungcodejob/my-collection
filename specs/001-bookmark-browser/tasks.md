# Tasks: Bookmark Collection Browser

**Input**: Design documents from `/specs/001-bookmark-browser/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml, quickstart.md

**Tests**: Included per Constitution requirement (Principle III - Testing Requirements)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

**Monorepo Structure** (from plan.md):
- **Backend**: `server/src/`
- **Frontend**: `client/libs/web/bookmark/`
- **Tests**: 
  - Backend: `server/src/[module]/__tests__/`
  - Frontend: `client/libs/web/bookmark/[layer]/__tests__/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and structure verification

- [ ] T001 Verify Nx workspace configuration and ensure bookmark libraries are scaffolded per plan.md structure
- [ ] T002 [P] Create backend module structure: `server/src/bookmarks/` and `server/src/collections/`
- [ ] T003 [P] Create frontend library structure per plan.md: data-access, feature, ui components
- [ ] T004 [P] Configure ESLint and Prettier for bookmark feature modules
- [ ] T005 [P] Setup Tailwind CSS configuration if not already present in `client/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Entities

- [ ] T006 Create MikroORM migration for bookmark and collection schema per data-model.md in `server/src/migrations/`
- [ ] T007 [P] Implement Bookmark entity in `server/src/bookmarks/entities/bookmark.entity.ts`
- [ ] T008 [P] Implement Collection entity in `server/src/collections/entities/collection.entity.ts`
- [ ] T009 Run migration and verify database schema with indexes (collection_id, created_at, tags GIN)

### Authorization Framework

- [ ] T010 [P] Implement CollectionOwnerGuard in `server/src/collections/guards/collection-owner.guard.ts`
- [ ] T011 [P] Implement BookmarkOwnerGuard in `server/src/bookmarks/guards/bookmark-owner.guard.ts`
- [ ] T012 Add unit tests for authorization guards in respective `__tests__/` directories

### API Infrastructure

- [ ] T013 Create BookmarksModule in `server/src/bookmarks/bookmarks.module.ts` with MikroORM integration
- [ ] T014 Create CollectionsModule in `server/src/collections/collections.module.ts` with MikroORM integration
- [ ] T015 [P] Create BookmarkRepository in `server/src/bookmarks/bookmarks.repository.ts`
- [ ] T016 [P] Create CollectionRepository in `server/src/collections/collections.repository.ts`
- [ ] T017 Verify existing ParseFilters and ParseSort decorators support required filter types per contracts/api.yaml

### Frontend Infrastructure

- [ ] T018 Create BookmarkBrowserStore (NgRx Signal Store) skeleton in `client/libs/web/bookmark/data-access/src/lib/stores/bookmark-browser.store.ts`
- [ ] T019 [P] Create Bookmark interface in `client/libs/web/bookmark/data-access/src/lib/models/bookmark.model.ts`
- [ ] T020 [P] Create ViewState interface in `client/libs/web/bookmark/data-access/src/lib/models/view-state.model.ts`
- [ ] T021 [P] Create Filter interfaces in `client/libs/web/bookmark/data-access/src/lib/models/filter.model.ts`
- [ ] T022 Create BookmarkBrowserApi service skeleton in `client/libs/web/bookmark/data-access/src/lib/services/bookmark-browser.api.ts`
- [ ] T023 Configure Angular routing for bookmark browser in `client/libs/web/bookmark/feature/bookmark-browser/src/lib/bookmark-browser.routes.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View and Navigate Bookmarks (Priority: P1) 🎯 MVP

**Goal**: Users can view all bookmarks in a collection with pagination, and view state persists on page reload

**Independent Test**: Create a collection with 50 bookmarks, navigate to collection view, verify bookmarks display with pagination controls. Reload page and verify state persists (page number, display mode).

### Backend Tests for US1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T024 [P] [US1] Contract test for GET /collections/:id/bookmarks in `server/src/bookmarks/__tests__/bookmarks.controller.contract.spec.ts`
- [ ] T025 [P] [US1] Integration test for pagination in `server/src/bookmarks/__tests__/bookmarks.service.integration.spec.ts`
- [ ] T026 [P] [US1] Unit test for collection owner authorization in `server/src/collections/__tests__/collection-owner.guard.spec.ts`

### Backend Implementation for US1

- [ ] T027 [US1] Implement CollectionsService.findOne with owner verification in `server/src/collections/collections.service.ts`
- [ ] T028 [US1] Implement CollectionsController.getCollection endpoint in `server/src/collections/collections.controller.ts`
- [ ] T029 [US1] Create BookmarkQueryDto per contracts/api.yaml in `server/src/bookmarks/dto/bookmark-query.dto.ts`
- [ ] T030 [US1] Create BookmarkResponseDto per contracts/api.yaml in `server/src/bookmarks/dto/bookmark-response.dto.ts`
- [ ] T031 [US1] Implement BookmarksService.getBookmarks with pagination in `server/src/bookmarks/bookmarks.service.ts`
- [ ] T032 [US1] Implement BookmarksController.getCollectionBookmarks with CollectionOwnerGuard in `server/src/bookmarks/bookmarks.controller.ts`
- [ ] T033 [US1] Add Swagger documentation decorators to all US1 endpoints
- [ ] T034 [US1] Verify API works via Swagger UI at /api/docs

### Frontend Tests for US1

- [ ] T035 [P] [US1] Unit test for BookmarkBrowserStore pagination logic in `client/libs/web/bookmark/data-access/src/lib/stores/__tests__/bookmark-browser.store.spec.ts`
- [ ] T036 [P] [US1] Unit test for URL state synchronization in `client/libs/web/bookmark/data-access/src/lib/services/__tests__/bookmark-state.service.spec.ts`

### Frontend Implementation for US1

- [ ] T037 [P] [US1] Implement URL serialization/deserialization functions in `client/libs/web/bookmark/data-access/src/lib/services/bookmark-state.service.ts`
- [ ] T038 [US1] Implement BookmarkBrowserStore pagination state management per research.md Decision 1
- [ ] T039 [US1] Implement BookmarkBrowserApi.getBookmarks HTTP method in `client/libs/web/bookmark/data-access/src/lib/services/bookmark-browser.api.ts`
- [ ] T040 [US1] Connect store to API using rxMethod for bookmark loading
- [ ] T041 [US1] Implement URL sync: store changes → URL updates in BookmarkBrowserStore
- [ ] T042 [US1] Implement URL sync: URL changes → store updates via Router subscription
- [ ] T043 [P] [US1] Create BookmarkListComponent (list display mode) in `client/libs/web/bookmark/ui/bookmark-list/src/lib/bookmark-list.component.ts`
- [ ] T044 [P] [US1] Create BookmarkToolbarComponent with pagination controls in `client/libs/web/bookmark/ui/bookmark-toolbar/src/lib/bookmark-toolbar.component.ts`
- [ ] T045 [US1] Create BookmarkBrowserComponent container integrating store and components in `client/libs/web/bookmark/feature/bookmark-browser/src/lib/bookmark-browser.component.ts`
- [ ] T046 [US1] Implement pagination UI: previous, next, page numbers in BookmarkToolbarComponent
- [ ] T047 [US1] Add empty state component for no bookmarks in `client/libs/web/bookmark/ui/bookmark-list/src/lib/empty-state.component.ts`
- [ ] T048 [US1] Style BookmarkListComponent with Tailwind (compact vertical list per FR-007)

### E2E Test for US1

- [ ] T049 [US1] E2E test: Load collection, paginate, reload page, verify state persists in `client/apps/web-app-e2e/src/bookmark-browser.spec.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional - users can view and navigate bookmarks with URL persistence

---

## Phase 4: User Story 2 - Display Mode Switching (Priority: P1)

**Goal**: Users can switch between List, Card, and Moodboard views, with the chosen layout persisting across reloads

**Independent Test**: Switch between three display modes, verify each shows bookmarks in appropriate format, reload page and verify mode persists in URL.

### Frontend Tests for US2

- [ ] T050 [P] [US2] Unit test for display mode switching in BookmarkBrowserStore in `client/libs/web/bookmark/data-access/src/lib/stores/__tests__/bookmark-browser.store.spec.ts`
- [ ] T051 [P] [US2] Component test for mode switch buttons in `client/libs/web/bookmark/ui/bookmark-toolbar/__tests__/bookmark-toolbar.component.spec.ts`

### Frontend Implementation for US2

- [ ] T052 [US2] Add displayMode to BookmarkBrowserStore state with URL sync per research.md Decision 3
- [ ] T053 [P] [US2] Create BookmarkCardGridComponent in `client/libs/web/bookmark/ui/bookmark-card-grid/src/lib/bookmark-card-grid.component.ts`
- [ ] T054 [P] [US2] Create BookmarkMoodboardComponent in `client/libs/web/bookmark/ui/bookmark-moodboard/src/lib/bookmark-moodboard.component.ts`
- [ ] T055 [US2] Add mode switch buttons to BookmarkToolbarComponent (List, Card, Moodboard icons)
- [ ] T056 [US2] Implement @switch directive in BookmarkBrowserComponent to toggle between display components
- [ ] T057 [US2] Style BookmarkCardGridComponent with Tailwind grid layout (2-4 columns responsive per FR-008)
- [ ] T058 [US2] Style BookmarkMoodboardComponent with masonry/grid layout emphasizing images per FR-009
- [ ] T059 [US2] Implement image lazy loading for Card and Moodboard modes per research.md Decision 5
- [ ] T060 [US2] Add virtual scrolling to BookmarkMoodboardComponent using CDK per research.md Decision 5

### E2E Test for US2

- [ ] T061 [US2] E2E test: Switch display modes, verify layout changes, reload and verify mode persists in `client/apps/web-app-e2e/src/bookmark-browser-modes.spec.ts`

**Checkpoint**: User Stories 1 AND 2 work independently - users can view bookmarks in any display mode

---

## Phase 5: User Story 3 - Multi-Selection (Priority: P2)

**Goal**: Users can select multiple bookmarks simultaneously for bulk deletion, with selection state visible and preserved across view changes

**Independent Test**: Select multiple bookmarks across pages, verify selection count, switch display modes, verify selection preserved, perform bulk delete, verify bookmarks removed.

### Backend Tests for US3

- [ ] T062 [P] [US3] Contract test for DELETE /bookmarks (bulk) in `server/src/bookmarks/__tests__/bookmarks.controller.contract.spec.ts`
- [ ] T063 [P] [US3] Integration test for bulk delete with authorization in `server/src/bookmarks/__tests__/bookmarks.service.integration.spec.ts`

### Backend Implementation for US3

- [ ] T064 [US3] Create BulkDeleteDto per contracts/api.yaml in `server/src/bookmarks/dto/bulk-delete.dto.ts`
- [ ] T065 [US3] Create BulkDeleteResponseDto in `server/src/bookmarks/dto/bulk-delete.dto.ts`
- [ ] T066 [US3] Implement BookmarksService.bulkDelete with authorization check in `server/src/bookmarks/bookmarks.service.ts`
- [ ] T067 [US3] Implement BookmarksController.bulkDelete endpoint with BookmarkOwnerGuard in `server/src/bookmarks/bookmarks.controller.ts`
- [ ] T068 [US3] Add Swagger documentation for bulk delete endpoint

### Frontend Tests for US3

- [ ] T069 [P] [US3] Unit test for selection state management in `client/libs/web/bookmark/data-access/src/lib/stores/__tests__/bookmark-browser.store.spec.ts`
- [ ] T070 [P] [US3] Unit test for select all/deselect all logic in store tests
- [ ] T071 [P] [US3] Component test for selection bar in `client/libs/web/bookmark/ui/bookmark-selection-bar/__tests__/bookmark-selection-bar.component.spec.ts`

### Frontend Implementation for US3

- [ ] T072 [US3] Add selectedBookmarkIds to BookmarkBrowserStore per research.md Decision 4
- [ ] T073 [US3] Implement toggleSelection, selectAll, deselectAll methods in BookmarkBrowserStore
- [ ] T074 [US3] Implement pruneInvalidSelections method called after filter changes
- [ ] T075 [P] [US3] Add selection checkboxes to BookmarkListComponent
- [ ] T076 [P] [US3] Add selection checkboxes to BookmarkCardGridComponent
- [ ] T077 [P] [US3] Add selection checkboxes to BookmarkMoodboardComponent
- [ ] T078 [US3] Create BookmarkSelectionBarComponent in `client/libs/web/bookmark/ui/bookmark-selection-bar/src/lib/bookmark-selection-bar.component.ts`
- [ ] T079 [US3] Implement selection count display in BookmarkSelectionBarComponent
- [ ] T080 [US3] Implement clear selection button in BookmarkSelectionBarComponent
- [ ] T081 [US3] Implement bulk delete button with confirmation dialog in BookmarkSelectionBarComponent
- [ ] T082 [US3] Connect BookmarkSelectionBarComponent to BookmarkBrowserStore
- [ ] T083 [US3] Implement BookmarkBrowserApi.bulkDelete HTTP method
- [ ] T084 [US3] Wire bulk delete button to API call with success/error handling
- [ ] T085 [US3] Add visual selection indicators (highlighting) across all display modes
- [ ] T086 [US3] Show BookmarkSelectionBarComponent only when bookmarks are selected

### E2E Test for US3

- [ ] T087 [US3] E2E test: Select multiple bookmarks, verify count, delete, verify removal in `client/apps/web-app-e2e/src/bookmark-browser-selection.spec.ts`

**Checkpoint**: User Stories 1, 2, AND 3 work independently - users can select and bulk delete bookmarks

---

## Phase 6: User Story 4 - Dynamic Filtering (Priority: P2)

**Goal**: Users can find specific bookmarks using various filters (keyword, date range, tags), with filters URL-synchronized and extensible

**Independent Test**: Apply keyword filter, verify results match. Apply date range filter, copy URL to new tab, verify same results. Apply multiple filters, verify AND logic. Clear filters, verify all bookmarks shown.

### Backend Tests for US4

- [ ] T088 [P] [US4] Unit test for filter parsing logic (verify existing ParseFilters decorator) in `server/src/shared/decorators/__tests__/parse-filters.decorator.spec.ts`
- [ ] T089 [P] [US4] Integration test for keyword filter in `server/src/bookmarks/__tests__/bookmarks.service.integration.spec.ts`
- [ ] T090 [P] [US4] Integration test for date range filter
- [ ] T091 [P] [US4] Integration test for tag filter with AND/OR mode per research.md Decision 7

### Backend Implementation for US4

- [ ] T092 [US4] Implement filter query building in BookmarksService.getBookmarks (keyword, daterange, boolean)
- [ ] T093 [US4] Implement tag filter with AND/OR mode support per research.md Decision 7
- [ ] T094 [US4] Add tagMode parameter handling to BookmarkQueryDto
- [ ] T095 [US4] Verify all filter types work: keyword, number, range, daterange, boolean per FR-018

### Frontend Tests for US4

- [ ] T096 [P] [US4] Unit test for filter serialization/deserialization in `client/libs/web/bookmark/data-access/src/lib/services/__tests__/bookmark-state.service.spec.ts`
- [ ] T097 [P] [US4] Unit test for filter application in store
- [ ] T098 [P] [US4] Component test for keyword filter component
- [ ] T099 [P] [US4] Component test for tag filter with AND/OR toggle

### Frontend Implementation for US4

- [ ] T100 [US4] Create FilterDefinition interface per research.md Decision 2 in `client/libs/web/bookmark/data-access/src/lib/models/filter.model.ts`
- [ ] T101 [US4] Create FILTER_REGISTRY injection token
- [ ] T102 [US4] Define BOOKMARK_FILTERS array with filter definitions per research.md Decision 2
- [ ] T103 [P] [US4] Create KeywordFilterComponent in `client/libs/web/bookmark/ui/bookmark-filters/src/lib/filter-components/keyword-filter.component.ts`
- [ ] T104 [P] [US4] Create DateRangeFilterComponent in `client/libs/web/bookmark/ui/bookmark-filters/src/lib/filter-components/daterange-filter.component.ts`
- [ ] T105 [P] [US4] Create TagFilterComponent with AND/OR toggle in `client/libs/web/bookmark/ui/bookmark-filters/src/lib/filter-components/tag-filter.component.ts`
- [ ] T106 [P] [US4] Create BooleanFilterComponent in `client/libs/web/bookmark/ui/bookmark-filters/src/lib/filter-components/boolean-filter.component.ts`
- [ ] T107 [US4] Create BookmarkFiltersComponent container in `client/libs/web/bookmark/ui/bookmark-filters/src/lib/bookmark-filters.component.ts`
- [ ] T108 [US4] Implement dynamic filter rendering using ngComponentOutlet per research.md Decision 2
- [ ] T109 [US4] Add filters to BookmarkBrowserStore with URL sync
- [ ] T110 [US4] Implement addFilter, removeFilter, clearFilters methods in store
- [ ] T111 [US4] Implement filter application logic: reset to page 1 when filters change per FR-022
- [ ] T112 [US4] Add active filters display (chips/pills) to BookmarkFiltersComponent
- [ ] T113 [US4] Implement filter removal by clicking chip close button
- [ ] T114 [US4] Implement clear all filters button
- [ ] T115 [US4] Add tag filter mode toggle to TagFilterComponent UI per research.md Decision 7
- [ ] T116 [US4] Connect tagFilterMode to store and URL sync
- [ ] T117 [US4] Style filter components with Tailwind following Constitution Principle VIII

### E2E Test for US4

- [ ] T118 [US4] E2E test: Apply filters, verify results, share URL, verify same results in new tab in `client/apps/web-app-e2e/src/bookmark-browser-filters.spec.ts`

**Checkpoint**: User Stories 1, 2, 3, AND 4 work independently - users can filter bookmarks dynamically

---

## Phase 7: User Story 5 - Sorting (Priority: P3)

**Goal**: Users can organize bookmark display by sorting on different criteria (date, title, etc.) in ascending or descending order, with sort persisting in URL

**Independent Test**: Apply sort by date (newest first), verify order. Apply sort by title, verify alphabetical order. Reload page, verify sort persists.

### Backend Tests for US5

- [ ] T119 [P] [US5] Unit test for sort parsing (verify existing ParseSort decorator) in `server/src/shared/decorators/__tests__/parse-sorts.decorator.spec.ts`
- [ ] T120 [P] [US5] Integration test for sorting by createdAt in `server/src/bookmarks/__tests__/bookmarks.service.integration.spec.ts`
- [ ] T121 [P] [US5] Integration test for sorting by title

### Backend Implementation for US5

- [ ] T122 [US5] Implement sort query building in BookmarksService.getBookmarks for all sortable fields per FR-030
- [ ] T123 [US5] Verify sort works with filters (filtered results remain sorted)

### Frontend Tests for US5

- [ ] T124 [P] [US5] Unit test for sort state management in `client/libs/web/bookmark/data-access/src/lib/stores/__tests__/bookmark-browser.store.spec.ts`
- [ ] T125 [P] [US5] Component test for sort dropdown in `client/libs/web/bookmark/ui/bookmark-toolbar/__tests__/bookmark-toolbar.component.spec.ts`

### Frontend Implementation for US5

- [ ] T126 [US5] Add sort to BookmarkBrowserStore with URL sync
- [ ] T127 [US5] Implement setSort method in store
- [ ] T128 [US5] Add sort dropdown to BookmarkToolbarComponent with options: date added, title, last modified, URL
- [ ] T129 [US5] Add sort direction toggle (asc/desc) to BookmarkToolbarComponent
- [ ] T130 [US5] Connect sort controls to store
- [ ] T131 [US5] Ensure sort maintains current page per FR-032
- [ ] T132 [US5] Style sort controls with Tailwind

### E2E Test for US5

- [ ] T133 [US5] E2E test: Apply sort, verify order, reload, verify persistence in `client/apps/web-app-e2e/src/bookmark-browser-sort.spec.ts`

**Checkpoint**: All user stories (1-5) work independently - full bookmark browser functionality complete

---

## Phase 8: Performance & Loading States

**Purpose**: Implement loading indicators, cancellation, and performance optimizations per research.md Decision 6

- [ ] T134 [P] Add loading state (isLoading, canCancel, loadingMessage) to BookmarkBrowserStore
- [ ] T135 [P] Implement loading indicator with 500ms delay in BookmarkBrowserComponent per FR-007
- [ ] T136 [P] Implement cancellation button appearing after 2 seconds per FR-008
- [ ] T137 Implement AbortController in BookmarkBrowserApi for request cancellation per research.md Decision 6
- [ ] T138 Wire cancel button to AbortController.abort()
- [ ] T139 [P] Add OnPush change detection strategy to all components per research.md Decision 5
- [ ] T140 [P] Add trackBy functions to all @for loops using bookmark.id
- [ ] T141 [P] Implement debouncing for keyword filter input (300ms) per research.md Decision 5
- [ ] T142 [P] Implement URL update throttling (300ms) per research.md Decision 5
- [ ] T143 Add warning message for URL length approaching 1800 characters per FR-039

---

## Phase 9: Error Handling & Edge Cases

**Purpose**: Handle all edge cases identified in spec.md

- [ ] T144 [P] Implement error state in BookmarkBrowserStore (error message display)
- [ ] T145 [P] Add error handling for API failures with user-friendly messages
- [ ] T146 Implement page reset to 1 when filters result in fewer pages than current page
- [ ] T147 [P] Add placeholder images for bookmarks without thumbnails in Moodboard mode
- [ ] T148 [P] Handle invalid filter parameters gracefully per FR-029
- [ ] T149 Add toast/notification component for success/error messages
- [ ] T150 Implement 403 error handling: redirect to collections list if not owner
- [ ] T151 Test concurrent tab scenario: changes in one tab don't reflect in other until reload

---

## Phase 10: Accessibility & Styling

**Purpose**: Ensure WCAG 2.1 AA compliance and Constitution styling requirements

- [ ] T152 [P] Add ARIA labels to all interactive elements (buttons, checkboxes, filters)
- [ ] T153 [P] Ensure keyboard navigation works: Tab through filters, mode buttons, pagination
- [ ] T154 [P] Add focus indicators to all focusable elements
- [ ] T155 [P] Verify color contrast meets 4.5:1 ratio for all text
- [ ] T156 [P] Add alt text to all bookmark thumbnails
- [ ] T157 [P] Ensure screen reader announces filter changes and selection count
- [ ] T158 Review all CSS for excessive @apply usage per Constitution Principle VIII (max 3-5 per class)
- [ ] T159 [P] Refactor any complex CSS patterns to use Tailwind utilities directly in templates
- [ ] T160 [P] Verify mobile responsiveness: Card grid collapses to 1-2 columns on small screens

---

## Phase 11: Testing & Documentation

**Purpose**: Comprehensive test coverage and documentation finalization

### Unit Tests (Complete Coverage)

- [ ] T161 [P] Unit test for Bookmark entity validation in `server/src/bookmarks/entities/__tests__/bookmark.entity.spec.ts`
- [ ] T162 [P] Unit test for BookmarksRepository query methods in `server/src/bookmarks/__tests__/bookmarks.repository.spec.ts`
- [ ] T163 [P] Unit test for filter registry and serialization logic in frontend
- [ ] T164 [P] Unit test for all BookmarkBrowserStore computed signals
- [ ] T165 [P] Component tests for all display mode components (List, Card, Moodboard)

### Integration Tests

- [ ] T166 [P] Integration test for complete filter + sort + pagination flow
- [ ] T167 [P] Integration test for bulk delete with partial authorization failure
- [ ] T168 [P] Integration test for URL synchronization round-trip

### E2E Tests (Critical Journeys)

- [ ] T169 E2E test: Complete bookmark browsing journey from collection list to filtered view with URL share
- [ ] T170 E2E test: Multi-selection across pages with bulk delete
- [ ] T171 E2E test: Browser back/forward navigation preserves state

### Performance Validation

- [ ] T172 Load test with 1000 bookmark collection, verify < 2s load time per SC-001
- [ ] T173 Test filter application < 1s per SC-003
- [ ] T174 Test display mode switching < 500ms per SC-002
- [ ] T175 Run Lighthouse audit, verify > 90 performance score
- [ ] T176 Test with slow 3G network throttling

### Documentation

- [ ] T177 [P] Verify quickstart.md instructions are accurate by following them
- [ ] T178 [P] Update API documentation in Swagger with latest examples
- [ ] T179 [P] Document filter extensibility pattern in README with example
- [ ] T180 [P] Create architecture diagram showing frontend-backend data flow
- [ ] T181 [P] Document URL parameter format and examples for users

---

## Phase 12: Polish & Deployment Readiness

**Purpose**: Final improvements and production readiness

- [ ] T182 [P] Code review for all TypeScript strict mode compliance
- [ ] T183 [P] Code review for consistent error handling patterns
- [ ] T184 [P] Security audit: verify all endpoints have authorization guards
- [ ] T185 [P] Security audit: verify input sanitization on all filters
- [ ] T186 Run full linting across all modified files: `npx nx run-many --target=lint --all`
- [ ] T187 Run full test suite: `npx nx run-many --target=test --all`
- [ ] T188 Build production bundles and verify bundle size < 500KB gzipped per Constitution
- [ ] T189 [P] Add database indexes if missing (verify with EXPLAIN on queries)
- [ ] T190 [P] Setup error tracking integration (Sentry or similar)
- [ ] T191 [P] Verify migration scripts are idempotent and reversible
- [ ] T192 Create feature flag for gradual rollout (if applicable)
- [ ] T193 Prepare deployment checklist following quickstart.md
- [ ] T194 Final cross-browser testing: Chrome, Firefox, Safari, Edge
- [ ] T195 Final QA pass: execute all user stories independently

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - Can proceed in parallel if team capacity allows
  - Or sequentially in priority order: US1 → US2 → US3 → US4 → US5
- **Performance (Phase 8)**: Can integrate incrementally into each user story or all at once after US5
- **Error Handling (Phase 9)**: Can integrate incrementally or all at once after US5
- **Accessibility (Phase 10)**: Should be integrated during user story implementation but can be a final pass
- **Testing (Phase 11)**: Tests should be written with each user story (TDD), final comprehensive tests here
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Dependencies

All user stories can theoretically run in parallel after Foundational phase, but practical order:

- **User Story 1 (P1)**: Can start after Foundational - **No dependencies on other stories**
- **User Story 2 (P1)**: Can start after Foundational - Uses US1 infrastructure but independently testable
- **User Story 3 (P2)**: Can start after Foundational - Uses US1 infrastructure but independently testable
- **User Story 4 (P2)**: Can start after Foundational - Uses US1 infrastructure but independently testable
- **User Story 5 (P3)**: Can start after Foundational - Uses US1 infrastructure but independently testable

**Recommended Sequential Order**: US1 → US2 → (US3 and US4 in parallel) → US5

### Within Each User Story

- Backend tests before backend implementation (TDD)
- Frontend tests before frontend implementation (TDD)
- Backend implementation before frontend can call APIs
- Models before services
- Services before controllers
- Core implementation before integration
- Story complete and tested independently before moving to next

### Parallel Opportunities

#### Setup (Phase 1)
- T002, T003, T004, T005 can all run in parallel

#### Foundational (Phase 2)
- T007 and T008 (entities) can run in parallel
- T010 and T011 (guards) can run in parallel after T007/T008
- T015 and T016 (repositories) can run in parallel after T007/T008
- T019, T020, T021 (frontend interfaces) can run in parallel

#### User Story 1 (Phase 3)
- T024, T025, T026 (tests) can all run in parallel
- T035, T036 (frontend tests) can run in parallel
- T043, T044 (components) can run in parallel after store is done

#### User Story 2 (Phase 4)
- T050, T051 (tests) can run in parallel
- T053, T054 (Card and Moodboard components) can run in parallel

#### User Story 3 (Phase 5)
- T062, T063 (backend tests) can run in parallel
- T069, T070, T071 (frontend tests) can run in parallel
- T075, T076, T077 (adding checkboxes to display components) can run in parallel

#### User Story 4 (Phase 6)
- T088, T089, T090, T091 (backend tests) can run in parallel
- T096, T097, T098, T099 (frontend tests) can run in parallel
- T103, T104, T105, T106 (filter components) can run in parallel

#### User Story 5 (Phase 7)
- T119, T120, T121 (backend tests) can run in parallel
- T124, T125 (frontend tests) can run in parallel

#### Cross-Cutting Phases (8-12)
- Most tasks within each phase marked [P] can run in parallel

---

## Parallel Example: User Story 1 (Backend)

```bash
# Launch all backend tests for User Story 1 together:
Task T024: "Contract test for GET /collections/:id/bookmarks"
Task T025: "Integration test for pagination"
Task T026: "Unit test for collection owner authorization"

# After tests written and failing, launch these in parallel:
Task T027: "Implement CollectionsService.findOne" 
Task T029: "Create BookmarkQueryDto"
Task T030: "Create BookmarkResponseDto"
# (T027, T029, T030 different files, no dependencies)

# After those complete:
Task T031: "Implement BookmarksService.getBookmarks" (depends on T029, T030)
Task T032: "Implement BookmarksController.getCollectionBookmarks" (depends on T031)
```

## Parallel Example: User Story 1 (Frontend)

```bash
# Launch all frontend tests together:
Task T035: "Unit test for BookmarkBrowserStore pagination"
Task T036: "Unit test for URL state synchronization"

# After tests written, launch these in parallel:
Task T037: "URL serialization/deserialization functions" (different file)
Task T043: "Create BookmarkListComponent" (different file)
Task T044: "Create BookmarkToolbarComponent" (different file)

# After T037 complete, start store:
Task T038: "BookmarkBrowserStore pagination state"
Task T039: "BookmarkBrowserApi.getBookmarks"
# (can run in parallel with T043, T044 continuing)
```

## Parallel Example: Multiple User Stories

```bash
# Once Foundational phase (T006-T023) completes, team can split:

Developer A: User Story 1 (T024-T049) - View and Navigate
Developer B: User Story 2 (T050-T061) - Display Modes  
Developer C: User Story 3 (T062-T087) - Multi-Selection

# Each developer completes their story independently
# Stories integrate without conflicts (different components)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Fastest Time to Value

1. **Complete Phase 1: Setup** (T001-T005) - ~2 hours
2. **Complete Phase 2: Foundational** (T006-T023) - **CRITICAL** - ~2-3 days
   - Database schema, entities, authorization guards
   - Repository and service infrastructure
   - Frontend store skeleton and interfaces
3. **Complete Phase 3: User Story 1** (T024-T049) - ~3-4 days
   - Backend API for listing bookmarks with pagination
   - Frontend with single display mode and URL sync
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Create test collection with 50 bookmarks
   - Verify pagination works
   - Reload page, verify state persists
   - **Deploy/demo if ready!**

**MVP Delivered**: ~1 week - Users can view and navigate bookmarks in collections

### Incremental Delivery (Recommended)

1. **Week 1**: Setup + Foundational + User Story 1 (T001-T049)
   - **Deliverable**: MVP - View and navigate bookmarks
   - **Demo**: Show pagination and URL persistence
   - **Deploy**: Production-ready for basic use

2. **Week 2**: User Story 2 (T050-T061)
   - **Deliverable**: Display mode switching
   - **Demo**: Show List, Card, Moodboard views
   - **Deploy**: Enhanced viewing experience

3. **Week 2-3**: User Stories 3 & 4 in parallel (T062-T118)
   - **Deliverable**: Selection + bulk delete + dynamic filtering
   - **Demo**: Show power user features
   - **Deploy**: Full management capabilities

4. **Week 3**: User Story 5 + Performance (T119-T143)
   - **Deliverable**: Sorting + loading states
   - **Demo**: Complete feature set
   - **Deploy**: Polished experience

5. **Week 4**: Error handling, Accessibility, Testing, Polish (T144-T195)
   - **Deliverable**: Production-ready quality
   - **Demo**: Cross-browser, accessibility compliant
   - **Deploy**: Enterprise-ready

### Parallel Team Strategy (3 Developers)

With three developers available:

**Week 1** - Foundation (everyone)
- Complete Setup + Foundational together (T001-T023)
- **Checkpoint**: Foundation ready for parallel work

**Week 2** - Parallel User Stories
- **Developer A**: User Story 1 (T024-T049) - Core functionality
- **Developer B**: User Story 2 (T050-T061) - Display modes
- **Developer C**: User Story 3 (T062-T087) - Multi-selection
- **Checkpoint**: Three stories complete independently

**Week 3** - Parallel Completion
- **Developer A**: User Story 4 (T088-T118) - Filtering
- **Developer B**: User Story 5 (T119-T133) - Sorting
- **Developer C**: Performance + Error Handling (T134-T151)
- **Checkpoint**: All user stories complete

**Week 4** - Quality & Polish (everyone)
- Accessibility (T152-T160) - split across team
- Testing (T161-T176) - split across team
- Documentation (T177-T181) - split across team
- Polish (T182-T195) - split across team

**Timeline**: ~4 weeks with 3 developers for complete, polished feature

---

## Task Validation Checklist

✅ **Format Compliance**:
- All tasks have checkbox `- [ ]`
- All tasks have sequential ID (T001, T002, ...)
- Parallelizable tasks marked with `[P]`
- User story tasks marked with `[US1]`, `[US2]`, etc.
- All tasks include exact file paths

✅ **Organization**:
- Tasks grouped by user story phases
- Each user story has clear goal and independent test
- Setup and Foundational phases before user stories
- Polish phase at end

✅ **Completeness**:
- All 5 user stories from spec.md covered
- All entities from data-model.md implemented
- All endpoints from contracts/api.yaml implemented
- All technical decisions from research.md applied
- Testing strategy per Constitution requirements

✅ **Dependencies**:
- Clear phase dependencies documented
- User story independence verified
- Parallel opportunities identified
- Sequential order within stories defined

✅ **Testability**:
- Each user story has independent test criteria
- Tests written before implementation (TDD)
- E2E tests for each user story
- Performance validation included

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD approach**: Write tests first, ensure they fail, then implement
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **MVP scope**: Just Phase 1, 2, and 3 (User Story 1) = ~1 week
- **Avoid**: vague tasks, same file conflicts, cross-story dependencies

---

## Summary

**Total Tasks**: 195  
**Phases**: 12  
**User Stories**: 5 (from spec.md)  
**Parallel Opportunities**: 80+ tasks marked [P]  
**MVP Scope**: T001-T049 (Setup + Foundational + User Story 1)  
**Estimated Timeline**: 
- MVP only: ~1 week (1 developer)
- All user stories: ~4 weeks (1 developer)
- All user stories with 3 developers in parallel: ~2-3 weeks
- Full polish: ~4 weeks (1 developer) or ~3 weeks (3 developers)

**Independent Test Coverage**: Each of 5 user stories has clear acceptance criteria and can be validated independently

**Next Steps**: Begin with Phase 1 (Setup) and proceed sequentially through phases, or assign user stories to parallel teams after Foundational phase completes.

