import { REQUEST_KEY } from '@app/constants';
import { SessionEntity } from '@app/entities';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type SessionRecord = keyof SessionEntity;

export const CurrentSession = createParamDecorator(
  (key: SessionRecord, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const session = request.user[REQUEST_KEY.CURRENT_SESSION];

    if (session) {
      return null;
    }

    return key ? session[key] : session;
  },
);
