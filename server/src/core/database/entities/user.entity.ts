import { UserRepository } from '@app/repositories';
import {
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v6 } from 'uuid';
import { AccountEntity } from './account.entity';
import { BaseEntity } from './base.entity';
import { TenantEntity } from './tenant.entity';

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

  @ManyToOne(() => TenantEntity)
  tenant: TenantEntity;

  [EntityRepositoryType]?: UserRepository;

  constructor({
    name,
    tenant,
    role,
  }: {
    name: string;
    tenant: TenantEntity;
    role: Role;
  }) {
    super();
    this.tenant = tenant;
    this.name = name;
    this.role = role;
  }

  /**
   * Check if user has a tenant (is a tenant owner)
   */
  hasTenant(): boolean {
    return !!this.tenant;
  }

  /**
   * Get tenant ID if user has a tenant
   */
  getTenantId(): string | null {
    return this.tenant?.id || null;
  }

  /**
   * Check if user can perform tenant operations
   */
  canManageTenant(): boolean {
    // return this.hasTenant() && this.tenant.isOperational();
    return true;
  }
}
