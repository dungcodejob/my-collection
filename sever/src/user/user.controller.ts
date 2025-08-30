import { SWAGGER_SCHEME } from '@app/constants';
import { Result } from '@app/models';
import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserMapper } from './user.mapper';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly _userMapper: UserMapper) {}

  @ApiBearerAuth(SWAGGER_SCHEME.AUTH)
  @Get('profile')
  getProfile(@Req() req) {
    console.log(req);
    throw new Error('test');
    return Result.toSingle(this._userMapper.toUserInfo(req.user.user));
  }
}
