import { UserEntity } from '@common/entities';
import { Injectable } from '@nestjs/common';
import { UserProfileDto } from '../models';

@Injectable()
export class UserMapper {
  toProfileDto(domain: UserEntity): UserProfileDto {
    return new UserProfileDto(domain.id, domain.firstName, domain.lastName);
  }
}
