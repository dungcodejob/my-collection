import { HttpExceptionFilter } from '@app/filters';
import { TransformInterceptor } from '@app/interceptors';
import { UnitOfWorkModule } from '@app/repositories';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  appConfig,
  cookieConfig,
  databaseConfig,
  jwtConfig,
  ThrottlerConfig,
} from './@core/configs';
import { AuthModule } from './auth';
import { HealthModule } from './health/health.module';
import { UserModule } from './user';

@Module({
  imports: [
    UnitOfWorkModule,
    AuthModule,
    UserModule,
    HealthModule,
    ConfigModule.forRoot({
      load: [appConfig, cookieConfig, jwtConfig],
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
