import { TagRepository } from '@app/repositories';
import {
  Cascade,
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseEntityWithTenant } from './base-extend.entity';
import { BookmarkTagEntity } from './bookmark-tag.entity';
import { UserEntity } from './user.entity';

@Entity({ repository: () => TagRepository })
@Index({ properties: ['id'] })
@Index({ properties: ['name'] })
@Index({ properties: ['user', 'deleteFlag'] })
@Index({ properties: ['tenant', 'deleteFlag'] })
@Index({ properties: ['usageCount'] })
export class TagEntity extends BaseEntityWithTenant {
  @Property({ length: 100, unique: true })
  name: string;

  @Property({ nullable: true, length: 500 })
  description?: string;

  @Property({ default: 0 })
  usageCount: number = 0;

  @Property({ nullable: true, length: 50 })
  color?: string; // Hex color for UI display

  @Property({ nullable: true, length: 50 })
  category?: string; // Category for grouping tags

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ default: false })
  isSystem: boolean = false; // System-generated tags

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @OneToMany(() => BookmarkTagEntity, (bt) => bt.tag, {
    cascade: [Cascade.REMOVE],
  })
  bookmarkTags: BookmarkTagEntity[];

  [EntityRepositoryType]?: TagRepository;

  constructor({
    name,
    description,
    color,
    category,
    isSystem = false,
  }: {
    name: string;
    description?: string;
    color?: string;
    category?: string;
    isSystem?: boolean;
  }) {
    super();
    this.name = name.toLowerCase().trim(); // Normalize tag names
    this.description = description;
    this.color = color;
    this.category = category;
    this.isSystem = isSystem;
  }

  /**
   * Increment usage count when tag is used
   */
  incrementUsage(): void {
    this.usageCount++;
  }

  /**
   * Decrement usage count when tag is removed
   */
  decrementUsage(): void {
    if (this.usageCount > 0) {
      this.usageCount--;
    }
  }

  /**
   * Mark tag as inactive
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Mark tag as active
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Check if tag can be deleted (not system tag and no usage)
   */
  canBeDeleted(): boolean {
    return !this.isSystem && this.usageCount === 0;
  }

  /**
   * Get display name (capitalized)
   */
  getDisplayName(): string {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }

  /**
   * Get tag summary for API responses
   */
  getSummary(): {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    color?: string;
    category?: string;
    usageCount: number;
    isActive: boolean;
    isSystem: boolean;
  } {
    return {
      id: this.id,
      name: this.name,
      displayName: this.getDisplayName(),
      description: this.description,
      color: this.color,
      category: this.category,
      usageCount: this.usageCount,
      isActive: this.isActive,
      isSystem: this.isSystem,
    };
  }
}
