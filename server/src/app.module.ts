import { TransformInterceptor } from '@common/interceptors';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { defineConfig } from '@mikro-orm/postgresql';
import { SecurityModule } from '@modules/security';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  DatabaseConfig,
  appConfig,
  authConfig,
  databaseConfig,
} from './configs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `./src/configs/env/${process.env.NODE_ENV}.env`,
      load: [appConfig, databaseConfig, authConfig],
    }),
    MikroOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (dbConfig: DatabaseConfig) =>
        defineConfig({
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.username,
          password: dbConfig.password,
          dbName: dbConfig.dbName,
          debug: true,
          entities: ['./dist/common/entities'],
          entitiesTs: ['./src/common/entities'],
          // allowGlobalContext: true,
          // discovery: { warnWhenNoEntities: false },
          // entities: ['../../modules/**/entities/*.postgresql.entity.js'],
          // baseDir: __dirname,
        }),
    }),
    SecurityModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
