import { BaseEntity } from "@database/base.entity";
import {
  Entity,
  ManyToOne,
  OptionalProps,
  Property,
  Ref,
  TextType,
} from "@mikro-orm/postgresql";
import { CollectionEntity } from "./collection.entity";

@Entity({ tableName: "bookmarks" })
export class BookmarkEntity extends BaseEntity {
  [OptionalProps]?: keyof BaseEntity;

  @Property()
  url: string;

  @Property()
  title: string;

  @Property({ nullable: true })
  domain: string;

  @Property({ nullable: true })
  image: string;

  @Property({ nullable: true, type: TextType })
  description: string;

  @Property({ nullable: true })
  favicon: string;

  @Property({ nullable: true })
  note: string;

  @ManyToOne(() => CollectionEntity, { ref: true })
  collection!: Ref<CollectionEntity>;

  // @ManyToMany(() => TagEntity)
  // tags: Collection<TagEntity> = new Collection<TagEntity>(this);
}
