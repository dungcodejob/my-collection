import { BadRequestException } from '@nestjs/common';

export class User {
  static UserNotExist = new BadRequestException('UserNotExist');
  static UserNotFound = new BadRequestException('UserNotFound');
}
