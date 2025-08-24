import { UserEntity } from "@common/entities";
import { AuthConfig, InjectAuthConfig } from "@configs/index";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

import { BcryptService } from "@authentication/services";
import { Errors } from "@common/errors";
import { UserService } from "@modules/user";
import { JwtPayload } from "../models";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(
    @InjectAuthConfig()
    authConfig: AuthConfig,
    private readonly _userService: UserService,
    private readonly _bcryptService: BcryptService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfig.jwtRefreshSecret,
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<UserEntity> {
    const refreshToken = this._getToken(req);

    const user = await this._userService.findByUsername(payload.username);

    if (!user || user.email !== payload.email) {
      throw Errors.Authentication.AccessDenied;
    }

    const isTokenMatched = this._bcryptService.verify(refreshToken, user.refreshToken);

    if (!isTokenMatched) {
      throw Errors.Authentication.AccessDenied;
    }

    return user;
  }

  protected _getToken(request: Request): string {
    const authorization = request.headers["authorization"];
    if (!authorization || Array.isArray(authorization)) {
      throw Errors.Authentication.InvalidHeader;
    }
    const [type, token] = authorization.split(" ");

    if (type !== "Bearer") {
      throw Errors.Authentication.InvalidHeader;
    }

    return token;
  }
}
