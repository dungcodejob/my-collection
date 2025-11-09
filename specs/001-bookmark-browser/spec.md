# Feature Specification: Bookmark Collection Browser

**Feature Branch**: `001-bookmark-browser`  
**Created**: November 9, 2025  
**Status**: Draft  
**Input**: User description: "I want to create a bookmark management feature where users can view the bookmarks they have in a collection and search for those collections based on filters. All filters and pagination must be synchronized with the URL so that users can reload the page without losing the filters and pagination. The filters must be designed to be easily expandable and dynamic. Bookmarks should have multiple display modes: List, Card, Moodboard. Design it to allow selecting multiple bookmarks at once and display them like the UI below."

## Clarifications

### Session 2025-11-09

- Q: What specific bulk actions must be supported for selected bookmarks in the initial version? → A: Delete only - keep it minimal for v1
- Q: Who can access and view a collection's bookmarks? → A: Owner only - users can only view their own collections
- Q: How should tag filtering work? → A: Support both AND/OR modes with UI toggle
- Q: What should the system do when filter/search operations exceed acceptable performance thresholds? → A: Show loading indicator + allow cancellation after 2 seconds
- Q: How should the system handle bookmark data updates while a user is viewing a collection? → A: Manual refresh only - users press F5 or reload to see updates

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Navigate Bookmarks in a Collection (Priority: P1)

Users need to view all bookmarks within a selected collection in a clear, organized manner. They should be able to browse through bookmarks using pagination, with their viewing state preserved when they return to the page.

**Why this priority**: This is the core functionality - without the ability to view bookmarks, the feature has no value. It represents the most basic requirement for bookmark management.

**Independent Test**: Can be fully tested by creating a collection with multiple bookmarks, navigating to the collection view, and verifying all bookmarks display correctly with pagination controls. Delivers immediate value by allowing users to see their saved bookmarks.

**Acceptance Scenarios**:

1. **Given** a user has a collection with 50 bookmarks, **When** they navigate to the collection view, **Then** they see the first page of bookmarks with pagination controls
2. **Given** a user is viewing page 2 of a collection, **When** they reload the browser page, **Then** they remain on page 2 with the same bookmarks displayed
3. **Given** a user is on the last page of bookmarks, **When** they click "Next", **Then** the button is disabled and they remain on the current page
4. **Given** a user views a collection in List mode, **When** they reload the page, **Then** the List mode view is preserved
5. **Given** a collection has no bookmarks, **When** a user views the collection, **Then** they see an empty state message with guidance
6. **Given** a user navigates to a large collection, **When** loading takes longer than 500ms, **Then** a loading indicator is displayed
7. **Given** a user is viewing a loading indicator for more than 2 seconds, **When** they click the cancel button, **Then** the loading stops and the previous view is restored

---

### User Story 2 - Switch Between Display Modes (Priority: P1)

Users want to view their bookmarks in different visual layouts (List, Card, Moodboard) depending on their current task or preference. The chosen layout should persist across page reloads.

**Why this priority**: Different viewing contexts require different presentations. List mode is ideal for quickly scanning titles, Card mode for balanced content preview, and Moodboard for visual inspiration. This directly impacts user experience and productivity.

**Independent Test**: Can be fully tested by switching between the three display modes and verifying that each mode shows bookmarks in the appropriate format, and that the selected mode persists on page reload.

**Acceptance Scenarios**:

1. **Given** a user is viewing bookmarks in List mode, **When** they click the Card mode button, **Then** bookmarks are immediately displayed in card format
2. **Given** a user switches to Moodboard mode, **When** they reload the page, **Then** the Moodboard view is maintained
3. **Given** a user is in any display mode, **When** they switch to another mode, **Then** pagination position is preserved
4. **Given** bookmarks are displayed in Moodboard mode, **When** the user has images in their bookmarks, **Then** images are prominently displayed in a grid layout
5. **Given** a user switches display modes, **When** they have bookmarks selected, **Then** the selection state is preserved across mode changes

---

### User Story 3 - Select Multiple Bookmarks (Priority: P2)

Users need to select multiple bookmarks simultaneously for bulk deletion. Selection state should be visible and easily manageable.

**Why this priority**: Bulk operations are essential for efficient bookmark management, but they depend on first being able to view bookmarks. This is a productivity enhancement rather than core functionality.

**Independent Test**: Can be fully tested by selecting multiple bookmarks across different pages, verifying visual feedback, and confirming selection state persists across pagination and display mode changes.

**Acceptance Scenarios**:

1. **Given** a user is viewing a list of bookmarks, **When** they click a bookmark's checkbox, **Then** the bookmark is visibly selected with a highlight or checkmark
2. **Given** a user has selected 5 bookmarks on page 1, **When** they navigate to page 2, **Then** the selection count shows 5 bookmarks selected
3. **Given** a user has selected bookmarks, **When** they click "Select All", **Then** all bookmarks on the current page are selected
4. **Given** a user has selected multiple bookmarks, **When** they switch display modes, **Then** the selection state is preserved
5. **Given** a user has selected bookmarks across multiple pages, **When** they apply a filter that excludes some selected bookmarks, **Then** only bookmarks matching the filter remain selected
6. **Given** a user has selected 3 bookmarks, **When** they click the bulk delete button and confirm the action, **Then** all 3 bookmarks are removed from the collection and selection is cleared

---

### User Story 4 - Filter Bookmarks Dynamically (Priority: P2)

Users want to find specific bookmarks by applying various filters (keyword search, date ranges, tags, status, etc.). Filters should be URL-synchronized so users can share filtered views or bookmark specific search results.

**Why this priority**: As collections grow, filtering becomes essential for findability. However, it requires the basic viewing functionality to be in place first. URL synchronization enables sharing and persistence.

**Independent Test**: Can be fully tested by applying different filter types individually, verifying results match filter criteria, and confirming that page reload with URL parameters maintains the filtered view.

**Acceptance Scenarios**:

1. **Given** a user is viewing all bookmarks, **When** they enter a keyword in the search box, **Then** only bookmarks matching the keyword are displayed
2. **Given** a user applies a date range filter, **When** they copy the URL and open it in a new tab, **Then** the same filtered results are displayed
3. **Given** a user applies multiple filters (keyword + date range + tag), **When** they view the results, **Then** only bookmarks matching ALL filters are shown
4. **Given** a user has applied filters, **When** they clear all filters, **Then** all bookmarks in the collection are displayed again
5. **Given** a user applies a filter that returns no results, **When** they view the page, **Then** an empty state message explains no bookmarks match the criteria
6. **Given** filters are applied, **When** the user navigates to page 2 of results, **Then** the URL contains both filter and pagination parameters
7. **Given** a user selects tags "work" and "important" with OR mode, **When** they apply the filter, **Then** bookmarks having either "work" OR "important" (or both) are displayed
8. **Given** a user selects tags "work" and "important" with AND mode, **When** they apply the filter, **Then** only bookmarks having both "work" AND "important" are displayed
9. **Given** a user has tag filters in OR mode, **When** they toggle to AND mode and reload the page, **Then** the AND mode is preserved in the URL

---

### User Story 5 - Sort Bookmarks (Priority: P3)

Users want to organize bookmark display by sorting on different criteria (date added, title, last modified, etc.) in ascending or descending order. Sort preferences should persist in the URL.

**Why this priority**: Sorting improves browsing experience but is less critical than filtering for finding specific bookmarks. Users can still navigate collections effectively without sorting.

**Independent Test**: Can be fully tested by applying different sort options, verifying bookmark order changes accordingly, and confirming sort parameters persist in URL across page reloads.

**Acceptance Scenarios**:

1. **Given** a user is viewing bookmarks, **When** they select "Sort by Date Added (Newest First)", **Then** bookmarks are reordered with newest at the top
2. **Given** a user has applied a sort, **When** they reload the page, **Then** the sort order is maintained
3. **Given** a user has both filters and sort applied, **When** they view results, **Then** filtered bookmarks are displayed in the specified sort order
4. **Given** a user sorts bookmarks alphabetically, **When** they switch display modes, **Then** the sort order is preserved
5. **Given** a user applies a sort, **When** they navigate between pages, **Then** the sort order is consistent across all pages

---

### Edge Cases

- **What happens when a user applies filters that result in only 1 page of results but they're currently on page 5?** The system should reset to page 1 and update the URL accordingly.
- **What happens when multiple users have the same collection open and one user deletes bookmarks being viewed by another?** Since collections are owner-only (not shared), this scenario doesn't apply. A single user may have the same collection open in multiple tabs; in this case, changes made in one tab won't be reflected in other tabs until manual page refresh.
- **How does the system handle bookmarks without images in Moodboard mode?** Display a placeholder image or default thumbnail to maintain grid layout consistency.
- **What happens when the URL contains invalid filter parameters?** The system should gracefully ignore invalid parameters, show all bookmarks, and optionally display a warning message.
- **How does the system behave when a user selects bookmarks, applies a filter, then removes the filter?** Previously selected bookmarks that were hidden by the filter should remain selected when the filter is removed.
- **What happens when URL parameters become extremely long due to many filters?** The system will rely on browser's URL capacity (~2000 characters, supporting roughly 15-20 typical filters). No artificial limits will be imposed on filter count. If URL length approaches browser limits, the system should display a warning but allow operation to continue.
- **How are bookmarks displayed when switching from a mode with selections to another mode?** Selection state must be preserved with visual indicators appropriate to each display mode.
- **What happens when a bookmark's data is updated while a user is viewing it?** Changes will not be reflected in real-time; users must manually refresh the page (F5 or browser reload) to see updated bookmark data. This keeps v1 implementation simple and avoids polling/websocket complexity.
- **What happens when a user attempts to access a collection they don't own?** The system should return an authorization error and redirect to an appropriate error page or the user's collection list.
- **What happens when a user cancels a long-running filter operation?** The system should abort the request, remain on the previous view state (showing previously loaded bookmarks), and allow the user to modify their filters or try again.

## Requirements *(mandatory)*

### Functional Requirements

#### Core Viewing & Navigation

- **FR-001**: System MUST verify that the authenticated user is the owner of the collection before displaying any bookmarks
- **FR-002**: System MUST display all bookmarks within a selected collection in the chosen display mode
- **FR-003**: System MUST provide pagination controls when bookmarks exceed a single page (assume 20 bookmarks per page for List/Card, 30 for Moodboard)
- **FR-004**: System MUST persist pagination state in URL parameters so page reloads maintain the current page
- **FR-005**: System MUST display appropriate empty states when collections contain no bookmarks or when filters return no results
- **FR-006**: System MUST load and display bookmark data including title, URL, description, tags, creation date, and thumbnail/preview image (if available)
- **FR-007**: System MUST display a loading indicator when filter, sort, or pagination operations take longer than 500ms
- **FR-008**: System MUST provide a cancellation control for operations that exceed 2 seconds, allowing users to abort the current request
- **FR-009**: System MUST NOT automatically refresh bookmark data; changes to bookmarks require manual page reload by the user

#### Display Modes

- **FR-010**: System MUST provide three distinct display modes: List, Card, and Moodboard
- **FR-011**: List mode MUST display bookmarks in a compact vertical list showing title, URL, and key metadata
- **FR-012**: Card mode MUST display bookmarks in a grid layout with thumbnail, title, description preview, and metadata
- **FR-013**: Moodboard mode MUST display bookmarks in a masonry or grid layout emphasizing visual thumbnails with minimal text
- **FR-014**: System MUST persist the selected display mode in URL parameters
- **FR-015**: System MUST allow users to switch between display modes without losing current filters, sort, pagination, or selection state

#### Multi-Selection

- **FR-016**: System MUST allow users to select multiple bookmarks simultaneously via checkboxes or click interactions
- **FR-017**: System MUST provide visual indicators (highlighting, checkmarks, borders) for selected bookmarks
- **FR-018**: System MUST display a selection count showing total number of selected bookmarks
- **FR-019**: System MUST provide "Select All" and "Deselect All" controls that work on the current page
- **FR-020**: System MUST maintain selection state across pagination, filtering, sorting, and display mode changes
- **FR-021**: System MUST allow users to clear all selections with a single action
- **FR-022**: System MUST provide a bulk delete action that removes all selected bookmarks with confirmation prompt

#### Filtering

- **FR-023**: System MUST support multiple filter types: keyword search, tags, date ranges, boolean properties (e.g., has_image, is_favorite)
- **FR-024**: System MUST encode all active filters in URL parameters using the format `field:type:value` (matching existing backend decorator pattern)
- **FR-025**: System MUST support combining multiple filters with AND logic (all filters must match)
- **FR-026**: System MUST provide a clear visual indication of which filters are currently active
- **FR-027**: System MUST allow users to add filters without losing existing filters, pagination, or sort state
- **FR-028**: System MUST allow users to remove individual filters or clear all filters at once
- **FR-029**: System MUST update bookmark display immediately when filters are applied or removed
- **FR-030**: System MUST parse URL parameters on page load and automatically apply encoded filters
- **FR-031**: Keyword filter MUST search across bookmark title, URL, description, and tags
- **FR-032**: Tag filter MUST support both AND logic (bookmark must have all selected tags) and OR logic (bookmark must have at least one selected tag)
- **FR-033**: Tag filter MUST provide a UI toggle to switch between AND/OR modes, with the selected mode persisted in URL parameters
- **FR-034**: Date range filters MUST support formats: `YYYY-MM-DD_YYYY-MM-DD` and allow open-ended ranges (only start or only end date)
- **FR-035**: System MUST handle invalid filter parameters gracefully by ignoring them and displaying all bookmarks

#### Sorting

- **FR-036**: System MUST support sorting bookmarks by: date added, title, last modified, and URL
- **FR-037**: System MUST support both ascending and descending sort directions
- **FR-038**: System MUST encode sort parameters in URL using format `field:direction` (matching existing backend decorator pattern)
- **FR-039**: System MUST maintain sort order across pagination and display mode changes
- **FR-040**: System MUST allow users to change sort criteria without losing filters or selections

#### URL Synchronization

- **FR-041**: System MUST synchronize all view state (filters, pagination, sort, display mode, tag filter mode) with URL query parameters
- **FR-042**: System MUST update URL parameters without page reload when users change filters, pagination, sort, or display mode
- **FR-043**: System MUST restore complete view state from URL parameters on page load or browser back/forward navigation
- **FR-044**: System MUST generate shareable URLs that reproduce the exact filtered, sorted, and paginated view
- **FR-045**: System MUST display a warning message when URL length approaches browser limits (approximately 1800 characters) while still allowing the operation

#### Filter Extensibility

- **FR-046**: Filter system MUST be architected to allow easy addition of new filter types without modifying core filtering logic
- **FR-047**: Filter UI components MUST be dynamically configurable based on available filter types for the bookmark entity
- **FR-048**: System MUST support adding new filter types by registering filter definitions with field name, type, and UI component

### Key Entities

- **Bookmark**: Represents a saved web resource with properties including title, URL, description, tags (array), creation date, last modified date, thumbnail URL, collection ID, and boolean flags (is_favorite, has_image). Each bookmark belongs to one collection.

- **Collection**: Represents a grouping of bookmarks with properties including name, description, owner user ID, creation date, and bookmark count. Collections organize bookmarks by theme or project.

- **Filter Definition**: Represents a filter configuration including field name (e.g., "title", "created_date"), filter type (keyword, number, range, daterange, boolean), UI component type, and validation rules. This enables dynamic filter expansion.

- **View State**: Represents the current user view configuration including active filters (array), sort criteria (field and direction), current page number, display mode (list/card/moodboard), tag filter mode (AND/OR), and selected bookmark IDs (array). This state is serialized to/from URL parameters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate to a collection and view all bookmarks within 2 seconds on collections with up to 1000 bookmarks
- **SC-002**: Users can switch between display modes (List, Card, Moodboard) with visual update completing in under 500ms
- **SC-003**: Users can apply a filter and see updated results in under 1 second
- **SC-004**: Page reload with URL parameters restores complete view state (filters, sort, pagination, display mode) with 100% accuracy
- **SC-005**: Users can select 50+ bookmarks across multiple pages without performance degradation
- **SC-006**: Adding a new filter type requires no changes to existing filtering UI or URL synchronization logic
- **SC-007**: Users can share a filtered/sorted view URL and recipients see identical results
- **SC-008**: System supports at least 5 simultaneous active filters without degrading performance or URL readability
- **SC-009**: 90% of users successfully find specific bookmarks using filters within 3 interactions (filter applications)
- **SC-010**: Zero data loss when using browser back/forward navigation with complex filter and sort combinations

## Assumptions

1. **Performance**: Collections typically contain fewer than 1000 bookmarks, with most under 200 bookmarks
2. **Pagination**: Default page size of 20 items for List/Card modes and 30 for Moodboard provides optimal balance between load time and scrolling
3. **Thumbnail availability**: Not all bookmarks will have thumbnail images; placeholder images will be used when thumbnails are unavailable
4. **Filter combination logic**: AND logic (all filters must match) is assumed; OR logic is not required in initial version
5. **Selection persistence**: Multi-selection is session-based and does not need to persist across browser sessions
6. **Authentication & Authorization**: User is already authenticated; each user can only view and manage their own collections (owner-only access model)
7. **URL length**: Modern browsers support URLs up to 2000+ characters, sufficient for approximately 15-20 typical filters; no artificial limits will be imposed on filter count
8. **Saved searches**: Initial version will not include saved filter presets; users can use browser bookmarks to save filtered views; feature will be reconsidered for Phase 2 based on user feedback
9. **Real-time updates**: Bookmark data changes by other users are not reflected in real-time; page refresh required
10. **Mobile responsiveness**: Design should adapt to mobile screens, though primary use case is desktop
11. **Browser compatibility**: Solution targets modern evergreen browsers (Chrome, Firefox, Safari, Edge) with ES6+ support

## Dependencies

- Backend API must support filter, sort, and pagination parameters matching the format defined in `parse-filters.decorator.ts` and `parse-sorts.decorator.ts`
- Bookmark entity in backend must include all fields referenced in filter and sort requirements
- Authentication system must provide current user context for collection access verification

## Scope Decisions

### URL Length and Filter Limits
The system will not impose artificial limits on the number of simultaneous filters. Implementation will rely on browser URL capacity (~2000 characters, approximately 15-20 typical filters). If URL length approaches browser limits during filter addition, the system should display a warning message but allow the operation to proceed. This provides maximum flexibility while alerting users to potential issues.

### Saved Search Feature - Phase 2
Saved filter combinations (named presets) are deferred to Phase 2. The initial version will focus on URL-based filter sharing, which allows users to bookmark filtered views using native browser bookmarks. This approach validates user needs before investing in preset storage and management UI. Based on user feedback and usage patterns, saved search functionality will be prioritized for future iterations.
