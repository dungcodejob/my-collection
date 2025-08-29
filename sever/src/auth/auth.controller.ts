import { InjectJwtConfig, type JwtConfig } from '@app/configs';
import { COOKIE_KEY } from '@app/constants';
import { Origin, Public, Session } from '@app/decorators';
import { Errors } from '@app/errors';
import { Result } from '@app/models';
import { isNil } from '@app/utils';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RefreshAccessDto,
  RegisterDto,
  type SessionInfo,
} from './models';

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
    @Session() sessionInfo: SessionInfo,
    @Origin() origin: string | undefined,
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this._authService.login(loginDto, sessionInfo, origin);
    this.saveRefreshCookie(res, result.refreshToken);

    return Result.toSingle(result);
  }

  @Public()
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

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res() res: Response,
    @Body() refreshAccessDto?: RefreshAccessDto,
  ) {
    const token = this.getRefreshFromCookieOrBody(req, refreshAccessDto);
    await this._authService.logout(token);

    this.clearCookies(res);
  }

  private getRefreshFromCookieOrBody(
    req: Request,
    body?: RefreshAccessDto,
  ): string {
    const reqToken = req.signedCookies[COOKIE_KEY.REFRESH_TOKEN];
    if (!isNil(reqToken)) {
      return reqToken;
    }

    if (!isNil(body?.refreshToken)) {
      return body?.refreshToken;
    }

    throw Errors.Authentication.InvalidRefreshToken;
  }

  private saveRefreshCookie(res: Response, refreshToken: string): Response {
    return res.cookie(COOKIE_KEY.REFRESH_TOKEN, refreshToken, {
      secure: !this._isTesting,
      httpOnly: true,
      signed: true,
      path: this._cookiePath,
      expires: new Date(Date.now() + this._refreshTime * 1000),
    });
  }

  private clearCookies(res: Response): Response {
    return res.clearCookie(COOKIE_KEY.REFRESH_TOKEN, {
      path: this._cookiePath,
    });
  }
}
