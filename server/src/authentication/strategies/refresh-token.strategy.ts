import { UserEntity } from '@common/entities';
import { AuthConfig, InjectAuthConfig } from '@configs/index';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { BcryptService } from '@authentication/services';
import { Errors } from '@common/errors';
import { UserService } from '@modules/user';
import { JwtPayload } from '../models';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @InjectAuthConfig()
    authConfig: AuthConfig,
    private readonly _userService: UserService,
    private readonly _bcryptService: BcryptService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfig.jwtRefreshSecret,
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<UserEntity> {
    const refreshTokenHash = req
      .get('Authorization')
      .replace('Bearer', '')
      .trim();

    const user = await this._userService.findByUsername(payload.username);
    if (!user || !user.refreshToken) {
      throw Errors.Authentication.AccessDenied;
    }

    const isMatched = await this._bcryptService.verify(
      user.refreshToken,
      refreshTokenHash,
    );

    if (isMatched) {
      throw Errors.Authentication.AccessDenied;
    }

    return user;
  }
}
