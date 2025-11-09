# Data Model: Bookmark Collection Browser

**Feature**: 001-bookmark-browser | **Date**: 2025-11-09  
**Purpose**: Define entities, relationships, and validation rules

## Overview

This document defines the data structures for the Bookmark Collection Browser feature. It covers database entities, TypeScript interfaces, DTOs, and validation rules derived from functional requirements.

---

## Database Entities

### Bookmark Entity

**Table**: `bookmarks`  
**Description**: Represents a saved web resource with metadata and associations

```typescript
import { Entity, Property, ManyToOne, Index } from '@mikro-orm/core';
import { Collection } from './collection.entity';
import { User } from '../users/user.entity';

@Entity()
@Index({ properties: ['collectionId', 'createdAt'] })
@Index({ properties: ['collectionId', 'title'] })
@Index({ properties: ['tags'], type: 'gin' }) // PostgreSQL GIN index for array queries
export class Bookmark {
  @Property({ primary: true })
  id!: string; // UUID

  @ManyToOne(() => Collection)
  collection!: Collection;

  @Property()
  collectionId!: string; // Foreign key

  @Property({ length: 500 })
  title!: string;

  @Property({ length: 2048 })
  url!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ type: 'array' })
  tags: string[] = []; // PostgreSQL text array

  @Property()
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  lastModifiedAt!: Date;

  @Property({ nullable: true, length: 2048 })
  thumbnailUrl?: string;

  @Property({ default: false })
  isFavorite: boolean = false;

  @Property({ default: false })
  hasImage: boolean = false; // Computed or set on save

  // Virtual property for owner check (via collection)
  get ownerId(): string {
    return this.collection.ownerId;
  }
}
```

**Indexes**:
- Primary key: `id` (UUID)
- Composite: `(collectionId, createdAt)` for paginated queries sorted by date
- Composite: `(collectionId, title)` for alphabetical sorting
- GIN: `tags` for fast array containment/overlap queries

**Constraints**:
- `url` must be valid HTTP/HTTPS URL (validated in DTO)
- `title` required, max 500 characters
- `tags` array elements must be non-empty, lowercase, max 50 chars each
- `collectionId` foreign key with CASCADE delete

**Validation Rules** (from requirements):
- FR-005: Must have title, URL, creation date
- FR-018: Tags must support array queries for filtering
- FR-029: Must support sorting by createdAt, title, lastModifiedAt, url

---

### Collection Entity

**Table**: `collections`  
**Description**: Groups bookmarks by theme or project, owned by a single user

```typescript
import { Entity, Property, ManyToOne, OneToMany, Collection as MikroCollection } from '@mikro-orm/core';
import { Bookmark } from './bookmark.entity';
import { User } from '../users/user.entity';

@Entity()
export class Collection {
  @Property({ primary: true })
  id!: string; // UUID

  @Property({ length: 200 })
  name!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => User)
  owner!: User;

  @Property()
  ownerId!: string; // Foreign key

  @Property()
  createdAt!: Date;

  @OneToMany(() => Bookmark, bookmark => bookmark.collection)
  bookmarks = new MikroCollection<Bookmark>(this);

  // Computed property (can be calculated or cached)
  @Property({ persist: false })
  bookmarkCount?: number;
}
```

**Indexes**:
- Primary key: `id` (UUID)
- Foreign key: `ownerId` (for user's collections query)

**Constraints**:
- `name` required, max 200 characters
- `ownerId` foreign key with CASCADE delete
- Owner verification required before any operation (FR-001)

**Validation Rules**:
- FR-001: Must verify authenticated user is owner before displaying bookmarks
- Owner-only access model (per clarification Q2)

---

## TypeScript Interfaces (Frontend)

### Bookmark Model

```typescript
export interface Bookmark {
  id: string;
  collectionId: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  createdAt: Date;
  lastModifiedAt: Date;
  thumbnailUrl?: string;
  isFavorite: boolean;
  hasImage: boolean;
}
```

### Collection Model

```typescript
export interface Collection {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  bookmarkCount: number;
}
```

### View State Model

```typescript
export type DisplayMode = 'list' | 'card' | 'moodboard';
export type TagFilterMode = 'and' | 'or';

export interface ViewState {
  // Filters (array of active filters)
  filters: ParsedFilter[];
  
  // Sort
  sort: Sort | null;
  
  // Pagination
  page: number;
  pageSize: number; // 20 for list/card, 30 for moodboard
  
  // Display mode
  displayMode: DisplayMode;
  
  // Tag filter mode
  tagFilterMode: TagFilterMode;
  
  // Selection (session-based, not persisted)
  selectedBookmarkIds: string[];
  
  // Loading state
  isLoading: boolean;
  loadingMessage: string | null;
  canCancel: boolean;
  
  // Error state
  error: string | null;
}
```

### Filter Models

```typescript
export type FilterType = 'keyword' | 'number' | 'range' | 'daterange' | 'boolean' | 'tags';

export interface KeywordFilter {
  field: string;
  type: 'keyword';
  value: string;
}

export interface NumberFilter {
  field: string;
  type: 'number';
  value: number;
}

export interface RangeFilter {
  field: string;
  type: 'range';
  value: {
    min?: number;
    max?: number;
  };
}

export interface DateRangeFilter {
  field: string;
  type: 'daterange';
  value: {
    min?: Date;
    max?: Date;
  };
}

export interface BooleanFilter {
  field: string;
  type: 'boolean';
  value: boolean;
}

export type ParsedFilter =
  | KeywordFilter
  | NumberFilter
  | RangeFilter
  | DateRangeFilter
  | BooleanFilter;

export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}
```

### Filter Definition (Registry)

```typescript
export interface FilterDefinition<T = any> {
  id: string;
  field: string;
  label: string;
  type: FilterType;
  component: Type<any>; // Angular component
  defaultValue?: T;
  serialize: (value: T) => string;
  deserialize: (raw: string) => T;
  validate?: (value: T) => boolean;
  config?: Record<string, any>;
}
```

---

## DTOs (Data Transfer Objects)

### Backend DTOs

#### BookmarkQueryDto

**Purpose**: Query parameters for GET /api/v1/collections/:id/bookmarks

```typescript
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ParseFilters, ParsedFilter } from '../../shared/decorators/parse-filters.decorator';
import { ParseSort, Sort } from '../../shared/decorators/parse-sorts.decorator';

export class BookmarkQueryDto {
  @ApiProperty({ 
    description: 'Page number (1-based)', 
    minimum: 1, 
    default: 1,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({ 
    description: 'Items per page', 
    minimum: 1, 
    maximum: 100, 
    default: 20,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  @ApiProperty({
    description: 'Filters in format field:type:value',
    required: false,
    isArray: true,
    example: ['title:keyword:react', 'created:daterange:2024-01-01_2024-12-31']
  })
  @ParseFilters()
  filters?: ParsedFilter[];

  @ApiProperty({
    description: 'Sort in format field:direction',
    required: false,
    isArray: true,
    example: ['created:desc']
  })
  @ParseSort()
  sort?: Sort[];

  @ApiProperty({
    description: 'Tag filter mode: and (all tags) or or (any tag)',
    enum: ['and', 'or'],
    default: 'or',
    required: false
  })
  @IsOptional()
  tagMode: 'and' | 'or' = 'or';
}
```

#### BookmarkResponseDto

**Purpose**: Response shape for bookmark queries

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class BookmarkDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  collectionId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  lastModifiedAt: Date;

  @ApiProperty({ required: false })
  thumbnailUrl?: string;

  @ApiProperty()
  isFavorite: boolean;

  @ApiProperty()
  hasImage: boolean;
}

export class BookmarkListResponseDto {
  @ApiProperty({ type: [BookmarkDto] })
  bookmarks: BookmarkDto[];

  @ApiProperty({ description: 'Total number of bookmarks matching filters' })
  totalCount: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  pageSize: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPrevious: boolean;
}
```

#### BulkDeleteDto

**Purpose**: Request body for bulk delete operation

```typescript
import { IsArray, IsUUID, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteDto {
  @ApiProperty({
    description: 'Array of bookmark IDs to delete',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001']
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100) // Prevent abuse
  @IsUUID('4', { each: true })
  bookmarkIds: string[];
}

export class BulkDeleteResponseDto {
  @ApiProperty({ description: 'Number of bookmarks deleted' })
  deletedCount: number;

  @ApiProperty({ description: 'IDs of deleted bookmarks', type: [String] })
  deletedIds: string[];
}
```

---

## Validation Rules

### Bookmark Validation

**Field Constraints**:
```typescript
export const BookmarkValidation = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 500,
    message: 'Title must be between 1 and 500 characters'
  },
  url: {
    required: true,
    pattern: /^https?:\/\/.+/,
    maxLength: 2048,
    message: 'Must be a valid HTTP or HTTPS URL'
  },
  description: {
    required: false,
    maxLength: 5000,
    message: 'Description cannot exceed 5000 characters'
  },
  tags: {
    maxItems: 50,
    itemMinLength: 1,
    itemMaxLength: 50,
    pattern: /^[a-z0-9-]+$/, // lowercase, numbers, hyphens only
    message: 'Tags must be lowercase alphanumeric with hyphens'
  },
  thumbnailUrl: {
    required: false,
    pattern: /^https?:\/\/.+/,
    maxLength: 2048,
    message: 'Must be a valid HTTP or HTTPS URL'
  }
};
```

### Filter Validation

**Filter Format** (enforced by existing decorator):
```
field:type:value

Examples:
- title:keyword:react
- created:daterange:2024-01-01_2024-12-31
- rating:range:3-5
- isFavorite:boolean:true
- tags:keyword:work
```

**Validation Rules**:
- Field name must match entity property
- Type must be supported: keyword, number, range, daterange, boolean
- Value format must match type (handled by `parse-filters.decorator.ts`)

### Sort Validation

**Sort Format** (enforced by existing decorator):
```
field:direction

Examples:
- created:desc
- title:asc
- lastModified:desc
```

**Validation Rules**:
- Field must be sortable (createdAt, title, lastModifiedAt, url per FR-029)
- Direction must be 'asc' or 'desc'

---

## Relationships

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ owns
       │ 1:N
       ▼
┌─────────────┐
│ Collection  │
└──────┬──────┘
       │ contains
       │ 1:N
       ▼
┌─────────────┐
│  Bookmark   │
└─────────────┘
```

### Access Control

**Authorization Rules**:
1. **Collection Access** (FR-001):
   - User must be authenticated
   - User.id must equal Collection.ownerId
   - Enforced by `CollectionOwnerGuard`

2. **Bookmark Operations**:
   - Bookmark access requires collection access (transitive)
   - Bulk delete verifies all bookmark IDs belong to user's collections
   - Enforced by `BookmarkOwnerGuard`

**Guard Implementation**:
```typescript
@Injectable()
export class CollectionOwnerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // From JWT auth
    const collectionId = request.params.collectionId;
    
    const collection = await this.collectionsService.findOne(collectionId);
    
    if (!collection || collection.ownerId !== user.id) {
      throw new ForbiddenException('You do not have access to this collection');
    }
    
    return true;
  }
}
```

---

## State Transitions

### Bookmark Lifecycle

```
┌─────────────┐
│   Created   │ ─────────────┐
└──────┬──────┘              │
       │                     │
       │ update              │ bulk delete
       │                     │
       ▼                     │
┌─────────────┐              │
│   Updated   │              │
└──────┬──────┘              │
       │                     │
       │ modify              │
       │                     │
       └─────────────────────┤
                             │
                             ▼
                      ┌─────────────┐
                      │   Deleted   │
                      └─────────────┘
```

**State Rules**:
- Bookmarks don't have explicit state field (no soft delete in v1)
- `lastModifiedAt` updated on any field change
- Deletion is permanent (hard delete)
- Selection state is transient (UI only, not persisted)

### View State Transitions

```
┌──────────────┐
│   Default    │ ← Initial state (no filters, page 1, list mode)
└──────┬───────┘
       │
       ├──> Apply Filter ──> Filtered View (reset to page 1)
       │
       ├──> Change Sort ──> Sorted View (maintain page)
       │
       ├──> Navigate Page ──> Paginated View
       │
       ├──> Switch Mode ──> Mode View (maintain state)
       │
       ├──> Select Bookmarks ──> Selection Active
       │
       └──> URL Change ──> Restore State (from URL params)
```

**Transition Rules** (from FR-016, FR-032, FR-036):
- Filter application → Reset to page 1 (if current page > total pages)
- Sort change → Maintain current page
- Mode switch → Preserve all state (filters, sort, page, selection)
- Selection → Prune invalid IDs when filters change
- URL change → Restore complete view state

---

## Data Constraints Summary

**Scalability** (from Success Criteria & Assumptions):
- Collections: Optimized for up to 1000 bookmarks
- Filters: Support 15-20 simultaneous filters (URL length ~2000 chars)
- Selection: Handle 50+ selected bookmarks efficiently
- Page size: 20 (list/card), 30 (moodboard)

**Performance** (from Success Criteria):
- Database queries: < 100ms simple, < 500ms complex
- Index coverage for all filter and sort fields
- Pagination offsets cached where possible

**Integrity**:
- Foreign key constraints enforced
- Cascade deletes for collection → bookmarks
- Transaction isolation for bulk operations
- Validation at DTO and entity layers

---

## Migration Scripts

### Initial Schema

```sql
-- Collections table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT collections_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX idx_collections_owner ON collections(owner_id);

-- Bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_modified_at TIMESTAMP NOT NULL DEFAULT NOW(),
  thumbnail_url VARCHAR(2048),
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  has_image BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT bookmarks_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT bookmarks_url_format CHECK (url ~ '^https?://.+')
);

CREATE INDEX idx_bookmarks_collection_created ON bookmarks(collection_id, created_at DESC);
CREATE INDEX idx_bookmarks_collection_title ON bookmarks(collection_id, title);
CREATE INDEX idx_bookmarks_tags ON bookmarks USING GIN(tags);

-- Trigger for auto-updating last_modified_at
CREATE OR REPLACE FUNCTION update_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookmarks_last_modified
  BEFORE UPDATE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_last_modified();
```

---

## References

- [Feature Specification](./spec.md)
- [Technical Research](./research.md)
- [Implementation Plan](./plan.md)
- [MikroORM Documentation](https://mikro-orm.io/)
- [class-validator Documentation](https://github.com/typestack/class-validator)

---

**Data Model Status**: ✅ Complete  
**Next**: API Contracts (contracts/api.yaml)

