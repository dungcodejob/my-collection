import { AccessPayload } from './access-token';
import { TokenBase } from './token-base';

export interface EmailPayload extends AccessPayload {
  version: number;
}

export interface EmailToken extends EmailPayload, TokenBase {}
