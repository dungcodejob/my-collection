import { AccountRepository } from '@app/repositories';
import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity({ repository: () => AccountRepository })
export class AccountEntity extends BaseEntity {
  @Property({ unique: true })
  username: string;

  @Property({ unique: true })
  email: string;

  @Property()
  passwordHash: string;

  @Property()
  version: number = 0;

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  passwordUpdatedAt: Date = new Date();

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ nullable: true })
  lastLoginAt?: Date;

  @ManyToOne(() => UserEntity, { deleteRule: 'cascade' })
  user: UserEntity;

  [EntityRepositoryType]?: AccountRepository;

  constructor({
    username,
    email,
    passwordHash,
    user,
  }: {
    username: string;
    email: string;
    passwordHash: string;
    user: UserEntity;
  }) {
    super();
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.user = user;
  }
}
