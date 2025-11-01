import { InjectJwtConfig, type JwtConfig } from '@app/configs';
import { REQUEST_KEY } from '@app/constants';
import {
  AccountEntity,
  SessionEntity,
  TenantEntity,
  UserEntity,
} from '@app/entities';
import { Errors } from '@app/errors';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessPayload } from '../models';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectJwtConfig()
    jwtConfig: JwtConfig,
    private readonly _em: EntityManager,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.access.secret,
    });
  }

  async validate(payload: AccessPayload): Promise<{
    [REQUEST_KEY.CURRENT_USER]: UserEntity;
    [REQUEST_KEY.CURRENT_SESSION]: SessionEntity;
    [REQUEST_KEY.CURRENT_ACCOUNT]: AccountEntity;
    [REQUEST_KEY.CURRENT_TENANT]: TenantEntity;
  }> {
    const session = await this._em.findOne(SessionEntity, payload.id, {
      populate: ['tenant'],
    });

    if (!session || !session.isValid()) {
      console.log(session?.expiresAt?.toISOString(), new Date().toISOString());
      throw Errors.Authentication.Unauthorized;
    }

    if (session.tenant.id !== payload.tenantId) {
      throw Errors.Authentication.Unauthorized;
    }

    return {
      [REQUEST_KEY.CURRENT_USER]: session.user,
      [REQUEST_KEY.CURRENT_SESSION]: session,
      [REQUEST_KEY.CURRENT_ACCOUNT]: session.account,
      [REQUEST_KEY.CURRENT_TENANT]: session.tenant,
    };
  }
}
