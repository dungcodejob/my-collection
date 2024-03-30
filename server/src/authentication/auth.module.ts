import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from '@modules/user';
import { JwtUtil } from './services';
import { BcryptService } from './services/bcrypt.service';

@Module({
  imports: [JwtModule, UserModule],
  providers: [JwtUtil, BcryptService],
  exports: [JwtUtil, BcryptService],
})
export class AuthModule {}
