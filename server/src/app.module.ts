import { MikroOrmModule } from '@mikro-orm/nestjs';
import { defineConfig } from '@mikro-orm/postgresql';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfig, appConfig, databaseConfig } from './configs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `./src/configs/env/${process.env.NODE_ENV}.env`,
      load: [appConfig, databaseConfig],
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
          allowGlobalContext: true,
          // entities: ['../../modules/**/entities/*.postgresql.entity.js'],
          // baseDir: __dirname,
        }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
