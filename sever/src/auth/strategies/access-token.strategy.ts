import { REQUEST_KEY } from '@app/constants';
import { AccountEntity, SessionEntity, UserEntity } from '@app/entities';
import { Errors } from '@app/errors';
import { SessionService } from '@app/session';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectJwtConfig, type JwtConfig } from '@app/configs';
import { AccessPayload } from '../models';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectJwtConfig()
    jwtConfig: JwtConfig,
    private readonly _sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.access.secret,
    });
  }

  async validate(payload: AccessPayload): Promise<{
    user: UserEntity;
    session: SessionEntity;
    account: AccountEntity;
  }> {
    const session = await this._sessionService.findOneById(payload.id);

    if (!session || !session.isValid()) {
      throw Errors.Authentication.Unauthorized;
    }

    return {
      [REQUEST_KEY.CURRENT_USER]: session.user,
      [REQUEST_KEY.CURRENT_SESSION]: session,
      [REQUEST_KEY.CURRENT_ACCOUNT]: session.account,
    };
  }
}
