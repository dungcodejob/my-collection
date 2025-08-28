import { AccountModule } from '@app/account';
import { jwtConfig } from '@app/configs';
import { SessionModule } from '@app/session';
import { UserModule } from '@app/user';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BacklistService, BcryptService, JwtTokenService } from './services';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule,
    AccountModule,
    SessionModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtTokenService, BacklistService, BcryptService],
  exports: [AuthService],
})
export class AuthModule {}
