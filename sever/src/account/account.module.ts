import { AccountEntity } from '@app/entities';
import { provideUnitOfWork } from '@app/repositories';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AccountService } from './account.service';

@Module({
  imports: [MikroOrmModule.forFeature([AccountEntity])],
  providers: [AccountService, provideUnitOfWork()],
  exports: [AccountService],
})
export class AccountModule {}
