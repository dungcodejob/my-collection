import { BadRequestException } from '@nestjs/common';

export class User {
  static UserNotExist = new BadRequestException('User does not exist');
}
