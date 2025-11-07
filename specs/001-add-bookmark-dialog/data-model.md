# Data Model: Add Bookmark Dialog

**Feature**: 001-add-bookmark-dialog  
**Date**: 2025-01-06  
**Phase**: 1 - Design

## Overview

This document defines the data structures, entities, and relationships for the Add Bookmark Dialog feature.

## Entities

### 1. Bookmark (Extended)

**Description**: Represents a user's saved web bookmark with metadata

**Table**: `bookmarks`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → users(id) | Owner of the bookmark |
| `url` | VARCHAR(2048) | NOT NULL | The bookmarked web address |
| `title` | VARCHAR(200) | NOT NULL | Display name for the bookmark |
| `description` | TEXT | NULLABLE | Detailed description (max 1000 chars) |
| `image_url` | VARCHAR(2048) | NULLABLE | Thumbnail or preview image URL |
| `notes` | TEXT | NULLABLE | User's personal notes (max 2000 chars) |
| `favicon_url` | VARCHAR(2048) | NULLABLE | Website favicon URL |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |
| `collection_id` | UUID | NULLABLE, FOREIGN KEY → collections(id) | Parent collection (if any) |

**Indexes**:
- `idx_bookmarks_user_id` on `user_id`
- `idx_bookmarks_url` on `url`
- `idx_bookmarks_user_url` on `(user_id, url)` - For duplicate detection
- `idx_bookmarks_created_at` on `created_at` - For sorting

**Constraints**:
- `UNIQUE (user_id, url)` - Prevent exact duplicates per user (soft constraint, allow override)
- `CHECK (LENGTH(title) <= 200)`
- `CHECK (LENGTH(description) <= 1000)`
- `CHECK (LENGTH(notes) <= 2000)`

**Relationships**:
- `user_id` → `users.id` (Many-to-One)
- `collection_id` → `collections.id` (Many-to-One, optional)

**New Fields for This Feature**:
- `notes`: User's personal notes about the bookmark
- `favicon_url`: Website favicon for better visual identification

---

### 2. Metadata (Transient)

**Description**: Temporary structure for website metadata extraction (not persisted)

**Type**: DTO (Data Transfer Object)

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | Source website URL |
| `title` | string | Yes | Page title (from meta tags or `<title>`) |
| `description` | string | No | Page description (from meta tags) |
| `images` | string[] | No | Array of image URLs found on the page (max 10) |
| `primaryImage` | string | No | Main/featured image (og:image or first large image) |
| `favicon` | string | No | Website favicon URL |
| `siteName` | string | No | Website name (from og:site_name) |
| `author` | string | No | Content author (from meta tags) |
| `publishedDate` | string | No | Publication date (ISO 8601 format) |

**Validation Rules**:
- `url`: Must be valid HTTP/HTTPS URL
- `title`: Max 500 characters (will be truncated to 200 on save)
- `description`: Max 2000 characters (will be truncated to 1000 on save)
- `images`: Each URL must be valid, max 10 items
- All image URLs must be accessible (return 200 status)

**Source Priority** (for extraction):
1. Open Graph tags (`og:title`, `og:description`, `og:image`)
2. Twitter Card tags (`twitter:title`, `twitter:description`, `twitter:image`)
3. Standard meta tags (`<meta name="description">`)
4. HTML elements (`<title>`, `<h1>`, first `<p>`)

---

### 3. ImageUpload (Transient)

**Description**: Temporary structure for image upload process (not persisted)

**Type**: DTO (Data Transfer Object)

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File/Blob | Yes | Image file from user's device |
| `filename` | string | Yes | Original filename |
| `mimeType` | string | Yes | File MIME type (image/jpeg, image/png, etc.) |
| `size` | number | Yes | File size in bytes |
| `presignedUrl` | string | No | Generated presigned URL for upload |
| `finalUrl` | string | No | Final CDN URL after successful upload |

**Validation Rules**:
- `mimeType`: Must be one of: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- `size`: Must be ≤ 5MB (5,242,880 bytes)
- `filename`: Sanitize to prevent path traversal attacks
- Image dimensions: Max 1920x1080 pixels (will be resized if larger)

**Upload Flow**:
1. Client validates file (type, size)
2. Client requests presigned URL from server
3. Server generates presigned URL (15-minute expiration)
4. Client uploads directly to cloud storage
5. Server receives confirmation and returns final CDN URL
6. Client updates bookmark with final URL

---

## DTOs (Data Transfer Objects)

### CreateBookmarkDto

**Purpose**: Request payload for creating a new bookmark

```typescript
interface CreateBookmarkDto {
  url: string;                    // Required, max 2048 chars
  title: string;                  // Required, max 200 chars
  description?: string;           // Optional, max 1000 chars
  imageUrl?: string;              // Optional, max 2048 chars
  notes?: string;                 // Optional, max 2000 chars
  faviconUrl?: string;            // Optional, max 2048 chars
  collectionId?: string;          // Optional, UUID
}
```

**Validation**:
- `url`: Must be valid HTTP/HTTPS URL, required
- `title`: Non-empty string, max 200 chars, required
- `description`: Max 1000 chars if provided
- `imageUrl`: Valid URL if provided
- `notes`: Max 2000 chars if provided
- `collectionId`: Valid UUID if provided

---

### BookmarkResponseDto

**Purpose**: Response payload for bookmark operations

```typescript
interface BookmarkResponseDto {
  id: string;                     // UUID
  userId: string;                 // UUID
  url: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  notes: string | null;
  faviconUrl: string | null;
  createdAt: string;              // ISO 8601 timestamp
  updatedAt: string;              // ISO 8601 timestamp
  collectionId: string | null;    // UUID or null
}
```

---

### MetadataRequestDto

**Purpose**: Request payload for fetching website metadata

```typescript
interface MetadataRequestDto {
  url: string;                    // Required, must be valid HTTP/HTTPS URL
}
```

**Validation**:
- `url`: Must be valid HTTP/HTTPS URL, required
- URL must be accessible (not localhost, not private IP)

---

### MetadataResponseDto

**Purpose**: Response payload for metadata extraction

```typescript
interface MetadataResponseDto {
  url: string;
  title: string;
  description: string | null;
  images: string[];               // Array of image URLs (max 10)
  primaryImage: string | null;
  favicon: string | null;
  siteName: string | null;
  author: string | null;
  publishedDate: string | null;   // ISO 8601 format
}
```

---

### DuplicateCheckResponseDto

**Purpose**: Response for duplicate URL check

```typescript
interface DuplicateCheckResponseDto {
  exists: boolean;
  bookmark: {
    id: string;
    title: string;
    createdAt: string;
    imageUrl: string | null;
  } | null;
}
```

---

### ImageUploadRequestDto

**Purpose**: Request for presigned URL generation

```typescript
interface ImageUploadRequestDto {
  filename: string;
  mimeType: string;
  size: number;
}
```

**Validation**:
- `filename`: Non-empty, sanitized
- `mimeType`: Must be in whitelist (image/jpeg, image/png, image/gif, image/webp)
- `size`: Must be ≤ 5MB

---

### ImageUploadResponseDto

**Purpose**: Response with presigned URL

```typescript
interface ImageUploadResponseDto {
  presignedUrl: string;           // URL for direct upload
  expiresIn: number;              // Seconds until expiration (900 = 15 min)
  finalUrl: string;               // Final CDN URL (after upload)
}
```

---

## State Management (Frontend)

### AddBookmarkDialogState

**Purpose**: NgRx Signals store state for the dialog

```typescript
interface AddBookmarkDialogState {
  // Form Data
  url: string;
  title: string;
  description: string;
  notes: string;
  selectedImageUrl: string | null;
  
  // Metadata
  metadata: MetadataResponseDto | null;
  availableImages: string[];
  
  // UI State
  isOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isUploadingImage: boolean;
  
  // Validation
  urlError: string | null;
  titleError: string | null;
  imageError: string | null;
  
  // Duplicate Check
  duplicateBookmark: DuplicateCheckResponseDto | null;
  showDuplicateConfirmation: boolean;
  
  // Error Handling
  error: string | null;
}
```

**Computed Signals**:
- `isValid`: `url && title && !urlError && !titleError`
- `hasChanges`: Compare current form data with initial state
- `canSave`: `isValid && !isLoading && !isSaving`
- `imageGallery`: Filter and format available images

---

## Validation Rules Summary

### URL Validation
- Must start with `http://` or `https://`
- Must be valid URL format (RFC 3986)
- Must not be localhost or private IP (127.0.0.1, 192.168.x.x, 10.x.x.x)
- Max length: 2048 characters

### Title Validation
- Required field
- Min length: 1 character
- Max length: 200 characters
- Trim whitespace

### Description Validation
- Optional field
- Max length: 1000 characters
- Trim whitespace

### Notes Validation
- Optional field
- Max length: 2000 characters
- Trim whitespace

### Image URL Validation
- Optional field
- Must be valid HTTP/HTTPS URL
- Must return 200 status code
- Must have image MIME type
- Max length: 2048 characters

### Image File Validation
- File type: JPEG, PNG, GIF, WebP only
- Max size: 5MB (5,242,880 bytes)
- Max dimensions: 1920x1080 pixels (auto-resize if larger)
- Scan for malware before upload

---

## Database Migrations

### Migration: Add Notes and Favicon to Bookmarks

```sql
-- Add new columns to bookmarks table
ALTER TABLE bookmarks
ADD COLUMN notes TEXT,
ADD COLUMN favicon_url VARCHAR(2048);

-- Add check constraints
ALTER TABLE bookmarks
ADD CONSTRAINT chk_notes_length CHECK (LENGTH(notes) <= 2000);

-- Update indexes for duplicate detection
CREATE INDEX CONCURRENTLY idx_bookmarks_user_url 
ON bookmarks(user_id, url);

-- Add comments for documentation
COMMENT ON COLUMN bookmarks.notes IS 'User personal notes about the bookmark (max 2000 chars)';
COMMENT ON COLUMN bookmarks.favicon_url IS 'Website favicon URL for visual identification';
```

---

## Summary

**New Entities**: None (extending existing Bookmark entity)  
**Modified Entities**: Bookmark (added `notes`, `favicon_url` fields)  
**DTOs Created**: 7 (CreateBookmark, BookmarkResponse, MetadataRequest, MetadataResponse, DuplicateCheck, ImageUploadRequest, ImageUploadResponse)  
**Indexes Added**: 1 composite index for duplicate detection  
**Validation Rules**: Comprehensive validation for all user inputs

**Next Phase**: Proceed to create API contracts (OpenAPI specifications).

