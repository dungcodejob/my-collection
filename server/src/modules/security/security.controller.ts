import { RefreshTokenGuard } from '@authentication/guards';
import { JwtToken } from '@authentication/models';
import { BcryptService, JwtUtil } from '@authentication/services';
import { CurrentUser, ResponseMessage } from '@common/decorators';
import { UserEntity } from '@common/entities';
import { Errors } from '@common/errors';
import { Result } from '@common/models';
import { UserMapper, UserService } from '@modules/user';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoginBodyDto, RegisterBodyDto } from './models';
import { AuthResultDto } from './models/auth-result.dto';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly _jwtUtil: JwtUtil,
    private readonly _userService: UserService,
    private readonly _bcryptService: BcryptService,
    private readonly _userMapper: UserMapper,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ResponseMessage('login successful')
  async login(@Body() body: LoginBodyDto) {
    const user = await this._userService.findByUsername(body.username);

    if (!user) {
      throw Errors.Authentication.UsernameOrPasswordNotMatched;
    }

    const isPasswordMatched = this._bcryptService.verify(
      body.password,
      user.passwordHash,
    );

    if (!isPasswordMatched) {
      throw Errors.Authentication.UsernameOrPasswordNotMatched;
    }

    const payload = this._jwtUtil.generatePayload(user);
    const tokens = await this._jwtUtil.generateToken(payload);

    await this._updateRefreshToken(user.id, tokens.refresh);

    return this._plantToAuthResult(tokens, user);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @ResponseMessage('register successful')
  async register(@Body() body: RegisterBodyDto) {
    const userExists = await this._userService.findByUsername(body.username);
    if (userExists) {
      throw Errors.Authentication.UserExists;
    }

    const passwordHash = await this._bcryptService.hash(body.password);

    const newUser = await this._userService.create({
      firstName: body.firstName,
      lastName: body.lastName,
      passwordHash,
      username: body.username,
      email: body.email,
    });

    const payload = this._jwtUtil.generatePayload(newUser);
    const tokens = await this._jwtUtil.generateToken(payload);

    await this._updateRefreshToken(newUser.id, tokens.refresh);

    return this._plantToAuthResult(tokens, newUser);
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshTokens(@CurrentUser() user: UserEntity) {
    const tokens = await this._jwtUtil.generateToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    await this._updateRefreshToken(user.id, tokens.refresh);

    return this._plantToAuthResult(tokens, user);
  }

  private async _updateRefreshToken(userId: string, refreshToken: string) {
    const refreshTokenHash = await this._bcryptService.hash(refreshToken);
    await this._userService.updateRefreshToken(userId, refreshTokenHash);
  }

  private _plantToAuthResult(tokens: JwtToken, user: UserEntity) {
    const result = new AuthResultDto();
    result.tokens = tokens;
    result.user = this._userMapper.toProfileDto(user);
    return Result.toSingle(result);
  }
}
