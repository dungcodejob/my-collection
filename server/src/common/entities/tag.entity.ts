import { BaseEntity } from "@database/base.entity";
import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  OptionalProps,
  Property,
  Ref,
} from "@mikro-orm/postgresql";
import { BookmarkEntity } from "./bookmark.entity";
import { CollectionEntity } from "./collection.entity";

@Entity({ tableName: "tag" })
export class TagEntity extends BaseEntity {
  [OptionalProps]?: keyof BaseEntity;

  @Property()
  title: string;

  @ManyToOne(() => CollectionEntity, { ref: true })
  collection!: Ref<CollectionEntity>;

  @ManyToMany(() => BookmarkEntity, book => book.tags)
  bookmarks = new Collection<BookmarkEntity>(this);
}
