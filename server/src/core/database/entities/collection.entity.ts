import { CollectionRepository } from '@app/repositories';
import {
  Collection,
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { BaseEntityWithTenant } from './base-extend.entity';
import { UserEntity } from './user.entity';

@Entity({ repository: () => CollectionRepository })
@Index({ properties: ['id'] })
@Index({ properties: ['user', 'deleteFlag'] })
@Index({ properties: ['tenant', 'deleteFlag'] })
@Index({ properties: ['parent'] })
@Unique({
  name: 'collection_entity_tenant_id_slug_unique',
  expression: `create unique index "collection_entity_tenant_id_slug_unique" on "collection_entity" ("tenant_id", "slug") where delete_flag = false;`,
})
export class CollectionEntity extends BaseEntityWithTenant {
  @Property()
  name: string;

  @Property({ nullable: true, length: 100 })
  icon?: string;

  @Property({ length: 50 })
  slug: string;

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

  @ManyToOne(() => CollectionEntity, { nullable: true })
  parent?: CollectionEntity;

  @OneToMany(() => CollectionEntity, (collection) => collection.parent)
  children = new Collection<CollectionEntity>(this);

  [EntityRepositoryType]?: CollectionRepository;

  constructor({
    name,
    icon,
    description,
    sortOrder,
    parent,
    slug,
  }: {
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    sortOrder: number;
    parent?: CollectionEntity;
  }) {
    super();
    this.name = name;
    this.icon = icon;
    this.description = description;
    this.slug = slug;
    this.sortOrder = sortOrder;
    this.parent = parent;
  }

  updateHasChildFlag(): void {
    this.isHasChild = this.children.length > 0;
  }

  generatePath(): void {
    if (this.parent) {
      this.path = `${this.parent.path}/${this.slug}`;
    } else {
      this.path = `/${this.slug}`;
    }
  }

  isRoot(): boolean {
    return !this.parent;
  }

  getParentId(): string | null {
    return this.parent?.id || null;
  }

  getDepthLevel(): number {
    if (!this.parent) return 0;
    return this.parent.getDepthLevel() + 1;
  }
}
