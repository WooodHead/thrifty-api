import {
  CacheModule,
  Module,
  MiddlewareConsumer,
  NestModule,
} from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { DefaultAdminModule, AdminUserEntity } from "nestjs-admin";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { FirebaseModule } from "nestjs-firebase";
import { RedisClientOptions } from "redis";
import * as redisStore from "cache-manager-redis-store";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { SavingsGroupModule } from "./savings-group/savings-group.module";
import { AccountModule } from "./account/account.module";
import { TransactionModule } from "./transaction/transaction.module";
import { User } from "./user/entities/user.entity";
import { Account } from "./account/entities/account.entity";
import { Transaction } from "./transaction/entities/transaction.entity";
import { SavingsGroup } from "./savings-group/entities/savings-group.entity";
import { UserToSavingsGroup } from "./common/entities/user-to-savingsgroup.entity";
import { ResetCode } from "./auth/entities/resetCode.entity";
import { HttpCacheInterceptor } from "./common/interceptors/http-cache-interceptor";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AdminModule } from "./admin/admin.module";
import { LoggerModule } from "./logger/logger.module";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";
import { HealthModule } from "./health/health.module";
import configuration from "./config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_DATABASE"),
        entities: [
          Account,
          SavingsGroup,
          Transaction,
          User,
          UserToSavingsGroup,
          ResetCode,
          AdminUserEntity,
        ],
        migrations: ["dist/migrations/*.js"],
        migrationsTableName: "migrations_history",
        synchronize: false,
        ssl: {
          rejectUnauthorized: false,
        },
        connectTimeoutMS: 2000,
      }),
      inject: [ConfigService],
    }),

    FirebaseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        googleApplicationCredential: JSON.parse(
          configService.get("FIREBASE_CREDENTIALS")
        ),
      }),
      inject: [ConfigService],
    }),

    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        ttl: 300,
        max: 1000,

        store: redisStore,
        url: configService.get<string>("REDIS_HOST_URL"),
        username: configService.get<string>("REDIS_USERNAME"),
        password: configService.get<string>("REDIS_PASSWORD"),
        name: configService.get<string>("REDIS_DATABASE_NAME"),
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),

    AuthModule,
    DefaultAdminModule,
    UserModule,
    SavingsGroupModule,
    AccountModule,
    TransactionModule,
    AdminModule,
    LoggerModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor, // Custom CacheInterceptor used here
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private dataSource: DataSource) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
