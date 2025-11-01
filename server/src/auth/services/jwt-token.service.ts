import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

import {
  type AppConfig,
  InjectAppConfig,
  InjectJwtConfig,
  type JwtConfig,
} from '@app/configs';
import { SECOND } from '@app/constants';
import { AccountEntity, SessionEntity, TenantEntity } from '@app/entities';
import { v6 } from 'uuid';
import {
  AccessPayload,
  AccessToken,
  RefreshPayload,
  RefreshToken,
  TokenTypeEnum,
} from '../models';

@Injectable()
export class JwtTokenService {
  private readonly issuer: string;

  constructor(
    @InjectJwtConfig() private readonly jwtConfig: JwtConfig,
    @InjectAppConfig() private readonly appConfig: AppConfig,
    private readonly jwtService: JwtService,
  ) {
    this.issuer = appConfig.appId;
  }

  generateAccessToken(
    session: SessionEntity,
    account: AccountEntity,
    tenant: TenantEntity,
    domain?: string | null,
  ): Promise<string> {
    const { secret, time } = this.jwtConfig[TokenTypeEnum.ACCESS];

    const jwtOptions: JwtSignOptions = {
      issuer: this.issuer,
      subject: account.email,
      audience: domain ?? this.appConfig.domain,
      algorithm: 'HS256',
      expiresIn: time,
    };

    const payload: AccessPayload = {
      id: session.id,
      email: account.email,
      tenantId: tenant?.id,
      tenantSlug: tenant?.slug,
    };

    return this.generateToken(payload, secret, jwtOptions);
  }

  generateRefreshToken(
    session: SessionEntity,
    account: AccountEntity,
    tenant: TenantEntity,
    domain?: string | null,
    tokenId?: string,
  ): Promise<string> {
    const { secret, time } = this.jwtConfig[TokenTypeEnum.REFRESH];

    const jwtOptions: JwtSignOptions = {
      issuer: this.issuer,
      subject: account.email,
      audience: domain ?? this.appConfig.domain,
      algorithm: 'HS256', // only needs a secret
      expiresIn: time,
    };

    const payload: RefreshPayload = {
      id: session.id,
      email: account.email,
      tokenId: tokenId ?? v6(),
      version: account.version,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
    };

    return this.generateToken(payload, secret, jwtOptions);
  }

  verifyToken(
    token: string,
    tokenType: TokenTypeEnum.ACCESS,
  ): Promise<AccessToken>;
  verifyToken(
    token: string,
    tokenType: TokenTypeEnum.REFRESH,
  ): Promise<RefreshToken>;
  verifyToken<T extends AccessToken | RefreshToken>(
    token: string,
    tokenType: TokenTypeEnum,
  ): Promise<T> {
    const { time, secret } = this.jwtConfig[tokenType];

    // Chỉ verify theo chữ ký (secret) và thời hạn (maxAge)
    const jwtOptions: JwtVerifyOptions = {
      secret,
      maxAge: time,
    };

    return this.jwtService.verifyAsync<T>(token, jwtOptions);
  }

  /**
   * Get refresh token expiration time in milliseconds
   */
  getRefreshTokenExpirationMs(): number {
    const { time } = this.jwtConfig[TokenTypeEnum.REFRESH];

    // Convert JWT time format to milliseconds
    if (typeof time === 'string') {
      // Handle formats like '7d', '24h', '60m', '3600s'
      const match = String(time).match(/^(\d+)([dhms])$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
          case 'd':
            return value * 24 * 60 * 60 * 1000; // days
          case 'h':
            return value * 60 * 60 * 1000; // hours
          case 'm':
            return value * 60 * 1000; // minutes
          case 's':
            return value * 1000; // seconds
          default:
            return 7 * 24 * 60 * 60 * 1000; // default 7 days
        }
      }
    }

    return time * SECOND;
  }

  private generateToken(
    payload: AccessPayload,
    secret: string,
    options: JwtSignOptions,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret,
      ...options,
    });
  }
}
