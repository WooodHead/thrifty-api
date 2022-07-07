import { CacheModule, Module } from '@nestjs/common';
import { DefaultAdminModule, AdminUserEntity } from 'nestjs-admin';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: ['dist/**/entities/*.entity.js', AdminUserEntity],
        migrations: ['dist/migrations/*.js'],
        migrationsTableName: 'migrations_history',
        synchronize: false,
        ssl: {
          rejectUnauthorized: false
        }
      }),
      inject: [ConfigService]
    }),

    FirebaseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        googleApplicationCredential: JSON.parse(configService.get('FIREBASE_CREDENTIALS'))
      }),
      inject: [ConfigService]
    }),

    CacheModule.register({
      isGlobal: true,
      ttl: 5,
      max: 10,
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

  constructor(private dataSource: DataSource) { }

}
