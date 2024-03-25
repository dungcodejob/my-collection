import { BadRequestException, UnauthorizedException } from '@nestjs/common';

export class Authentication {
  static Unauthorized = new UnauthorizedException('Auth.Unauthorized');
  static UserExists = new BadRequestException('User already exists');
  static UsernameOrPasswordNotMatched = new UnauthorizedException(
    'Username or password not match',
  );
}
