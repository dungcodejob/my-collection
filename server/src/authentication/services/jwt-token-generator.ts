import { UserEntity } from '@common/entities';
import { AuthConfig, InjectAuthConfig } from '@configs/index';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../models/jwt-payload';
import { JwtToken } from '../models/jwt-token';
@Injectable()
export class JwtTokenGenerator {
  constructor(
    @InjectAuthConfig()
    private readonly _authConfig: AuthConfig,
    private readonly _jwtService: JwtService,
  ) {}

  async generateToken(payload: JwtPayload): Promise<JwtToken> {
    const createAccessToken = this._jwtService.signAsync(payload, {
      secret: this._authConfig.jwtSecret,
      expiresIn: this._authConfig.jwtExpired,
    });

    const createRefreshToken = this._jwtService.signAsync(payload, {
      secret: this._authConfig.jwtRefreshSecret,
      expiresIn: this._authConfig.jwtRefreshExpired,
    });

    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken,
      createRefreshToken,
    ]);
    const refreshTokenHash = refreshToken;

    return new JwtToken(accessToken, refreshTokenHash);
  }

  generatePayload(user: UserEntity): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
  }
}
