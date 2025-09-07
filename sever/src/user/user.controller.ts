import { FEATURE_KEY, SWAGGER_SCHEME } from '@app/constants';
import { ApiCommonErrors } from '@app/decorators';
import { Result } from '@app/models';
import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserMapper } from './user.mapper';

@ApiTags(FEATURE_KEY.USER)
@Controller(FEATURE_KEY.USER)
export class UserController {
  constructor(private readonly _userMapper: UserMapper) {}

  @ApiBearerAuth(SWAGGER_SCHEME.AUTH)
  @ApiCommonErrors()
  @Get('profile')
  getProfile(@Req() req) {
    return Result.toSingle({
      data: this._userMapper.toUserInfo(req.user.user),
    });
  }
}
