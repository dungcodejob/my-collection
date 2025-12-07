import { TenantEntity } from '@app/entities';
import { UNIT_OF_WORK, type UnitOfWork } from '@app/repositories';
import { FilterQuery } from '@mikro-orm/core';
import { Inject, Injectable } from '@nestjs/common';

type TenantCreateInput = Omit<
  ConstructorParameters<typeof TenantEntity>[0],
  'user' | 'limits'
>;

@Injectable()
export class TenantService {
  constructor(@Inject(UNIT_OF_WORK) private readonly unitOfWork: UnitOfWork) {}

  create(data: TenantCreateInput): TenantEntity {
    // if (!data) {
    //   throw Errors.Tenant.InvalidData;
    // }

    const tenant = new TenantEntity(data);
    return this.unitOfWork.tenant.create(tenant);
  }

  count(where?: FilterQuery<TenantEntity>) {
    return this.unitOfWork.tenant.count(where);
  }

  async findBySlug(slug: string): Promise<TenantEntity | null> {
    return this.unitOfWork.tenant.findOne({
      slug,
    });
  }

  async findById(id: string) {
    return this.unitOfWork.tenant.findOne({
      id,
    });
  }
}
