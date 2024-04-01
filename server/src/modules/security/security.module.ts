import { AuthModule } from '@authentication/index';
import { UserModule } from '@modules/user';
import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';

@Module({
  imports: [AuthModule, UserModule],
  providers: [SecurityService],
  controllers: [SecurityController],
  exports: [],
})
export class SecurityModule {}
