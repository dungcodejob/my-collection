import { SessionEntity } from '@app/entities';
import { EntityRepository } from '@mikro-orm/core';

export class SessionRepository extends EntityRepository<SessionEntity> {}
