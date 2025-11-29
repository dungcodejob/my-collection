import { CollectionTagRepository } from '@app/repositories';
import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Unique,
} from '@mikro-orm/core';
import { BaseEntityWithTenant } from './base-extend.entity';
import { CollectionEntity } from './collection.entity';
import { TagEntity } from './tag.entity';
import { UserEntity } from './user.entity';

@Entity({ repository: () => CollectionTagRepository })
@Index({ properties: ['id'] })
@Index({ properties: ['collection'] })
@Index({ properties: ['tag'] })
@Index({ properties: ['addedBy'] })
@Index({ properties: ['tenant', 'deleteFlag'] })
@Unique({ properties: ['collection', 'tag'] }) // Prevent duplicate tag assignments
export class CollectionTagEntity extends BaseEntityWithTenant {
  @ManyToOne(() => CollectionEntity, { deleteRule: 'cascade' })
  collection: CollectionEntity;

  @ManyToOne(() => TagEntity, { deleteRule: 'cascade' })
  tag: TagEntity;

  @ManyToOne(() => UserEntity)
  addedBy: UserEntity;

  [EntityRepositoryType]?: CollectionTagRepository;

  constructor({
    collection,
    tag,
    addedBy,
  }: {
    collection: CollectionEntity;
    tag: TagEntity;
    addedBy?: UserEntity;
  }) {
    super();
    this.collection = collection;
    this.tag = tag;

    if (addedBy) {
      this.addedBy = addedBy;
    }
  }

  /**
   * Get tag assignment summary
   */
  getSummary(): {
    id: string;
    tagId: string;
    tagName: string;
    tagColor?: string;
    collectionId: string;
    addedBy: string;
    createdAt: Date;
  } {
    return {
      id: this.id,
      tagId: this.tag.id,
      tagName: this.tag.name,
      tagColor: this.tag.color,
      collectionId: this.collection.id,
      addedBy: this.addedBy.id,
      createdAt: this.createAt!,
    };
  }
}
