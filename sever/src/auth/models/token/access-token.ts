import { TokenBase } from './token-base';

export interface AccessPayload {
  id: string;
  email: string;
  tenantId: string;
  tenantSlug: string;
}

export interface AccessToken extends AccessPayload, TokenBase {}
