import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestMiddleware } from './request.middleware';

@Module({})
export class RequestMiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestMiddleware).forRoutes('{*splat}');
  }
}
