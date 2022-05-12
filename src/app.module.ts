import { Module } from '@nestjs/common';
import { DefaultAdminModule } from 'nestjs-admin';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, getConnectionOptions } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SavingsGroupModule } from './savings-group/savings-group.module';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import configuration from './config/configuration';
// import { APP_GUARD } from '@nestjs/core';
// import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration]
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        Object.assign(await getConnectionOptions(), {
          autoLoadEntities: true,
          useUnifiedTopology: true,
        }),
    }),
    AuthModule,
    DefaultAdminModule,
    UserModule,
    SavingsGroupModule,
    AccountModule,
    TransactionModule
  ],
  controllers: [AppController],
  providers: [AppService],
  // providers: [AppService, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {

  constructor(private connection: Connection) { }

}
