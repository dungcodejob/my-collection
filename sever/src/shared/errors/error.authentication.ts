import { BadRequestException, UnauthorizedException } from '@nestjs/common';

export class Authentication {
  static EmailAlreadyExists = new BadRequestException(
    'Auth.EmailAlreadyExists',
  );
  static InvalidEmailOrUsername = new UnauthorizedException(
    'Auth.InvalidEmailOrUsername',
  );
  static InvalidCredentials = new UnauthorizedException(
    'Auth.InvalidCredentials',
  );

  static InvalidToken = new UnauthorizedException('Auth.InvalidToken');
  static InvalidRefreshToken = new UnauthorizedException(
    'Auth.InvalidRefreshToken',
  );
}
