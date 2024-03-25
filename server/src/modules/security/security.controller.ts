import { JwtToken } from '@authentication/models';
import { BcryptService, JwtTokenGenerator } from '@authentication/services';
import { ResponseMessage } from '@common/decorators';
import { UserEntity } from '@common/entities';
import { Errors } from '@common/errors';
import { Result } from '@common/models';
import { UserMapper, UserService } from '@modules/user';
import { Body, Controller, Post } from '@nestjs/common';
import { LoginBodyDto, RegisterBodyDto } from './models';
import { AuthResultDto } from './models/auth-result.dto';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly _jwtTokenGenerator: JwtTokenGenerator,
    private readonly _userService: UserService,
    private readonly _bcryptService: BcryptService,
    private readonly _userMapper: UserMapper,
  ) {}

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

    const payload = this._jwtTokenGenerator.generatePayload(user);
    const tokens = await this._jwtTokenGenerator.generateToken(payload);

    return this._plantToAuthResult(tokens, user);
  }

  @Post('register')
  async register(@Body() body: RegisterBodyDto) {
    const userExists = await this._userService.findByUsername(body.username);
    if (userExists) {
      throw Errors.Authentication.UserExists;
    }

    const passwordHash = await this._bcryptService.hash(body.password);

    const newUser = await this._userService.create({
      firstName: body.firstName,
      lastName: body.lastName,
      passwordHash: passwordHash,
      username: body.username,
      email: body.email,
    });

    const payload = this._jwtTokenGenerator.generatePayload(newUser);
    const tokens = await this._jwtTokenGenerator.generateToken(payload);

    return this._plantToAuthResult(tokens, newUser);
  }

  private _plantToAuthResult(tokens: JwtToken, user: UserEntity) {
    const result = new AuthResultDto();
    result.tokens = tokens;
    result.user = this._userMapper.toProfileDto(user);
    return Result.toSingle(result);
  }
}
