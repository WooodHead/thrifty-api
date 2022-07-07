import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultAdminModule, DefaultAdminSite } from 'nestjs-admin';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { Account } from './entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), DefaultAdminModule],
  controllers: [AccountController],
  providers: [AccountService]
})
export class AccountModule {
  constructor(private readonly adminSite: DefaultAdminSite) {
    this.adminSite.register('Account', Account);
  }
}
