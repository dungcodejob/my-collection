import { UserEntity } from '@common/entities';
import { provideUnitOfWork } from '@common/repositories';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { QueriesHandlers } from './queries';
import { UserMapper, UserService } from './services';

@Module({
  imports: [CqrsModule, MikroOrmModule.forFeature([UserEntity])],
  providers: [...QueriesHandlers, provideUnitOfWork(), UserService, UserMapper],
  exports: [UserService, UserMapper],
  controllers: [],
})
export class UserModule {}
