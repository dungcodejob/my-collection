import { EmailPayload } from './email-token';
import { TokenBase } from './token-base';

export interface RefreshPayload extends EmailPayload {
  tokenId: string;
}

export interface RefreshToken extends RefreshPayload, TokenBase {}
