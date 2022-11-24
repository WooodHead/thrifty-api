import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { AccountModule } from "@account/account.module";
import { UserModule } from "@user/user.module";
import { BillPaymentService } from "@src/api-services/bill-payment/bill-payment.service";
import { TransactionModule } from "@transaction/transaction.module";
import { FeatureFlag } from "./entities/featureFlag.entity";
import { FeatureFlagService } from "./feature-flag/feature-flag.service";
import { SavingsGroupModule } from "@savings-group/savings-group.module";

@Module({
  imports: [
    AccountModule,
    UserModule,
    TransactionModule,
    forwardRef(() => SavingsGroupModule),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 10000,
        maxRedirects: 5,
      }),
    }),
    TypeOrmModule.forFeature([FeatureFlag]),
  ],
  exports: [FeatureFlagService],
  controllers: [AdminController],
  providers: [AdminService, BillPaymentService, FeatureFlagService],
})
export class AdminModule {}
