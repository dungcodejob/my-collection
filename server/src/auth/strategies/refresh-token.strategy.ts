import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { InjectJwtConfig, type JwtConfig } from '@app/configs';
import { COOKIE_KEY } from '@app/constants';
import { Errors } from '@app/errors';
import { BcryptService } from '@app/services';
import { isNil } from '@app/utils';
import { SessionService } from 'src/modules/session';
import { RefreshAccessDto, RefreshPayload } from '../models';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @InjectJwtConfig()
    jwtConfig: JwtConfig,
    private readonly _sessionService: SessionService,
    private readonly _bcryptService: BcryptService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.refresh.secret,
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(
    req: Request,
    payload: RefreshPayload,
  ): Promise<{ refreshToken: string }> {
    const refreshToken = this.getRefreshFromCookieOrBody(req);

    const session = await this._sessionService.findOneById(payload.id);

    if (!session || !session.isValid()) {
      throw Errors.Authentication.AccessDenied;
    }

    const isTokenMatched = await this._bcryptService.verify(
      refreshToken,
      session.refreshTokenHash ?? '',
    );

    if (!isTokenMatched) {
      throw Errors.Authentication.AccessDenied;
    }

    return { refreshToken };
  }

  // protected _getToken(request: Request): string {
  //   const authorization = request.headers['authorization'];
  //   if (!authorization || Array.isArray(authorization)) {
  //     throw Errors.Authentication.InvalidHeader;
  //   }
  //   const [type, token] = authorization.split(' ');

  //   if (type !== 'Bearer') {
  //     throw Errors.Authentication.InvalidHeader;
  //   }

  //   return token;
  // }

  private getRefreshFromCookieOrBody(req: Request): string {
    const body = req.body as RefreshAccessDto;
    const reqToken = req.signedCookies[COOKIE_KEY.REFRESH_TOKEN];
    if (!isNil(reqToken)) {
      return reqToken;
    }

    if (!isNil(body?.refreshToken)) {
      return body?.refreshToken;
    }

    throw Errors.Authentication.InvalidRefreshToken;
  }
}
