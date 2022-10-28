import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AccountModule } from '@account/account.module';
import { UserModule } from '@user/user.module';
import { BillPaymentService } from '@services/bill-payment/bill-payment.service';
import { TransactionModule } from '@transaction/transaction.module';
import { FeatureFlag } from './entities/featureFlag.entity';
import { FeatureFlagService } from './feature-flag/feature-flag.service';


@Module({
  imports: [
    AccountModule,
    UserModule,
    TransactionModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 10000,
        maxRedirects: 5,
      }),
    }),
    TypeOrmModule.forFeature([FeatureFlag]),
  ],
  controllers: [AdminController],
  providers: [AdminService, BillPaymentService, FeatureFlagService]
})
export class AdminModule { }
