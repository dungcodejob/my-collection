import { MINUTE, SECOND } from '@app/constants';
import { SessionRepository } from '@app/repositories';
import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { AccountEntity } from './account.entity';
import { BaseEntityWithTenant } from './base-extend.entity';
import { UserEntity } from './user.entity';

@Entity({ repository: () => SessionRepository })
@Index({ properties: ['id'] })
@Index({ properties: ['account', 'isActive'] })
@Index({ properties: ['tenant', 'isActive'] })
export class SessionEntity extends BaseEntityWithTenant {
  @Property()
  deviceId: string;

  @Property({ nullable: true })
  expiresAt?: Date;

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  lastAccessedAt?: Date;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ nullable: true })
  refreshTokenHash?: string;

  @Property({ default: 0 })
  refreshCount: number = 0;

  @Property({ nullable: true, length: 45 })
  ipAddress?: string;

  @Property({ nullable: true, length: 500 })
  userAgent?: string;

  @Property({ nullable: true, length: 100 })
  deviceType?: string;

  @Property({ nullable: true, length: 100 })
  location?: string;

  @ManyToOne(() => AccountEntity)
  account: AccountEntity;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  [EntityRepositoryType]?: SessionRepository;

  constructor({
    id,
    expiresAt,
    account,
    ipAddress,
    userAgent,
    deviceType,
    location,
  }: {
    id: string;
    expiresAt: Date;
    account: AccountEntity;

    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
    location?: string;
  }) {
    super();
    this.id = id;
    this.expiresAt = expiresAt;
    this.account = account;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.deviceType = deviceType;
    this.location = location;
  }

  /**
   * Check if the session is expired
   */
  isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  /**
   * Check if the session is valid (active and not expired)
   */
  isValid(): boolean {
    return this.isActive && !this.isExpired();
  }

  /**
   * Update last accessed time
   */
  updateLastAccessed(): void {
    this.lastAccessedAt = new Date();
  }

  /**
   * Deactivate the session
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Extend session expiration time
   */
  extendExpiration(additionalMinutes: number): void {
    const currentExpiresAt = this.expiresAt || new Date();
    this.expiresAt = new Date(
      currentExpiresAt.getTime() + additionalMinutes * MINUTE * SECOND,
    );
  }
}
