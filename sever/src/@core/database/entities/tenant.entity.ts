import { TenantRepository } from '@app/repositories';
import {
  Collection,
  Entity,
  Enum,
  Index,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export enum TenantPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

@Entity({ repository: () => TenantRepository })
@Index({ properties: ['id'] })
@Index({ properties: ['slug'] })
@Index({ properties: ['status'] })
@Index({ properties: ['plan'] })
export class TenantEntity extends BaseEntity {
  @Property({ length: 100 })
  name: string;

  @Property({ length: 50, unique: true })
  slug: string; // URL-friendly identifier

  @Property({ nullable: true, length: 500 })
  description?: string;

  @Enum(() => TenantStatus)
  status: TenantStatus = TenantStatus.ACTIVE;

  @Enum(() => TenantPlan)
  plan: TenantPlan = TenantPlan.FREE;

  @Property({ nullable: true, length: 2048 })
  logoUrl?: string;

  @Property({ nullable: true, length: 7 })
  primaryColor?: string; // Hex color for branding

  @Property({ nullable: true, type: 'json' })
  settings?: Record<string, any>; // Tenant-specific settings

  @Property({ nullable: true, type: 'json' })
  limits?: {
    maxBookmarks?: number;
    maxCollections?: number;
    maxTags?: number;
    maxStorage?: number; // in MB
  };

  @Property({ nullable: true, type: 'json' })
  usage?: {
    bookmarkCount?: number;
    collectionCount?: number;
    tagCount?: number;
    storageUsed?: number; // in MB
  };

  @Property({ nullable: true })
  subscriptionExpiresAt?: Date;

  @Property({ default: true })
  isActive: boolean = true;

  // @ManyToOne(() => UserEntity)
  // Owner: UserEntity;

  @OneToMany(() => UserEntity, (user) => user.tenant)
  users = new Collection<UserEntity>(this);

  // [EntityRepositoryType]?: TenantRepository;

  constructor({
    name,
    slug,
    description,
    plan = TenantPlan.FREE,
    status = TenantStatus.ACTIVE,
    logoUrl,
    primaryColor,
    settings,
    limits,
  }: {
    name: string;
    slug: string;
    description?: string;
    plan?: TenantPlan;
    status?: TenantStatus;
    logoUrl?: string;
    primaryColor?: string;
    settings?: Record<string, any>;
    limits?: {
      maxBookmarks?: number;
      maxCollections?: number;
      maxTags?: number;
      maxStorage?: number;
    };
  }) {
    super();
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.plan = plan;
    this.status = status;
    this.logoUrl = logoUrl;
    this.primaryColor = primaryColor;
    this.settings = settings;
    this.limits = limits || this.getDefaultLimits();
    this.usage = {
      bookmarkCount: 0,
      collectionCount: 0,
      tagCount: 0,
      storageUsed: 0,
    };
  }

  /**
   * Get default limits based on plan
   */
  private getDefaultLimits(): {
    maxBookmarks: number;
    maxCollections: number;
    maxTags: number;
    maxStorage: number;
  } {
    switch (this.plan) {
      case TenantPlan.FREE:
        return {
          maxBookmarks: 1000,
          maxCollections: 10,
          maxTags: 50,
          maxStorage: 100, // 100MB
        };
      case TenantPlan.BASIC:
        return {
          maxBookmarks: 5000,
          maxCollections: 50,
          maxTags: 200,
          maxStorage: 500, // 500MB
        };
      case TenantPlan.PREMIUM:
        return {
          maxBookmarks: 20000,
          maxCollections: 200,
          maxTags: 1000,
          maxStorage: 2000, // 2GB
        };
      case TenantPlan.ENTERPRISE:
        return {
          maxBookmarks: -1, // Unlimited
          maxCollections: -1,
          maxTags: -1,
          maxStorage: -1,
        };
      default:
        return this.getDefaultLimits();
    }
  }

  /**
   * Check if tenant can create more bookmarks
   */
  canCreateBookmark(): boolean {
    if (this.limits?.maxBookmarks === -1) return true;
    return (this.usage?.bookmarkCount || 0) < (this.limits?.maxBookmarks || 0);
  }

  /**
   * Check if tenant can create more collections
   */
  canCreateCollection(): boolean {
    if (this.limits?.maxCollections === -1) return true;
    return (
      (this.usage?.collectionCount || 0) < (this.limits?.maxCollections || 0)
    );
  }

  /**
   * Check if tenant can create more tags
   */
  canCreateTag(): boolean {
    if (this.limits?.maxTags === -1) return true;
    return (this.usage?.tagCount || 0) < (this.limits?.maxTags || 0);
  }

  /**
   * Check if tenant has storage space
   */
  hasStorageSpace(sizeInMB: number): boolean {
    if (this.limits?.maxStorage === -1) return true;
    const currentUsage = this.usage?.storageUsed || 0;
    const maxStorage = this.limits?.maxStorage || 0;
    return currentUsage + sizeInMB <= maxStorage;
  }

  /**
   * Update usage statistics
   */
  updateUsage(usage: Partial<typeof this.usage>): void {
    this.usage = {
      ...this.usage,
      ...usage,
    };
  }

  /**
   * Check if tenant is active and can perform operations
   */
  isOperational(): boolean {
    return this.isActive && this.status === TenantStatus.ACTIVE;
  }

  /**
   * Check if subscription is expired
   */
  isSubscriptionExpired(): boolean {
    if (!this.subscriptionExpiresAt) return false;
    return new Date() > this.subscriptionExpiresAt;
  }

  canAccessTenant(): boolean {
    return this.isOperational() && !this.isSubscriptionExpired();
  }
}
