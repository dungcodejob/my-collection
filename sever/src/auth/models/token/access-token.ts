import { TokenBase } from './token-base';

export interface AccessPayload {
  id: string;
  email: string;
  tenantId?: string;
}

export interface AccessToken extends AccessPayload, TokenBase {}
