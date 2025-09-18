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
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth';
import { BookmarkModule } from './bookmark';
import { CollectionModule } from './collection';
import { CrawlModule } from './crawl';
import { HealthModule } from './health/health.module';
import { TagModule } from './tag';
import { UserModule } from './user';

@Module({
  imports: [
    RequestMiddlewareModule,
    UnitOfWorkModule,
    AuthModule,
    UserModule,
    BookmarkModule,
    CollectionModule,
    CrawlModule,
    TagModule,
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
  ],
})
export class AppModule {}
