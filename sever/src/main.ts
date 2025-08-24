import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { appConfig, AppConfig, cookieConfig, CookieConfig } from './configs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const appConfigValues = app.get<AppConfig>(appConfig.KEY);
  const cookieConfigValues = app.get<CookieConfig>(cookieConfig.KEY);

  const port = appConfigValues.port;
  const domain = appConfigValues.domain;
  const testing = appConfigValues.testing;

  const globalPrefix = 'api';
  app.enableCors();
  app.setGlobalPrefix(globalPrefix);
  app.use(cookieParser(cookieConfigValues.secret));
  app.use(helmet());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Pokemon API')
    .setDescription('An Pokemon API made with NestJS')
    .setVersion('0.0.1')
    .addBearerAuth()
    .addTag('Pokemon API')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, testing ? '127.0.0.1' : '0.0.0.0');

  console.log(`Server in ${process.env.NODE_ENV} mode`);
  console.log(`Server is listening on :${port}/${globalPrefix}`);
  console.log(`Swagger: ${domain}/${globalPrefix}/docs`);
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
