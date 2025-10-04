import { CollectionRepository } from '@app/repositories';
import {
  Collection,
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseEntityWithTenant } from './base-extend.entity';
import { TenantEntity } from './tenant.entity';
import { UserEntity } from './user.entity';

@Entity({ repository: () => CollectionRepository })
@Index({ properties: ['id'] })
@Index({ properties: ['user', 'deleteFlag'] })
@Index({ properties: ['tenant', 'deleteFlag'] })
@Index({ properties: ['parent'] })
export class CollectionEntity extends BaseEntityWithTenant {
  @Property()
  name: string;

  @Property({ nullable: true, length: 100 })
  icon?: string;

  @Property({ length: 500 })
  path: string;

  @Property({ default: false })
  isHasChild: boolean = false;

  @Property({ nullable: true, length: 1000 })
  description?: string;

  @Property({ default: 0 })
  sortOrder: number = 0;

  @Property({ default: true })
  isActive: boolean = true;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => TenantEntity)
  tenant: TenantEntity;

  @ManyToOne(() => CollectionEntity, { nullable: true })
  parent?: CollectionEntity;

  @OneToMany(() => CollectionEntity, (collection) => collection.parent)
  children = new Collection<CollectionEntity>(this);

  [EntityRepositoryType]?: CollectionRepository;

  constructor({
    name,
    icon,
    path,
    description,
    sortOrder,
    user,
    tenant,
    parent,
  }: {
    name: string;
    icon?: string;
    path: string;
    description?: string;
    sortOrder?: number;
    user: UserEntity;
    tenant: TenantEntity;
    parent?: CollectionEntity;
  }) {
    super();
    this.name = name;
    this.icon = icon;
    this.path = path;
    this.description = description;
    this.sortOrder = sortOrder || 0;
    this.user = user;
    this.tenant = tenant;
    this.parent = parent;
  }

  /**
   * Update the hasChild flag based on children count
   */
  updateHasChildFlag(): void {
    this.isHasChild = this.children.length > 0;
  }

  /**
   * Generate path based on parent path and current ID
   */
  generatePath(): void {
    if (this.parent) {
      this.path = `${this.parent.path}/${this.id}`;
    } else {
      this.path = this.id;
    }
  }

  /**
   * Check if this collection is a root collection (no parent)
   */
  isRoot(): boolean {
    return !this.parent;
  }

  /**
   * Get parent ID from parent relationship
   */
  getParentId(): string | null {
    return this.parent?.id || null;
  }

  /**
   * Get the depth level of this collection in the hierarchy
   */
  getDepthLevel(): number {
    if (!this.parent) return 0;
    return this.parent.getDepthLevel() + 1;
  }
}
