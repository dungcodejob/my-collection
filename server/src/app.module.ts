import {
  appConfig,
  cookieConfig,
  databaseConfig,
  httpConfig,
  jwtConfig,
  ThrottlerConfig,
} from '@app/configs';
import { HttpExceptionFilter } from '@app/filters';
import { TransformInterceptor } from '@app/interceptors';
import { RequestMiddlewareModule } from '@app/middlewares';
import { UnitOfWorkModule } from '@app/repositories';
import {
  AlsThreadContext,
  AlsThreadContextModule,
  RequestModule,
} from '@app/request';
import { UserSessionStorage } from '@app/services/user-session';
import { UserSessionInMemoryStorage } from '@app/services/user-session.in-memory-storage';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth';
import { BookmarkModule } from './bookmark';
import { CollectionModule } from './collection';
import { CrawlModule } from './crawl';
import { HealthModule } from './health/health.module';
import { UserModule } from './user';

@Module({
  imports: [
    AlsThreadContextModule,
    RequestMiddlewareModule,
    RequestModule,
    UnitOfWorkModule,
    AuthModule,
    UserModule,
    BookmarkModule,
    CollectionModule,
    CrawlModule,
    // TagModule,

    HealthModule,
    ConfigModule.forRoot({
      load: [appConfig, cookieConfig, jwtConfig, httpConfig],
      envFilePath: `./.env.${process.env.NODE_ENV || 'dev'}`,
      isGlobal: true,
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => databaseConfig,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ThrottlerConfig,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: UserSessionStorage,
      useClass: UserSessionInMemoryStorage,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly alsThreadContext: AlsThreadContext) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .apply((_req, _res, next) => this.alsThreadContext.run(next))
      .forRoutes('{*splat}');
  }
}
