# Feature Specification: Add Bookmark Dialog

**Feature Branch**: `001-add-bookmark-dialog`  
**Created**: 2025-01-06  
**Status**: Draft  
**Input**: User description: "I want to build a dialog that allows users to add a bookmark. The dialog will include a field with an input where users can enter a URL and a button to call an API that retrieves metadata from that URL. After fetching the metadata, the data will be filled into a pre-defined form and displayed on the screen. Users can then customize the metadata (title, description, and image) and add a note. For the image, the default will use the thumbnail from the metadata, but users can also choose from other images returned from the website. Additionally, users can further customize the image by uploading their own image or adding one via a URL."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Bookmark Creation (Priority: P1)

A user wants to quickly save a bookmark by entering a URL and letting the system automatically fetch and populate the bookmark details.

**Why this priority**: This is the core value proposition - enabling users to save bookmarks with minimal effort. Without this, the feature has no purpose.

**Independent Test**: Can be fully tested by opening the dialog, entering a valid URL, clicking fetch metadata, and saving the bookmark with auto-populated data. Delivers immediate value by allowing users to save bookmarks.

**Acceptance Scenarios**:

1. **Given** the user is logged in and viewing their bookmarks, **When** they click "Add Bookmark" button, **Then** a dialog opens with an empty URL input field and a "Fetch Metadata" button
2. **Given** the dialog is open with an empty URL field, **When** the user enters a valid URL (e.g., "https://example.com") and clicks "Fetch Metadata", **Then** the system retrieves metadata and populates the form fields (title, description, thumbnail image)
3. **Given** the form is populated with fetched metadata, **When** the user clicks "Save", **Then** the bookmark is created with the fetched data and the dialog closes
4. **Given** the form is populated with fetched metadata, **When** the user clicks "Cancel", **Then** the dialog closes without saving and no bookmark is created

---

### User Story 2 - Customize Bookmark Metadata (Priority: P2)

A user wants to edit the auto-fetched bookmark information (title, description, image) before saving to ensure accuracy and personalization.

**Why this priority**: Auto-fetched metadata may not always be accurate or match user preferences. This allows users to correct and personalize their bookmarks.

**Independent Test**: Can be tested by fetching metadata, editing any of the fields (title, description, or selecting a different image), and verifying the customized data is saved correctly.

**Acceptance Scenarios**:

1. **Given** the form is populated with fetched metadata, **When** the user edits the title field, **Then** the edited title is preserved and saved with the bookmark
2. **Given** the form is populated with fetched metadata, **When** the user edits the description field, **Then** the edited description is preserved and saved with the bookmark
3. **Given** multiple images are available from the fetched metadata, **When** the user selects a different image from the available options, **Then** the selected image becomes the bookmark thumbnail
4. **Given** the form is populated, **When** the user adds a personal note in the notes field, **Then** the note is saved with the bookmark

---

### User Story 3 - Custom Image Selection (Priority: P3)

A user wants to use a custom image for their bookmark instead of the auto-fetched images, either by uploading their own image or providing an image URL.

**Why this priority**: Provides advanced customization for users who want complete control over bookmark appearance. Nice-to-have but not essential for basic functionality.

**Independent Test**: Can be tested by fetching metadata, then either uploading a custom image file or entering a custom image URL, and verifying the custom image is used as the bookmark thumbnail.

**Acceptance Scenarios**:

1. **Given** the form is populated with fetched metadata, **When** the user clicks "Upload Image" and selects an image file from their device, **Then** the uploaded image replaces the thumbnail and is saved with the bookmark
2. **Given** the form is populated with fetched metadata, **When** the user enters a custom image URL in the "Image URL" field, **Then** the system validates and displays the image from that URL as the thumbnail
3. **Given** metadata contains multiple images, **When** the user selects one of the images from the fetched metadata, **Then** the selected image becomes the bookmark thumbnail
4. **Given** the user has uploaded or provided a custom image, **When** they click "Revert to Default", **Then** the system restores the original fetched thumbnail image
5. **Given** the user provides an invalid image URL, **When** they attempt to use it, **Then** the system displays an error message and keeps the current thumbnail

---

### Edge Cases

- What happens when the entered URL is invalid or malformed?
- What happens when the metadata fetch API fails or times out?
- What happens when the website has no metadata available (no title, description, or images)?
- What happens when the user tries to upload an image file that is too large or in an unsupported format?
- What happens when the user provides an image URL that returns a 404 or is not an image?
- What happens when the user tries to save a bookmark without entering a URL?
- What happens when the user tries to save a bookmark for a URL that already exists in their collection?
- What happens when the user closes the dialog while metadata is being fetched?
- What happens when the user loses internet connection during metadata fetch?
- What happens when the fetched metadata contains very long text (title or description exceeding character limits)?

## Requirements *(mandatory)*

### Functional Requirements

#### Dialog & UI
- **FR-001**: System MUST display a modal dialog when the user initiates "Add Bookmark" action
- **FR-002**: Dialog MUST include a URL input field that accepts valid HTTP/HTTPS URLs
- **FR-003**: Dialog MUST include a "Fetch Metadata" button that triggers metadata retrieval
- **FR-004**: Dialog MUST include a form with editable fields for title, description, image, and notes
- **FR-005**: Dialog MUST include "Save" and "Cancel" buttons for user actions
- **FR-006**: Dialog MUST be closable via "Cancel" button, "X" close button, or clicking outside the dialog

#### Metadata Fetching
- **FR-007**: System MUST validate the URL format before allowing metadata fetch
- **FR-008**: System MUST display a loading indicator while fetching metadata
- **FR-009**: System MUST call a metadata extraction API with the provided URL
- **FR-010**: System MUST populate the form fields with fetched metadata (title, description, thumbnail)
- **FR-011**: System MUST display an error message if metadata fetch fails
- **FR-012**: System MUST handle cases where metadata is partially or completely unavailable
- **FR-013**: System MUST fetch and display multiple images from the website when available (minimum 1, maximum 10)

#### Form Editing
- **FR-014**: Users MUST be able to edit the title field after metadata is fetched
- **FR-015**: Users MUST be able to edit the description field after metadata is fetched
- **FR-016**: Users MUST be able to add a personal note in a dedicated notes field
- **FR-017**: System MUST preserve user edits if they re-fetch metadata (with confirmation prompt)
- **FR-018**: Title field MUST have a character limit of 200 characters
- **FR-019**: Description field MUST have a character limit of 1000 characters
- **FR-020**: Notes field MUST have a character limit of 2000 characters

#### Image Selection
- **FR-021**: System MUST display the primary thumbnail from fetched metadata as the default image
- **FR-022**: Users MUST be able to select from multiple images fetched from the website
- **FR-023**: System MUST display image thumbnails in a selectable gallery format
- **FR-024**: Users MUST be able to upload a custom image from their device
- **FR-025**: System MUST support common image formats (JPEG, PNG, GIF, WebP)
- **FR-026**: System MUST enforce a maximum image file size of 5MB
- **FR-027**: Users MUST be able to provide a custom image via URL
- **FR-028**: System MUST validate custom image URLs and display preview before saving
- **FR-029**: System MUST provide a way to revert to the default fetched image after custom selection

#### Data Validation & Saving
- **FR-030**: System MUST validate that a URL is provided before allowing save
- **FR-031**: System MUST validate that a title is provided (either fetched or manually entered)
- **FR-032**: System MUST check for duplicate URLs in the user's existing bookmarks
- **FR-033**: System MUST display a confirmation if the URL already exists with option to save anyway
- **FR-034**: System MUST save the bookmark with all provided data (URL, title, description, image, notes)
- **FR-035**: System MUST close the dialog after successful bookmark creation
- **FR-036**: System MUST display a success notification after bookmark is saved
- **FR-037**: System MUST display error messages for validation failures

#### Error Handling
- **FR-038**: System MUST display user-friendly error messages for network failures
- **FR-039**: System MUST display user-friendly error messages for invalid URLs
- **FR-040**: System MUST display user-friendly error messages for image upload failures
- **FR-041**: System MUST allow users to retry metadata fetch after failure
- **FR-042**: System MUST allow users to manually enter bookmark data if metadata fetch fails

### Key Entities

- **Bookmark**: Represents a saved web link with metadata
  - URL (required): The web address being bookmarked
  - Title (required): Display name for the bookmark
  - Description (optional): Detailed description of the bookmark content
  - Image URL (optional): Thumbnail or preview image for the bookmark
  - Notes (optional): User's personal notes about the bookmark
  - Created Date: Timestamp when bookmark was created
  - User ID: Owner of the bookmark

- **Metadata**: Represents information extracted from a website
  - URL: The source website
  - Title: Page title from HTML metadata
  - Description: Page description from HTML metadata
  - Images: Array of image URLs found on the page
  - Primary Thumbnail: Main image representing the page
  - Favicon: Website icon

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a bookmark from URL to saved state in under 30 seconds (including metadata fetch time)
- **SC-002**: Metadata fetch completes successfully for 95% of valid URLs within 5 seconds
- **SC-003**: 90% of users successfully create their first bookmark without assistance or errors
- **SC-004**: Users can customize bookmark metadata (title, description, or image) before saving in 100% of cases
- **SC-005**: Dialog loads and becomes interactive within 500 milliseconds of user action
- **SC-006**: Image upload and preview completes within 3 seconds for files under 5MB
- **SC-007**: System gracefully handles and provides actionable error messages for 100% of failure scenarios
- **SC-008**: Users can save bookmarks with custom images (uploaded or URL) in 100% of attempts
- **SC-009**: 85% of users report the bookmark creation process as "easy" or "very easy" in usability testing
- **SC-010**: Dialog remains responsive and usable on mobile devices (screens 375px width and above)

### Assumptions

- Users have an active internet connection for metadata fetching
- The metadata extraction API is available and functional
- Users are authenticated before accessing the bookmark dialog
- The system has storage capacity for uploaded images
- Image hosting service is available for storing custom uploaded images
- Users understand what a URL is and can copy/paste or type URLs
- The bookmark collection has no hard limit on number of bookmarks per user
- Metadata fetch timeout is set to 10 seconds maximum
- Supported browsers include modern versions of Chrome, Firefox, Safari, and Edge
- Mobile support includes iOS Safari and Android Chrome

