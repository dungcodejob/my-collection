import { UserEntity } from '@app/entities';
import { EntityRepository } from '@mikro-orm/core';

export class UserRepository extends EntityRepository<UserEntity> {}
