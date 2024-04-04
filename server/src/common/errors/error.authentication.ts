import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";

export class Authentication {
  static Unauthorized = new UnauthorizedException("Auth.Unauthorized");
  static UserExists = new BadRequestException("Auth.UserExists"); // User already exists
  static UsernameOrPasswordNotMatched = new UnauthorizedException(
    "Auth.UsernameOrPasswordNotMatched"
  ); // Username or password not match
  static InvalidHeader = new BadRequestException("Auth.InvalidHeader"); // Invalid Authorization Header
  static AccessDenied = new ForbiddenException("Auth.AccessDenied");
}
