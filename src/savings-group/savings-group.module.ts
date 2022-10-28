import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultAdminModule, DefaultAdminSite } from 'nestjs-admin';
import { SavingsGroupService } from './savings-group.service';
import { SavingsGroupController } from './savings-group.controller';
import { SavingsGroup } from './entities/savings-group.entity';
import { UserModule } from '@user/user.module';
import { UserToSavingsGroup } from '@common/entities/user-to-savingsgroup.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavingsGroup, UserToSavingsGroup]), 
    DefaultAdminModule, 
    UserModule
  ],
  exports: [TypeOrmModule],
  controllers: [SavingsGroupController],
  providers: [SavingsGroupService]
})
export class SavingsGroupModule {
  constructor(private readonly adminSite: DefaultAdminSite) {
    this.adminSite.register('SavingsGroup', SavingsGroup);
  }
}
