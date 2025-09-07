import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => {
  const scheme = process.env.APP_SCHEME || 'http';
  const host = process.env.APP_HOST || 'localhost';
  const port = Number(process.env.APP_PORT) || 3000;

  return {
    testing: process.env.NODE_ENV === 'dev',
    appId: process.env.APP_ID || 'app_id',
    client: process.env.APP_CLIENT_DOMAIN || 'http://localhost:4200',
    host,
    port,
    scheme,
    throttlerTtl: Number(process.env.THROTTLER_TTL) || 60,
    throttlerLimit: Number(process.env.THROTTLER_LIMIT) || 20,
    account: {
      username: process.env.DEV_LOGIN_USERNAME || 'string',
      password: process.env.DEV_LOGIN_PASSWORD || 'string',
    },
    get domain() {
      return `${scheme}://${host}:${port}`;
    },
  };
});

export type AppConfig = ConfigType<typeof appConfig>;
export const InjectAppConfig = () => Inject(appConfig.KEY);
