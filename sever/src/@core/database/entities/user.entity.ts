import { UserRepository } from '@app/repositories';
import {
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v6 } from 'uuid';
import { AccountEntity } from './account.entity';
import { BaseEntity } from './base.entity';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

@Entity({ repository: () => UserRepository })
export class UserEntity extends BaseEntity {
  @PrimaryKey()
  id: string = v6();

  @Property()
  name: string;

  @Enum(() => Role)
  role: Role = Role.USER;

  @OneToMany(() => AccountEntity, (account) => account.user)
  accounts = new Collection<AccountEntity>(this);

  [EntityRepositoryType]?: UserRepository;

  constructor({ name, role }: { name: string; role: Role }) {
    super();
    this.name = name;
    this.role = role;
  }
}
