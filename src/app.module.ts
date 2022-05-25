import { Module } from '@nestjs/common';
import { DefaultAdminModule } from 'nestjs-admin';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, getConnectionOptions } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseModule } from 'nestjs-firebase';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SavingsGroupModule } from './savings-group/savings-group.module';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import configuration from './config/configuration';

const configService = new ConfigService(configuration);

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
    FirebaseModule.forRoot({
      googleApplicationCredential: JSON.parse(configService.get('FIREBASE_CREDENTIALS'))
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
})
export class AppModule {

  constructor(private connection: Connection) { }

}
