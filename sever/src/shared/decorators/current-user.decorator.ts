import { UserEntity } from '@app/entities';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type UserRecord = keyof UserEntity;
export const CURRENT_USER_KEY = 'user';

export const CurrentUser = createParamDecorator(
  (data: UserRecord, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return data ? request[CURRENT_USER_KEY]?.[data] : request[CURRENT_USER_KEY];
  },
);
