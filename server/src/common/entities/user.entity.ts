import { Entity, OptionalProps, Property, Unique } from '@mikro-orm/core';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../database/base.entity';

@Entity({ tableName: 'users' })
export class UserEntity extends BaseEntity {
  [OptionalProps]?: keyof BaseEntity;

  @Property()
  firstName: string;

  @Property()
  lastName: string;

  @Property()
  @Unique()
  username: string;

  @Property()
  passwordHash: string;

  @Property({ nullable: true })
  @Unique()
  email?: string;

  @Exclude()
  @Property({ nullable: true })
  refreshToken?: string;
}
