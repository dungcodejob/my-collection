import { InjectJwtConfig, type JwtConfig } from '@app/configs';
import { COOKIE_KEY, SWAGGER_SCHEME } from '@app/constants';
import { Origin, Public, Session } from '@app/decorators';
import { Errors } from '@app/errors';
import { ApiOkResponseSingle, Result } from '@app/models';
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
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  AuthResultDto,
  LoginDto,
  RefreshAccessDto,
  RegisterDto,
  type SessionInfo,
} from './models';

@ApiTags('Auth')
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

  @ApiOperation({
    summary: 'User Login',
    description:
      'Authenticate user with email/username and password. Returns access token and sets refresh token in HTTP-only cookie.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponseSingle(
    AuthResultDto,
    'Login successful. Returns access token and user information.',
  )
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Invalid credentials' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
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

  @ApiOperation({
    summary: 'User Registration',
    description:
      'Register a new user account with email, username and password.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponseSingle(null, 'Registration successful. User account created.')
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors or user already exists',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
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

  @ApiOperation({
    summary: 'User Logout',
    description:
      'Logout user by invalidating refresh token and clearing cookies. Can use refresh token from cookie or request body.',
  })
  // @ApiBearerAuth(SWAGGER_SCHEME.AUTH)
  @ApiCookieAuth(SWAGGER_SCHEME.REFRESH)
  @ApiBody({ type: RefreshAccessDto, required: false })
  @ApiOkResponseSingle(
    null,
    'Logout successful. Refresh token invalidated and cookies cleared.',
  )
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
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

  @ApiOperation({
    summary: 'Refresh Access Token',
    description:
      'Generate new access token using refresh token from cookie or request body.',
  })
  @ApiCookieAuth(COOKIE_KEY.REFRESH_TOKEN)
  @ApiBody({ type: RefreshAccessDto, required: false })
  @ApiOkResponseSingle(
    AuthResultDto,
    'Token refresh successful. Returns new access token.',
  )
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(
    @Origin() origin: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() refreshAccessDto?: RefreshAccessDto,
  ) {
    const refreshToken = this.getRefreshFromCookieOrBody(req, refreshAccessDto);
    const result = await this._authService.refreshToken(
      refreshToken,
      origin || '',
    );

    this.saveRefreshCookie(res, result.refreshToken);

    return Result.toSingle(result);
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
