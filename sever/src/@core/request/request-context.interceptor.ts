import { REQUEST_KEY } from '@app/constants';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RequestContextService } from './request-context.service';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly ctx: RequestContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const data = req.user || {};
    const user = data[REQUEST_KEY.CURRENT_USER];
    const session = data[REQUEST_KEY.CURRENT_SESSION];
    const account = data[REQUEST_KEY.CURRENT_ACCOUNT];
    const tenant = data[REQUEST_KEY.CURRENT_TENANT];

    return new Observable((subscriber) => {
      this.ctx.run({ account, session, user, tenant }, () =>
        next.handle().subscribe(subscriber),
      );
    });
  }
}
