import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export const cookieConfig = registerAs('cookie', () => ({
  refreshName: process.env.COOKIE_REFRESH_NAME || 'refresh',
  secret: process.env.COOKIE_SECRET || 'secret',
}));

export type CookieConfig = ConfigType<typeof cookieConfig>;
export const InjectCookieConfig = () => Inject(cookieConfig.KEY);
