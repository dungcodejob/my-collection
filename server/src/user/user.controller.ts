import { FEATURE_KEY } from '@app/constants';
import { ApiAuth } from '@app/decorators';
import { ResponseBuilder } from '@app/models';
import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserMapper } from './user.mapper';

@ApiTags(FEATURE_KEY.USER)
@Controller(FEATURE_KEY.USER)
export class UserController {
  constructor(private readonly _userMapper: UserMapper) {}

  @ApiAuth({
    auths: ['jwt'],
    description: 'Get user profile',
    summary: 'Get user profile',
  })
  @Get('profile')
  getProfile(@Req() req) {
    return ResponseBuilder.toSingle({
      data: this._userMapper.toUserInfo(req.user.user),
    });
  }
}
