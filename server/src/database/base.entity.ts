import { Entity, Property } from '@mikro-orm/core';
import { IdentifiableEntity } from './identifiable.entity';

@Entity({ abstract: true })
export class BaseEntity extends IdentifiableEntity {
  @Property({ defaultRaw: 'current_timestamp' })
  createAt: Date = new Date();

  @Property({ defaultRaw: 'current_timestamp', onUpdate: () => new Date() })
  updateAt: Date = new Date();
}
