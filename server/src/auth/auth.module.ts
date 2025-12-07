import { jwtConfig } from '@app/configs';
import { BcryptService } from '@app/services';
import { TenantSharedModule } from '@app/tenant';
import { UserModule } from '@app/user';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccountSharedModule } from 'src/modules/account';
import { SessionModule } from 'src/modules/session';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BacklistService, JwtTokenService } from './services';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule,
    SessionModule,
    UserModule,
    TenantSharedModule,
    AccountSharedModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtTokenService,
    BacklistService,
    BcryptService,

    AccessTokenStrategy,
    RefreshTokenStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
