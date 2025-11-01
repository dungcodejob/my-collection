import { Entity, Filter, ManyToOne } from '@mikro-orm/postgresql';
import { BaseEntity } from './base.entity';
import { TenantEntity } from './tenant.entity';

@Entity({ abstract: true })
@Filter({
  name: 'tenant',
  cond: (args) => ({ tenantId: args.tenantId }),
})
export class BaseEntityWithTenant extends BaseEntity {
  @ManyToOne(() => TenantEntity)
  tenant: TenantEntity;
}
