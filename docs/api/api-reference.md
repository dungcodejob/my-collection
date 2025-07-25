# API Reference - Comprehensive API Documentation

## 📋 Overview

This document provides detailed information about all API endpoints of the My Collection application, including authentication, bookmarks, collections, tags, and user management.

## 🔗 Base URL

```
Development: http://localhost:3000/api
Staging: https://staging-api.my-collection.com/api
Production: https://api.my-collection.com/api
```

## 🔐 Authentication

### JWT Token Format

```typescript
interface JWTPayload {
  sub: string;        // User ID
  email: string;      // User email
  role: UserRole;     // User role
  iat: number;        // Issued at
  exp: number;        // Expires at
}
```

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

## 📚 Authentication Endpoints

### POST /auth/register

Register a new account.

**Request Body:**
```typescript
interface RegisterDto {
  email: string;          // Valid email
  password: string;       // Password (minimum 8 characters)
  firstName: string;      // First name
  lastName: string;       // Last name
  confirmPassword: string; // Password confirmation
}
```

**Response:**
```typescript
interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isEmailVerified: boolean;
    createdAt: string;
  };
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "confirmPassword": "password123"
  }'
```

### POST /auth/login

Log in to the system.

**Request Body:**
```typescript
interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

**Response:**
```typescript
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    lastLoginAt: string;
  };
  expiresIn: number;
}
```

### POST /auth/refresh

Refresh access token.

**Request Body:**
```typescript
interface RefreshTokenDto {
  refreshToken: string;
}
```

**Response:**
```typescript
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

### POST /auth/logout

Log out from the system.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
interface LogoutResponse {
  message: string;
}
```

### POST /auth/forgot-password

Request password reset.

**Request Body:**
```typescript
interface ForgotPasswordDto {
  email: string;
}
```

### POST /auth/reset-password

Reset password with token.

**Request Body:**
```typescript
interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
```

## 🔖 Bookmark Endpoints

### GET /bookmarks

Get list of bookmarks with pagination and filtering.

**Query Parameters:**
```typescript
interface BookmarkQuery {
  page?: number;          // Current page (default: 1)
  limit?: number;         // Items per page (default: 20, max: 100)
  search?: string;        // Search by title, description
  tags?: string[];        // Filter by tags
  collectionId?: string;  // Filter by collection
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'url';
  sortOrder?: 'asc' | 'desc';
  isPublic?: boolean;     // Filter public/private bookmarks
  isFavorite?: boolean;   // Filter favorite bookmarks
}
```

**Response:**
```typescript
interface BookmarkListResponse {
  data: Bookmark[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    search?: string;
    tags?: string[];
    collectionId?: string;
    isPublic?: boolean;
    isFavorite?: boolean;
  };
}
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/bookmarks?page=1&limit=10&search=javascript&tags=tutorial,programming" \
  -H "Authorization: Bearer <token>"
```

### GET /bookmarks/:id

Get detailed information of a bookmark.

**Response:**
```typescript
interface BookmarkDetailResponse {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  thumbnail?: string;
  isPublic: boolean;
  isFavorite: boolean;
  tags: Tag[];
  collection?: Collection;
  metadata: {
    siteName?: string;
    author?: string;
    publishedAt?: string;
    readingTime?: number;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  lastViewedAt?: string;
}
```

### POST /bookmarks

Create a new bookmark.

**Request Body:**
```typescript
interface CreateBookmarkDto {
  url: string;            // Valid URL
  title?: string;         // Auto-extracted if not provided
  description?: string;
  tags?: string[];        // Array of tag names
  collectionId?: string;  // Collection ID
  isPublic?: boolean;     // Default: false
  isFavorite?: boolean;   // Default: false
}
```

**Response:**
```typescript
interface CreateBookmarkResponse {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  thumbnail?: string;
  isPublic: boolean;
  isFavorite: boolean;
  tags: Tag[];
  collection?: Collection;
  createdAt: string;
  updatedAt: string;
}
```

### PUT /bookmarks/:id

Update a bookmark.

**Request Body:**
```typescript
interface UpdateBookmarkDto {
  title?: string;
  description?: string;
  tags?: string[];
  collectionId?: string;
  isPublic?: boolean;
  isFavorite?: boolean;
}
```

### DELETE /bookmarks/:id

Delete a bookmark.

**Response:**
```typescript
interface DeleteBookmarkResponse {
  message: string;
  deletedId: string;
}
```

### POST /bookmarks/bulk

Create multiple bookmarks at once.

**Request Body:**
```typescript
interface BulkCreateBookmarkDto {
  bookmarks: CreateBookmarkDto[];
  defaultCollectionId?: string;
  defaultTags?: string[];
  defaultIsPublic?: boolean;
}
```

### DELETE /bookmarks/bulk

Delete multiple bookmarks.

**Request Body:**
```typescript
interface BulkDeleteBookmarkDto {
  bookmarkIds: string[];
}
```

### POST /bookmarks/:id/duplicate

Duplicate a bookmark.

**Response:**
```typescript
interface DuplicateBookmarkResponse {
  original: Bookmark;
  duplicate: Bookmark;
}
```

### GET /bookmarks/:id/similar

Find similar bookmarks.

**Query Parameters:**
```typescript
interface SimilarBookmarkQuery {
  limit?: number;     // Default: 5
  threshold?: number; // Similarity threshold (0-1)
}
```

## 📁 Collection Endpoints

### GET /collections

Get list of collections.

**Query Parameters:**
```typescript
interface CollectionQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'bookmarkCount';
  sortOrder?: 'asc' | 'desc';
  isPublic?: boolean;
}
```

**Response:**
```typescript
interface CollectionListResponse {
  data: Collection[];
  meta: PaginationMeta;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic: boolean;
  bookmarkCount: number;
  tags: Tag[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### GET /collections/:id

Get detailed information of a collection.

**Response:**
```typescript
interface CollectionDetailResponse {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic: boolean;
  bookmarks: Bookmark[];
  tags: Tag[];
  statistics: {
    totalBookmarks: number;
    publicBookmarks: number;
    privateBookmarks: number;
    favoriteBookmarks: number;
    mostUsedTags: Array<{
      tag: Tag;
      count: number;
    }>;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### POST /collections

Create a new collection.

**Request Body:**
```typescript
interface CreateCollectionDto {
  name: string;           // Collection name (unique per user)
  description?: string;
  color?: string;         // Hex color code
  icon?: string;          // Icon name or emoji
  isPublic?: boolean;     // Default: false
}
```

### PUT /collections/:id

Update a collection.

**Request Body:**
```typescript
interface UpdateCollectionDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic?: boolean;
}
```

### DELETE /collections/:id

Delete a collection.

**Query Parameters:**
```typescript
interface DeleteCollectionQuery {
  moveBookmarksTo?: string; // Target collection ID for bookmarks
  deleteBookmarks?: boolean; // Also delete bookmarks (default: false)
}
```

### POST /collections/:id/bookmarks

Add bookmarks to collection.

**Request Body:**
```typescript
interface AddBookmarksToCollectionDto {
  bookmarkIds: string[];
}
```

### DELETE /collections/:id/bookmarks

Remove bookmarks from collection.

**Request Body:**
```typescript
interface RemoveBookmarksFromCollectionDto {
  bookmarkIds: string[];
}
```

### GET /collections/:id/export

Export collection.

**Query Parameters:**
```typescript
interface ExportCollectionQuery {
  format: 'json' | 'html' | 'csv';
  includePrivate?: boolean;
}
```

### POST /collections/import

Import collection.

**Request Body (multipart/form-data):**
```typescript
interface ImportCollectionDto {
  file: File;           // JSON, HTML, or CSV file
  collectionName?: string;
  mergeStrategy?: 'skip' | 'overwrite' | 'duplicate';
}
```

## 🏷️ Tag Endpoints

### GET /tags

Get list of tags.

**Query Parameters:**
```typescript
interface TagQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'usageCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  minUsage?: number;    // Filter tags with at least n bookmarks
}
```

**Response:**
```typescript
interface TagListResponse {
  data: Array<{
    id: string;
    name: string;
    color?: string;
    description?: string;
    usageCount: number;
    bookmarkCount: number;
    collectionCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
  meta: PaginationMeta;
  statistics: {
    totalTags: number;
    averageUsage: number;
    mostUsedTag: string;
    leastUsedTag: string;
  };
}
```

### GET /tags/:id

Get detailed information of a tag.

**Response:**
```typescript
interface TagDetailResponse {
  id: string;
  name: string;
  color?: string;
  description?: string;
  bookmarks: Bookmark[];
  collections: Collection[];
  relatedTags: Array<{
    tag: Tag;
    coOccurrenceCount: number;
  }>;
  statistics: {
    totalBookmarks: number;
    totalCollections: number;
    createdThisMonth: number;
    popularityTrend: Array<{
      date: string;
      count: number;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}
```

### POST /tags

Create a new tag.

**Request Body:**
```typescript
interface CreateTagDto {
  name: string;         // Tag name (unique per user)
  color?: string;       // Hex color code
  description?: string;
}
```

### PUT /tags/:id

Update a tag.

**Request Body:**
```typescript
interface UpdateTagDto {
  name?: string;
  color?: string;
  description?: string;
}
```

### DELETE /tags/:id

Delete a tag.

**Query Parameters:**
```typescript
interface DeleteTagQuery {
  removeFromBookmarks?: boolean; // Default: true
  removeFromCollections?: boolean; // Default: true
}
```

### POST /tags/merge

Merge multiple tags into one.

**Request Body:**
```typescript
interface MergeTagsDto {
  sourceTagIds: string[];  // Tags to be deleted
  targetTagId: string;     // Target tag
  newName?: string;        // New name for target tag
}
```

### GET /tags/suggestions

Get tag suggestions based on content.

**Query Parameters:**
```typescript
interface TagSuggestionQuery {
  url?: string;           // URL to analyze
  title?: string;         // Title to analyze
  description?: string;   // Description to analyze
  limit?: number;         // Number of suggestions (default: 5)
}
```

**Response:**
```typescript
interface TagSuggestionResponse {
  suggestions: Array<{
    name: string;
    confidence: number;   // 0-1
    source: 'content' | 'existing' | 'popular';
    existing?: boolean;   // Tag already exists
  }>;
}
```

## 👤 User Endpoints

### GET /users/profile

Get current user profile information.

**Response:**
```typescript
interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    emailNotifications: boolean;
    publicProfile: boolean;
    defaultBookmarkVisibility: 'public' | 'private';
  };
  statistics: {
    totalBookmarks: number;
    totalCollections: number;
    totalTags: number;
    publicBookmarks: number;
    favoriteBookmarks: number;
    joinedAt: string;
    lastActiveAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### PUT /users/profile

Update profile.

**Request Body:**
```typescript
interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  avatar?: string;      // Base64 or URL
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    timezone?: string;
    emailNotifications?: boolean;
    publicProfile?: boolean;
    defaultBookmarkVisibility?: 'public' | 'private';
  };
}
```

### POST /users/change-password

Change password.

**Request Body:**
```typescript
interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

### DELETE /users/account

Delete account.

**Request Body:**
```typescript
interface DeleteAccountDto {
  password: string;
  confirmation: string; // Must be "DELETE"
}
```

### GET /users/activity

Get activity history.

**Query Parameters:**
```typescript
interface ActivityQuery {
  page?: number;
  limit?: number;
  type?: 'bookmark' | 'collection' | 'tag' | 'login';
  startDate?: string;   // ISO date
  endDate?: string;     // ISO date
}
```

### GET /users/export

Export user data.

**Query Parameters:**
```typescript
interface ExportUserDataQuery {
  format: 'json' | 'zip';
  includeBookmarks?: boolean;
  includeCollections?: boolean;
  includeTags?: boolean;
  includeActivity?: boolean;
}
```

## 📊 Statistics Endpoints

### GET /stats/dashboard

Get overview statistics for dashboard.

**Response:**
```typescript
interface DashboardStatsResponse {
  overview: {
    totalBookmarks: number;
    totalCollections: number;
    totalTags: number;
    publicBookmarks: number;
    favoriteBookmarks: number;
  };
  recentActivity: Array<{
    type: 'bookmark' | 'collection' | 'tag';
    action: 'created' | 'updated' | 'deleted';
    item: {
      id: string;
      title: string;
      url?: string;
    };
    timestamp: string;
  }>;
  topTags: Array<{
    tag: Tag;
    count: number;
  }>;
  topCollections: Array<{
    collection: Collection;
    bookmarkCount: number;
  }>;
  trends: {
    bookmarksThisWeek: number;
    bookmarksLastWeek: number;
    collectionsThisWeek: number;
    collectionsLastWeek: number;
  };
}
```

### GET /stats/bookmarks

Detailed statistics about bookmarks.

**Query Parameters:**
```typescript
interface BookmarkStatsQuery {
  period?: 'week' | 'month' | 'year';
  groupBy?: 'day' | 'week' | 'month';
}
```

### GET /stats/tags

Statistics about tags.

**Response:**
```typescript
interface TagStatsResponse {
  totalTags: number;
  averageTagsPerBookmark: number;
  mostUsedTags: Array<{
    tag: Tag;
    count: number;
    percentage: number;
  }>;
  tagGrowth: Array<{
    date: string;
    count: number;
  }>;
  tagDistribution: Array<{
    range: string;      // "1-5", "6-10", etc.
    count: number;
  }>;
}
```

## 🔍 Search Endpoints

### GET /search

Search across the entire system.

**Query Parameters:**
```typescript
interface SearchQuery {
  q: string;              // Search query
  type?: 'all' | 'bookmarks' | 'collections' | 'tags';
  page?: number;
  limit?: number;
  filters?: {
    tags?: string[];
    collections?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    isPublic?: boolean;
    isFavorite?: boolean;
  };
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```typescript
interface SearchResponse {
  query: string;
  results: {
    bookmarks: {
      data: Bookmark[];
      total: number;
    };
    collections: {
      data: Collection[];
      total: number;
    };
    tags: {
      data: Tag[];
      total: number;
    };
  };
  suggestions: string[];
  meta: {
    totalResults: number;
    searchTime: number;   // milliseconds
    page: number;
    limit: number;
  };
}
```

### GET /search/suggestions

Search suggestions.

**Query Parameters:**
```typescript
interface SearchSuggestionQuery {
  q: string;              // Partial query
  limit?: number;         // Default: 5
}
```

## 📤 Import/Export Endpoints

### POST /import/bookmarks

Import bookmarks from file.

**Request Body (multipart/form-data):**
```typescript
interface ImportBookmarksDto {
  file: File;             // HTML, JSON, CSV file
  source?: 'chrome' | 'firefox' | 'safari' | 'edge' | 'generic';
  options?: {
    skipDuplicates?: boolean;
    defaultCollection?: string;
    defaultTags?: string[];
    makePublic?: boolean;
  };
}
```

**Response:**
```typescript
interface ImportBookmarksResponse {
  summary: {
    total: number;
    imported: number;
    skipped: number;
    failed: number;
  };
  details: {
    imported: Array<{
      title: string;
      url: string;
      status: 'success';
    }>;
    skipped: Array<{
      title: string;
      url: string;
      reason: string;
    }>;
    failed: Array<{
      title: string;
      url: string;
      error: string;
    }>;
  };
}
```

### GET /export/bookmarks

Export bookmarks.

**Query Parameters:**
```typescript
interface ExportBookmarksQuery {
  format: 'html' | 'json' | 'csv';
  collections?: string[];  // Specific collections
  tags?: string[];         // Specific tags
  includePrivate?: boolean;
  includeMetadata?: boolean;
}
```

## 🔔 Notification Endpoints

### GET /notifications

Get list of notifications.

**Query Parameters:**
```typescript
interface NotificationQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: 'info' | 'warning' | 'error' | 'success';
}
```

### PUT /notifications/:id/read

Mark notification as read.

### PUT /notifications/read-all

Mark all notifications as read.

### DELETE /notifications/:id

Delete notification.

## ⚙️ Admin Endpoints

### GET /admin/users

Manage users (Admin only).

**Query Parameters:**
```typescript
interface AdminUserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: 'active' | 'inactive' | 'banned';
  sortBy?: 'createdAt' | 'lastLoginAt' | 'email';
}
```

### PUT /admin/users/:id/role

Change user role.

**Request Body:**
```typescript
interface ChangeUserRoleDto {
  role: UserRole;
  reason?: string;
}
```

### PUT /admin/users/:id/status

Change user status.

**Request Body:**
```typescript
interface ChangeUserStatusDto {
  status: 'active' | 'inactive' | 'banned';
  reason?: string;
  duration?: number;    // Ban duration in days
}
```

### GET /admin/stats

System statistics (Admin only).

**Response:**
```typescript
interface AdminStatsResponse {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    byRole: Record<UserRole, number>;
  };
  content: {
    totalBookmarks: number;
    totalCollections: number;
    totalTags: number;
    publicBookmarks: number;
    privateBookmarks: number;
  };
  system: {
    uptime: number;
    memoryUsage: number;
    diskUsage: number;
    apiCalls: number;
    errorRate: number;
  };
}
```

## 🚨 Error Responses

### Standard Error Format

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  details?: any;
}
```

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Validation Error Example

```json
{
  "statusCode": 422,
  "message": [
    "email must be a valid email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Unprocessable Entity",
  "timestamp": "2024-12-19T10:30:00.000Z",
  "path": "/api/auth/register"
}
```

## 📝 Rate Limiting

### Default Limits

| Endpoint Category | Requests per Minute |
|------------------|-------------------|
| Authentication | 5 |
| General API | 100 |
| Search | 30 |
| Import/Export | 5 |
| File Upload | 10 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## 🔄 Pagination

### Standard Pagination Response

```typescript
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

### Pagination Links

```typescript
interface PaginationLinks {
  first: string;
  previous?: string;
  next?: string;
  last: string;
}
```

## 📊 Response Caching

### Cache Headers

```http
Cache-Control: public, max-age=300
ETag: "abc123"
Last-Modified: Wed, 19 Dec 2024 10:30:00 GMT
```

### Cacheable Endpoints

- `GET /bookmarks` (5 minutes)
- `GET /collections` (5 minutes)
- `GET /tags` (10 minutes)
- `GET /stats/*` (15 minutes)

## 🔐 Security Headers

### Required Headers

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## 📱 API Versioning

### Current Version: v1

```
Base URL: /api/v1/
```

### Version Headers

```http
Accept: application/vnd.my-collection.v1+json
API-Version: 1.0
```

---

**Last updated**: 2024-12-19  
**API Version**: 1.0.0  
**Author**: My Collection Team