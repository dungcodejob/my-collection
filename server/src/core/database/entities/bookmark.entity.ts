import { BookmarkRepository } from '@app/repositories';
import {
  Collection,
  Entity,
  EntityRepositoryType,
  Filter,
  Index,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';

import { BaseEntityWithTenant } from './base-extend.entity';
import { BookmarkTagEntity } from './bookmark-tag.entity';
import { CollectionEntity } from './collection.entity';
import { UserEntity } from './user.entity';

@Entity({ repository: () => BookmarkRepository })
@Index({ properties: ['id'] })
@Index({ properties: ['user', 'deleteFlag'] })
@Index({ properties: ['tenant', 'deleteFlag'] })
@Index({ properties: ['url'] })
@Index({ properties: ['title'] })
@Index({ properties: ['collection'] })
@Index({ properties: ['user', 'url'] }) // For duplicate URL detection
@Filter({
  name: 'tenant',
  cond: (args) => ({ tenantId: args.tenantId }),
})
export class BookmarkEntity extends BaseEntityWithTenant {
  @Property({ length: 2048 })
  url: string;

  @Property({ length: 500 })
  title: string;

  @Property({ nullable: true, length: 1000 })
  description?: string;

  @Property({ nullable: true, length: 2048 })
  imageUrl?: string;

  @Property({ nullable: true, length: 2048 })
  faviconUrl?: string;

  @Property({ nullable: true, length: 100 })
  siteName?: string;

  @Property({ nullable: true, length: 50 })
  contentType?: string;

  @Property({ nullable: true, type: 'json' })
  metadata?: Record<string, any>;

  @OneToMany(() => BookmarkTagEntity, (bt) => bt.bookmark)
  bookmarkTags = new Collection<BookmarkTagEntity>(this);

  @Property({ nullable: true, type: 'json' })
  tags?: string[]; // Legacy field - kept for backward compatibility

  @Property({ nullable: true, type: 'text' })
  notes?: string;

  @Property({ default: false })
  isFavorite: boolean = false;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ nullable: true })
  visitCount: number = 0;

  @Property({ nullable: true })
  lastVisitedAt?: Date;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => CollectionEntity, { nullable: true })
  collection?: CollectionEntity;

  [EntityRepositoryType]?: BookmarkRepository;

  constructor({
    url,
    title,
    collection,
    description,
    imageUrl,
    faviconUrl,
    siteName,
    contentType,
    metadata,
    tags,
    notes,
  }: {
    url: string;
    title: string;

    collection?: CollectionEntity;
    description?: string;
    imageUrl?: string;
    faviconUrl?: string;
    siteName?: string;
    contentType?: string;
    metadata?: Record<string, any>;
    tags?: string[];
    notes?: string;
  }) {
    super();
    this.url = url;
    this.title = title;
    this.collection = collection;
    this.description = description;
    this.imageUrl = imageUrl;
    this.faviconUrl = faviconUrl;
    this.siteName = siteName;
    this.contentType = contentType;
    this.metadata = metadata;
    this.tags = tags;
    this.notes = notes;
  }

  /**
   * Mark bookmark as favorite
   */
  markAsFavorite(): void {
    this.isFavorite = true;
  }

  /**
   * Unmark bookmark as favorite
   */
  unmarkAsFavorite(): void {
    this.isFavorite = false;
  }

  /**
   * Increment visit count
   */
  incrementVisitCount(): void {
    this.visitCount = (this.visitCount || 0) + 1;
    this.lastVisitedAt = new Date();
  }

  /**
   * Check if bookmark is in collection
   */
  isInCollection(): boolean {
    return !!this.collection;
  }

  /**
   * Get tags as array from relationships
   */
  getTagsArray(): string[] {
    if (this.bookmarkTags && this.bookmarkTags.length > 0) {
      return this.bookmarkTags.map((bt) => bt.tag.name);
    }
    // Fallback to legacy tags field
    if (!this.tags || !Array.isArray(this.tags)) return [];
    return this.tags.filter((tag) => tag && tag.trim().length > 0);
  }

  /**
   * Set tags from array (legacy method)
   */
  setTagsFromArray(tags: string[]): void {
    this.tags = tags
      .filter((tag) => tag && tag.trim().length > 0)
      .map((tag) => tag.trim());
  }

  /**
   * Get tag names from relationships
   */
  getTagNames(): string[] {
    return this.getTagsArray();
  }

  /**
   * Get tag entities
   */
  getTagEntities(): BookmarkTagEntity[] {
    return this.bookmarkTags.getItems() || [];
  }

  /**
   * Check if bookmark has specific tag
   */
  hasTag(tagName: string): boolean {
    return this.getTagsArray().includes(tagName.toLowerCase());
  }

  /**
   * Get tag count
   */
  getTagCount(): number {
    return this.bookmarkTags
      ? this.bookmarkTags.length
      : this.tags
        ? this.tags.length
        : 0;
  }

  /**
   * Get bookmark summary
   */
  getSummary(): {
    id: string;
    url: string;
    title: string;
    description?: string;
    imageUrl?: string;
    isFavorite: boolean;
    visitCount: number;
    lastVisitedAt?: Date;
    tags: string[];
  } {
    return {
      id: this.id,
      url: this.url,
      title: this.title,
      description: this.description,
      imageUrl: this.imageUrl,
      isFavorite: this.isFavorite,
      visitCount: this.visitCount || 0,
      lastVisitedAt: this.lastVisitedAt,
      tags: this.getTagsArray(),
    };
  }
}
