import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  jwtSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'MySuperPassword!123',
  jwtExpired: process.env.JWT_ACCESS_TOKEN_EXPIRED || '1d',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_TOKEN_SECRET || 'MySuperPassword!456Refresh',
  jwtRefreshExpired: process.env.JWT_REFRESH_TOKEN_EXPIRED || '4d',
  jwtSalt: Number(process.env.JWT_SALT) || 12,
}));

export type AuthConfig = ConfigType<typeof authConfig>;
export const InjectAuthConfig = () => Inject(authConfig.KEY);
