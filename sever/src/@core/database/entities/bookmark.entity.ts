import { BookmarkRepository } from '@app/repositories';
import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { CollectionEntity } from './collection.entity';
import { UserEntity } from './user.entity';

@Entity({ repository: () => BookmarkRepository })
@Index({ properties: ['id'] })
@Index({ properties: ['user', 'deleteFlag'] })
@Index({ properties: ['url'] })
@Index({ properties: ['title'] })
@Index({ properties: ['collection'] })
export class BookmarkEntity extends BaseEntity {
  @Property({ length: 2048 })
  url: string;

  @Property({ length: 500 })
  title: string;

  @Property({ nullable: true, length: 1000 })
  description?: string;

  @Property({ nullable: true, length: 2048 })
  imageUrl?: string;

  @Property({ nullable: true, length: 100 })
  siteName?: string;

  @Property({ nullable: true, length: 50 })
  contentType?: string;

  @Property({ nullable: true, type: 'json' })
  metadata?: Record<string, any>;

  @Property({ nullable: true, type: 'json' })
  tags?: string[]; // Array of tags stored as JSON

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
    user,
    collection,
    description,
    imageUrl,
    siteName,
    contentType,
    metadata,
    tags,
    notes,
  }: {
    url: string;
    title: string;
    user: UserEntity;
    collection?: CollectionEntity;
    description?: string;
    imageUrl?: string;
    siteName?: string;
    contentType?: string;
    metadata?: Record<string, any>;
    tags?: string[];
    notes?: string;
  }) {
    super();
    this.url = url;
    this.title = title;
    this.user = user;
    this.collection = collection;
    this.description = description;
    this.imageUrl = imageUrl;
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
   * Get tags as array
   */
  getTagsArray(): string[] {
    if (!this.tags || !Array.isArray(this.tags)) return [];
    return this.tags.filter((tag) => tag && tag.trim().length > 0);
  }

  /**
   * Set tags from array
   */
  setTagsFromArray(tags: string[]): void {
    this.tags = tags
      .filter((tag) => tag && tag.trim().length > 0)
      .map((tag) => tag.trim());
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
