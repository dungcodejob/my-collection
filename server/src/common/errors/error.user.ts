import { BadRequestException } from '@nestjs/common';

export class User {
  static UserNotExist = new BadRequestException('UserNotExist'); //User does not exist
}
