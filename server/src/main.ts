import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig, appConfig } from './configs';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<AppConfig>(appConfig.KEY);
  app.enableCors({ credentials: true, origin: config.client });
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        }));
        return new BadRequestException(result);
      },
      stopAtFirstError: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  await app.listen(3000);

  console.log(`Server in ${process.env.NODE_ENV} mode`);
  console.log(`Server is listening on :${config.port}/${globalPrefix}`);
  console.log(`Swagger: ${config.domain}/${globalPrefix}/docs`);
}
bootstrap();
