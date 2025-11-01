import { Entity, Filter, Property } from '@mikro-orm/core';
import { IdentifiableEntity } from './identifiable.entity';

@Entity({ abstract: true })
@Filter({
  name: 'deleteFlag',
  cond: { deleteFlag: false },
})
export class BaseEntity extends IdentifiableEntity {
  @Property({ defaultRaw: 'current_timestamp' })
  createAt?: Date = new Date();

  @Property({ defaultRaw: 'current_timestamp', onUpdate: () => new Date() })
  updateAt?: Date = new Date();

  @Property({ nullable: true })
  deletedAt?: Date;

  @Property({ default: false })
  deleteFlag?: boolean = false;

  equals(entity: BaseEntity): boolean {
    return this.id === entity.id;
  }
}
