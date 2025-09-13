import { Entity, PrimaryKey } from '@mikro-orm/core';
import { v6 } from 'uuid';

export type IdentityType = string;
export const DatabaseDefaultUUID = () => v6();

@Entity({ abstract: true })
export class IdentifiableEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: IdentityType;
}
