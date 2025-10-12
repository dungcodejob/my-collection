import { isNil } from '@app/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { type Cache } from 'cache-manager';

@Injectable()
export class BacklistService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly _cacheManager: Cache,
  ) {}

  async addTokenBlacklist(
    sessionId: string,
    tokenId: string,
    exp: number,
  ): Promise<void> {
    const now = Date.now();
    const ttl = this.calculateTTL(exp);
    const key = this.createTokenKey(sessionId, tokenId);

    if (ttl > 0) {
      await this._cacheManager.set(key, now, ttl);
    }
    return;
  }

  async addUserToBlacklist(userId: string, exp: number): Promise<void> {
    const now = Date.now();
    const ttl = this.calculateTTL(exp);
    const key = this.createUserKey(userId);

    if (ttl > 0) {
      await this._cacheManager.set(key, now, ttl);
    }
  }

  async checkIfTokenIsBlacklisted(
    sessionId: string,
    tokenId: string,
  ): Promise<boolean> {
    const tokenKey = this.createTokenKey(sessionId, tokenId);
    const sessionKey = this.createSessionKey(sessionId);

    const [tokenBlacklisted, sessionBlacklisted] = await Promise.all([
      this._cacheManager.get<number>(tokenKey),
      this._cacheManager.get<number>(sessionKey),
    ]);

    return !isNil(tokenBlacklisted) || !isNil(sessionBlacklisted);
  }

  async checkIfUserIsBlacklisted(userId: string): Promise<boolean> {
    const key = this.createUserKey(userId);
    const time = await this._cacheManager.get<number>(key);

    return !isNil(time);
  }

  private createTokenKey(sessionId: string, tokenId: string) {
    return `blacklist:session:${sessionId}:token:${tokenId}`;
  }

  private createSessionKey(sessionId: string) {
    return `blacklist:session:${sessionId}`;
  }

  private createUserKey(userId: string): string {
    return `blacklist:user:${userId}`;
  }

  private calculateTTL(exp: number): number {
    const now = Date.now();
    return exp - now;
  }
}
