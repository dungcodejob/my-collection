import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export const httpConfig = registerAs('http', () => {
  return {
    version: process.env.HTTP_VERSION || '1',
    versioningEnable: process.env.HTTP_VERSIONING_ENABLE || false,
    versioningPrefix: process.env.HTTP_VERSIONING_PREFIX || 'v',
  };
});

export type HttpConfig = ConfigType<typeof httpConfig>;
export const InjectHttpConfig = () => Inject(httpConfig.KEY);
