import { Errors } from '@common/errors';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export abstract class JwtGuard {
  protected _getRequest<T>(context: ExecutionContext): T {
    return context.switchToHttp().getRequest();
  }
  protected _getToken(request: Request): string {
    const authorization = request.headers['authorization'];
    if (!authorization || Array.isArray(authorization)) {
      throw Errors.Authentication.InvalidHeader;
    }
    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer') {
      throw Errors.Authentication.InvalidHeader;
    }

    return token;
  }
}
