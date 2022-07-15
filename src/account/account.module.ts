import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultAdminModule, DefaultAdminSite } from 'nestjs-admin';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { Account } from './entities/account.entity';
import { TransactionModule } from '../transaction/transaction.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    DefaultAdminModule,
    TransactionModule,
    UserModule],
  controllers: [AccountController],
  providers: [AccountService]
})
export class AccountModule {
  constructor(private readonly adminSite: DefaultAdminSite) {
    this.adminSite.register('Account', Account);
  }
}
