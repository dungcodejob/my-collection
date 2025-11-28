# Feature Specification: Collection Tags

**Feature Branch**: `001-collection-tags`  
**Created**: 2025-11-28  
**Status**: Draft  
**Input**: User description: "When creating or editing a collection, display a tags input field. Users can select from existing tags or add new ones. Tags are stored per collection with autocomplete suggestions based on popular tags and prefix matching. Many-to-many relationship with customizable tag colors."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Add Tags to New Collection (Priority: P1)

As a user creating a new collection, I want to add tags to categorize it so I can organize and find collections more easily later.

**Why this priority**: This is the core functionality - without the ability to add tags when creating collections, the feature has no value. It delivers immediate organizational benefit.

**Independent Test**: Can be fully tested by creating a new collection with tags and verifying they are saved. Delivers organizational value for new collections.

**Acceptance Scenarios**:

1. **Given** I am on the create collection dialog, **When** I click on the tags input field, **Then** I see a dropdown with popular tags from my collections
2. **Given** I am typing in the tags input, **When** I type "am", **Then** I see suggested tags that start with "am" (e.g., "am_thuc", "amazon")
3. **Given** I have typed a partial tag name, **When** I select a suggestion from the dropdown, **Then** the tag is added to the collection's tag list
4. **Given** I want to create a new tag, **When** I type a tag name that doesn't exist and press Enter (or click create), **Then** a new tag is created and added to the collection
5. **Given** I have added tags to my collection, **When** I save the collection, **Then** the tags are persisted and associated with the collection

---

### User Story 2 - Edit Tags on Existing Collection (Priority: P1)

As a user editing an existing collection, I want to modify its tags so I can keep the organization current as my needs change.

**Why this priority**: Equal to US1 because editing existing collections is as fundamental as creating new ones. Users need both capabilities for a complete tag management experience.

**Independent Test**: Can be fully tested by editing an existing collection, adding/removing tags, and verifying changes persist.

**Acceptance Scenarios**:

1. **Given** I open the edit dialog for a collection with existing tags, **When** the dialog loads, **Then** I see the current tags displayed in the input field
2. **Given** I am editing a collection with tags, **When** I click the remove button on a tag, **Then** the tag is removed from the collection's tag list
3. **Given** I am editing a collection, **When** I add a new tag and save, **Then** the new tag is added to the collection while existing tags remain

---

### User Story 3 - Duplicate Tag Prevention (Priority: P2)

As a user, I want the system to prevent duplicate tags on a collection so my tag list stays clean and meaningful.

**Why this priority**: Important for data integrity and user experience, but the core tagging functionality (US1, US2) must work first.

**Independent Test**: Can be tested by attempting to add the same tag twice to a collection and verifying the duplicate is rejected with visual feedback.

**Acceptance Scenarios**:

1. **Given** a collection already has the tag "work", **When** I try to add "work" again, **Then** the existing tag is visually highlighted instead of adding a duplicate
2. **Given** I type a tag name that already exists on the collection, **When** I see it in suggestions, **Then** it is visually marked as "already added"

---

### User Story 4 - Tag Autocomplete with Smart Suggestions (Priority: P2)

As a user, I want intelligent tag suggestions when typing so I can quickly find and reuse existing tags without remembering exact names.

**Why this priority**: Enhances usability significantly but requires the basic tag input (US1) to function first.

**Independent Test**: Can be tested by typing partial tag names and verifying relevant suggestions appear based on popularity and prefix matching.

**Acceptance Scenarios**:

1. **Given** I focus on the tags input, **When** the dropdown opens, **Then** I see popular tags sorted by usage frequency across my collections
2. **Given** I type "dev", **When** suggestions appear, **Then** tags starting with "dev" are shown (e.g., "development", "devops")
3. **Given** I am editing a collection that previously had certain tags, **When** I open the tag input, **Then** previously used tags on this collection are prioritized in suggestions

---

### User Story 5 - Tag Color Display (Priority: P3)

As a user, I want tags to display in different colors so I can visually distinguish between tag categories at a glance.

**Why this priority**: Visual enhancement that improves UX but is not essential for core functionality.

**Independent Test**: Can be tested by viewing tags and verifying they display with their assigned colors.

**Acceptance Scenarios**:

1. **Given** a tag has an assigned color, **When** the tag is displayed in the collection dialog, **Then** the tag badge shows with that color
2. **Given** a tag has no assigned color, **When** the tag is displayed, **Then** a default color is used

---

### User Story 6 - Responsive Tag Input (Priority: P3)

As a mobile user, I want the tag input to be easy to use on small screens so I can manage tags on any device.

**Why this priority**: Important for mobile users but desktop functionality must be solid first.

**Independent Test**: Can be tested by using the tag input on mobile viewport and verifying usability.

**Acceptance Scenarios**:

1. **Given** I am on a mobile device, **When** I tap the tags input, **Then** the input field is large enough to tap easily (minimum 44px touch target)
2. **Given** I am viewing the suggestion dropdown on mobile, **When** the dropdown opens, **Then** it does not cover the entire screen and I can still see the input field
3. **Given** I am on mobile, **When** I scroll the suggestion list, **Then** the scrolling is smooth and the dropdown remains visible

---

### Edge Cases

- What happens when a user tries to add more than 20 tags to a single collection? System should display a warning and prevent additional tags.
- What happens when a tag name contains special characters? System should normalize the name (lowercase, trim whitespace, replace spaces with underscores).
- What happens when the suggestions API fails? Input should still allow manual tag creation with graceful error handling.
- What happens when the user types very quickly? System should debounce API calls to avoid excessive requests.
- What happens when a tag is removed from all collections? The tag remains in the system for future reuse (orphaned tags are preserved).
- What happens when saving a collection fails? Tags should not be partially saved - the operation should be atomic.
- What happens with concurrent edits to the same collection's tags? Last write wins - no conflict detection (later save overwrites earlier).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a tags input field in the collection create/edit dialog
- **FR-002**: System MUST allow users to select tags from a dropdown of suggestions
- **FR-003**: System MUST allow users to create new tags if no suitable suggestion exists
- **FR-004**: System MUST store tags using a many-to-many relationship (a collection can have many tags, a tag can belong to many collections)
- **FR-005**: System MUST provide autocomplete suggestions based on prefix matching (case-insensitive)
- **FR-006**: System MUST prioritize suggestions by: (1) tags previously used on the current collection, (2) popular tags by usage count across the current user's own collections (tags are private per user)
- **FR-007**: System MUST prevent duplicate tags on a single collection by highlighting existing tag instead of adding duplicate
- **FR-008**: System MUST display each tag with its assigned color (or default color if none assigned)
- **FR-009**: System MUST allow tags to be optional - collections can be saved without any tags
- **FR-010**: System MUST allow users to remove tags from a collection
- **FR-011**: System MUST normalize tag names (lowercase, trimmed, max 100 characters)
- **FR-012**: System MUST limit collections to a maximum of 20 tags
- **FR-013**: System MUST debounce autocomplete requests to prevent excessive API calls
- **FR-014**: System MUST provide responsive design with minimum 44px touch targets on mobile
- **FR-015**: System MUST support full keyboard navigation: Tab to focus input, Arrow keys to navigate suggestions, Enter to select highlighted suggestion, Backspace to remove last tag when input is empty
- **FR-016**: System MUST display helpful hint text when user has no existing tags (e.g., "Start typing to add tags")

### Key Entities _(include if feature involves data)_

- **CollectionTag**: Junction entity representing the many-to-many relationship between Collection and Tag. Contains: collection reference, tag reference, timestamp of when tag was added, user who added the tag.
- **Tag** (existing): Represents a reusable label owned by a specific user (private per user). Already has: name, description, usageCount, color, category, isActive, isSystem, author.
- **Collection** (existing): Represents a user's folder for bookmarks. Will gain a relationship to tags through CollectionTag.

## Clarifications

### Session 2025-11-28

- Q: Are tags shared within a tenant or private to each user? → A: Tags are private to each user (only see your own tags)
- Q: What level of keyboard navigation should the tag input support? → A: Full keyboard support (Tab, Arrow keys, Enter, Backspace)
- Q: What happens to a tag when it's no longer used by any collection? → A: Keep orphaned tags for future reuse
- Q: What should the tag input show when user has no tags? → A: Show helpful hint (e.g., "Start typing to add tags")
- Q: How should concurrent edits to the same collection's tags be handled? → A: Last write wins (no conflict detection)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can add tags to a collection in under 5 seconds (including autocomplete selection)
- **SC-002**: Tag autocomplete suggestions appear within 300ms of user input
- **SC-003**: Users can successfully create, edit, and delete collection tags on first attempt (90%+ success rate)
- **SC-004**: Mobile users can comfortably interact with tag input without zooming (touch targets >= 44px)
- **SC-005**: Tag suggestions are relevant - users select from suggestions at least 60% of the time rather than creating new tags
- **SC-006**: System prevents 100% of duplicate tag additions with clear visual feedback
- **SC-007**: Tag operations are atomic - no partial saves occur on collection save failure
