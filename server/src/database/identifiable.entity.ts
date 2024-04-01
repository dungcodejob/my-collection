import { PrimaryKey } from '@mikro-orm/core';

export type IdentityType = string;

export class IdentifiableEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id: IdentityType;
}
