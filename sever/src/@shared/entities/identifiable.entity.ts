import { Entity, PrimaryKey } from '@mikro-orm/core';

export type IdentityType = string;

@Entity({ abstract: true })
export class IdentifiableEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: IdentityType;
}
