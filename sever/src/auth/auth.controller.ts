import { Origin, Public } from '@app/decorators';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { InjectJwtConfig, type JwtConfig } from '@app/configs';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import * as geoip from 'geoip-lite';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, SessionInfo } from './models';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  private readonly _cookiePath = '/api/auth';
  private readonly _isTesting: boolean;
  private readonly _refreshTime: number;

  constructor(
    @InjectJwtConfig()
    private readonly _jwtConfig: JwtConfig,
    private readonly _authService: AuthService,
  ) {
    this._refreshTime = _jwtConfig.refresh.time;
    this._isTesting = true;
  }

  @Public()
  @Post('login')
  async login(
    @Req() req: Request,
    @Origin() origin: string | undefined,
    @Body() loginDto: LoginDto,
  ) {
    const sessionInfo = this.getSessionInfoFromReq(req);
    const result = await this._authService.login(loginDto, sessionInfo, origin);
    console.log('result', result);
    // this.saveRefreshCookie(res, result.refreshToken)
    //   .status(HttpStatus.OK)
    //   .json(result);

    return result;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    console.log('body', registerDto);
    try {
      return this._authService.register(registerDto);
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  private getSessionInfoFromReq(req: Request): SessionInfo {
    const ipAddress: string =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any)?.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceType = this.getDeviceType(userAgent);
    const location = this.getLocation(ipAddress);

    return {
      ipAddress,
      userAgent,
      deviceType,
      location,
    };
  }

  private getDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();

    // Mobile devices
    if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
      if (/iphone|ipod/i.test(ua)) return 'iPhone';
      if (/android/i.test(ua)) return 'Android';
      if (/blackberry/i.test(ua)) return 'BlackBerry';
      if (/windows phone/i.test(ua)) return 'Windows Phone';
      return 'Mobile';
    }

    // Tablets
    if (/tablet|ipad/i.test(ua)) {
      if (/ipad/i.test(ua)) return 'iPad';
      return 'Tablet';
    }

    // Desktop browsers
    if (/chrome/i.test(ua)) return 'Desktop Chrome';
    if (/firefox/i.test(ua)) return 'Desktop Firefox';
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Desktop Safari';
    if (/edge/i.test(ua)) return 'Desktop Edge';
    if (/opera/i.test(ua)) return 'Desktop Opera';

    return 'Desktop';
  }

  private getLocation(ipAddress?: string) {
    if (!ipAddress) return 'unknown';
    const geo = geoip.lookup(ipAddress);
    if (geo) {
      return `${geo.country}, ${geo.region}, ${geo.city}`;
    }
    return 'unknown';
  }
}
