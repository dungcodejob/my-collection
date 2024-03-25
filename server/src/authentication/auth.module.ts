import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from '@modules/user';
import { BcryptService } from './services/bcrypt.service';
import { JwtTokenGenerator } from './services/jwt-token-generator';
import { AccessTokenStrategy } from './strategies/access-token.strategy';

@Module({
  imports: [JwtModule, UserModule],
  providers: [JwtTokenGenerator, BcryptService, AccessTokenStrategy],
  exports: [JwtTokenGenerator, BcryptService],
})
export class AuthModule {}
