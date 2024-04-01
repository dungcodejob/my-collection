import { FindUserByIdHandler } from './find-user-by-id/find-user-by-id.handler';
import { FindUserByUsernameHandler } from './find-user-by-username/find-user-by-username.handler';

export const QueriesHandlers = [FindUserByUsernameHandler, FindUserByIdHandler];
