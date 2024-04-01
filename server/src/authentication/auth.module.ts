import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from '@modules/user';
import { AccessTokenGuard, RefreshTokenGuard } from './guards';
import { JwtUtil } from './services';
import { BcryptService } from './services/bcrypt.service';

@Module({
  imports: [JwtModule, UserModule],
  providers: [JwtUtil, BcryptService, AccessTokenGuard, RefreshTokenGuard],
  exports: [JwtUtil, BcryptService, AccessTokenGuard, RefreshTokenGuard],
})
export class AuthModule {}
