import { Injectable } from '@nestjs/common';
import {
  seconds,
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';
import { type AppConfig, InjectAppConfig } from './app.config';

@Injectable()
export class ThrottlerConfig implements ThrottlerOptionsFactory {
  constructor(@InjectAppConfig() private readonly _appConfig: AppConfig) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    const { testing, throttlerLimit, throttlerTtl } = this._appConfig;

    const throttler = {
      ttl: throttlerTtl,
      limit: throttlerLimit,
    };

    if (testing) {
      return {
        throttlers: [
          {
            name: 'default',
            ttl: seconds(throttler.ttl),
            limit: throttler.limit,
          },
        ],
      };
    }

    return {
      throttlers: [
        {
          name: 'default',
          ttl: seconds(throttler.ttl),
          limit: throttler.limit,
        },
        {
          name: 'medium',
          ...throttler,
          ttl: seconds(throttler.ttl * 2),
        },
        {
          name: 'long',
          ...throttler,
          ttl: seconds(throttler.ttl * 5),
        },
      ],
    };
  }
}
