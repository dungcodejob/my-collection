import {
  DEFAULT_TOKEN_EXPIRED,
  DEFAULT_TOKEN_SALT,
  DEFAULT_TOKEN_SECRET,
} from '@app/constants';
import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export interface ISingleJwt {
  secret: string;
  time: number;
}

export const jwtConfig = registerAs('jwt', () => {
  const jwtAccess: ISingleJwt = {
    secret: process.env.JWT_ACCESS_TOKEN_SECRET || DEFAULT_TOKEN_SECRET,
    time: Number(process.env.JWT_ACCESS_TOKEN_EXPIRED) || DEFAULT_TOKEN_EXPIRED,
  };

  const jwtRefresh: ISingleJwt = {
    secret: process.env.JWT_REFRESH_TOKEN_SECRET || DEFAULT_TOKEN_SECRET,
    time:
      Number(process.env.JWT_REFRESH_TOKEN_EXPIRED) || DEFAULT_TOKEN_EXPIRED,
  };

  const jwtConfirmation: ISingleJwt = {
    secret: process.env.JWT_CONFIRMATION_SECRET || DEFAULT_TOKEN_SECRET,
    time: Number(process.env.JWT_CONFIRMATION_EXPIRED) || DEFAULT_TOKEN_EXPIRED,
  };

  const jwtResetPassword: ISingleJwt = {
    secret: process.env.JWT_RESET_PASSWORD_SECRET || DEFAULT_TOKEN_SECRET,
    time:
      Number(process.env.JWT_RESET_PASSWORD_EXPIRED) || DEFAULT_TOKEN_EXPIRED,
  };

  return {
    access: jwtAccess,
    refresh: jwtRefresh,
    confirmation: jwtConfirmation,
    resetPassword: jwtResetPassword,
    jwtSalt: Number(process.env.JWT_SALT) || DEFAULT_TOKEN_SALT,
  };
});

export type JwtConfig = ConfigType<typeof jwtConfig>;
export const InjectJwtConfig = () => Inject(jwtConfig.KEY);
