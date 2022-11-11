import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultAdminModule } from 'nestjs-admin';
import { AuthService } from './auth.service';
import { LoggerModule } from '@logger/logger.module';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EmailService } from '@src/api-services/email/email.service';
import { ResetCode } from './entities/resetCode.entity';


@Module({
  imports: [
    LoggerModule,
    UserModule,
    PassportModule.register({
      session: false,
      defaultStrategy: 'jwt'
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        publicKey: configService.get<string>('ACCESS_TOKEN_PUBLIC_KEY'),
        privateKey: { key: configService.get<string>('ACCESS_TOKEN_PRIVATE_KEY'), passphrase: configService.get<string>('ACCESS_TOKEN_SECRET') },
        signOptions: { algorithm: 'RS256', audience: 'thrifty-api', expiresIn: '1h', issuer: 'thrifty-api'},
      }),
    }),
    TypeOrmModule.forFeature([ResetCode]),
    DefaultAdminModule,
  ],
  exports: [AuthService],
  providers: [
    AuthService,
    EmailService,
    LocalStrategy,
    JwtStrategy
  ],
  controllers: [AuthController],
})

export class AuthModule { }

