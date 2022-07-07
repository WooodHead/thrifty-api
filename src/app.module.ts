import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DefaultAdminModule, AdminUserEntity } from 'nestjs-admin';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseModule } from 'nestjs-firebase';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
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

    CacheModule.registerAsync<RedisClientOptions>({
      useFactory: async (configService: ConfigService) => ({
        
        isGlobal: true,
        ttl: 300,
        max: 1000,

        store: redisStore,
        url: configService.get<string>('REDIS_HOST_URL'),
        username: configService.get<string>('REDIS_USERNAME'),
        password: configService.get<string>('REDIS_PASSWORD'),
        database: configService.get<number>('REDIS_DATABASE'),
      }),
      inject: [ConfigService]
    }),

    AuthModule,
    DefaultAdminModule,
    UserModule,
    SavingsGroupModule,
    AccountModule,
    TransactionModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {

  constructor(private dataSource: DataSource) { }

}
