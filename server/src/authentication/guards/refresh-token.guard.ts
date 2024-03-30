import { Errors } from '@common/errors';
import { UserService } from '@modules/user';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { BcryptService, JwtUtil } from '..';
import { JwtGuard } from './jwt.guard';

@Injectable()
export class RefreshTokenGuard extends JwtGuard implements CanActivate {
  constructor(
    private readonly _jwtUtil: JwtUtil,
    private readonly _userService: UserService,
    private readonly _bcryptService: BcryptService,
  ) {
    super();
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return this._handle(context);
  }

  protected async _handle(context: ExecutionContext): Promise<boolean> {
    try {
      const request = this._getRequest<Request>(context);
      const token = this._getToken(request);
      const payload = await this._jwtUtil.verifyRefreshToken(token);
      const user = await this._userService.findByUsername(payload.username);

      if (!user || user.email !== payload.email) {
        throw Errors.Authentication.AccessDenied;
      }

      const isTokenMatched = this._bcryptService.verify(
        token,
        user.refreshToken,
      );

      if (!isTokenMatched) {
        throw Errors.Authentication.AccessDenied;
      }

      request['user'] = user;

      return true;
    } catch (e) {
      throw Errors.Authentication.AccessDenied;
    }
  }
}
