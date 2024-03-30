import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from '@modules/user';
import { JwtUtil } from './services';
import { BcryptService } from './services/bcrypt.service';
import { RefreshTokenStrategy } from './strategies';
import { AccessTokenStrategy } from './strategies/access-token.strategy';

@Module({
  imports: [JwtModule, UserModule],
  providers: [
    JwtUtil,
    BcryptService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  exports: [JwtUtil, BcryptService],
})
export class AuthModule {}
