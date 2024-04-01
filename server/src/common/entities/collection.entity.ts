import { BaseEntity } from "@database/base.entity";
import { Check, Entity, ManyToOne, OptionalProps, Property, Ref } from "@mikro-orm/core";
import { UserEntity } from "./user.entity";

@Entity({ tableName: "collection" })
@Check<CollectionEntity>({
  expression: columns =>
    `"${columns.left}" > 0 AND "${columns.right}" > "${columns.left}"`,
})
export class CollectionEntity extends BaseEntity {
  [OptionalProps]?: keyof BaseEntity;

  @Property()
  title: string;

  @Property()
  left: number;

  @Property()
  right: number;

  @Property()
  depth: number;

  @Property()
  treeId: string;

  @ManyToOne(() => CollectionEntity, { ref: true, nullable: true })
  parent?: Ref<CollectionEntity>;

  @ManyToOne(() => UserEntity, { ref: true })
  user!: Ref<UserEntity>;
}
