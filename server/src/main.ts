import {
  appConfig,
  AppConfig,
  cookieConfig,
  CookieConfig,
  HttpConfig,
  httpConfig,
} from '@app/configs';
import { HttpStatus, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { swagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const appConfigValues = app.get<AppConfig>(appConfig.KEY);
  const cookieConfigValues = app.get<CookieConfig>(cookieConfig.KEY);
  const httpConfigValues = app.get<HttpConfig>(httpConfig.KEY);

  const port = appConfigValues.port;
  const domain = appConfigValues.domain;
  const testing = appConfigValues.testing;

  const globalPrefix = 'api';
  app.enableCors({
    origin: 'http://localhost:4200', // cho phép Angular gọi
    credentials: true, // nếu bạn gửi cookie/token
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.setGlobalPrefix(globalPrefix);
  app.use(cookieParser(cookieConfigValues.secret));
  app.use(helmet());

  // Configure global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      skipNullProperties: false,
      skipUndefinedProperties: false,
      skipMissingProperties: false,
      forbidUnknownValues: false,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );

  if (httpConfigValues.versioningEnable) {
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: httpConfigValues.version,
      prefix: httpConfigValues.versioningPrefix,
    });
  }

  // Configure Swagger API Documentation
  await swagger(app, appConfigValues);

  await app.listen(port, testing ? '127.0.0.1' : '0.0.0.0');

  console.log(`Server in ${process.env.NODE_ENV} mode`);
  console.log(`Server is listening on :${port}/${globalPrefix}`);
  console.log(`Swagger: ${domain}/${globalPrefix}/docs`);
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
