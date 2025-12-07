import { UserEntity } from '@app/entities';
import { Injectable } from '@nestjs/common';
import { UserDto } from '../user/models';

@Injectable()
export class UserMapper {
  toUserInfo(result: UserEntity): UserDto {
    return new UserDto({
      id: result.id,
      name: result.name,
    });
  }
}
