import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultAdminModule, DefaultAdminSite } from 'nestjs-admin';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User]), DefaultAdminModule],
  exports: [UserService, TypeOrmModule],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {
  constructor(private readonly adminSite: DefaultAdminSite) {
    this.adminSite.register('User', User);
  }
}
