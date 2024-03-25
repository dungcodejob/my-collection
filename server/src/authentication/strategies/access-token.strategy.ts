import { UserEntity } from '@common/entities';
import { Errors } from '@common/errors';
import { AuthConfig, InjectAuthConfig } from '@configs/index';
import { UserService } from '@modules/user';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../models/jwt-payload';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectAuthConfig()
    authConfig: AuthConfig,
    private readonly _userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    const user = await this._userService.findByUsername(payload.username);

    if (!user || user.email !== payload.email) {
      throw Errors.Authentication.Unauthorized;
    }
    return user;
  }
}
