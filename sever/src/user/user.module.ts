import { UserEntity } from '@app/entities';
import { BcryptService } from '@app/services';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserMapper } from './user.mapper';
import { UserService } from './user.service';

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService, UserMapper, BcryptService],
  exports: [UserService, UserMapper],
})
export class UserModule {}
