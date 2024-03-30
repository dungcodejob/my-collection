import { CreateUserHandler } from './create-user/create-user.handler';
import { UpdateRefreshTokenHandler } from './update-refresh-token/update-refresh-token.handler';

export const CommandHandlers = [CreateUserHandler, UpdateRefreshTokenHandler];
