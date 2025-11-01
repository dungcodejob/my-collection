import { AccountEntity } from '@app/entities';
import { EntityRepository } from '@mikro-orm/core';

export class AccountRepository extends EntityRepository<AccountEntity> {}
