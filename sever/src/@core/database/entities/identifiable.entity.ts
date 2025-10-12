import { Entity, PrimaryKey } from '@mikro-orm/core';
import { v7 } from 'uuid';

export type IdentityType = string;
export const DatabaseDefaultUUID = () => v7();

@Entity({ abstract: true })
export class IdentifiableEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuidv7()' })
  id: IdentityType;
}
