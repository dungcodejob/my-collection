import { REQUEST_KEY } from '@app/constants';
import { UserEntity } from '@app/entities';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type UserRecord = keyof UserEntity;

export const CurrentUser = createParamDecorator(
  (key: UserRecord, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user[REQUEST_KEY.CURRENT_USER];

    if (!user) {
      return null;
    }

    return key ? user[key] : user;
  },
);
