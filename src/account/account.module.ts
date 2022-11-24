import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";
import { DefaultAdminModule, DefaultAdminSite } from "nestjs-admin";
import { AccountService } from "./account.service";
import { AccountController } from "./account.controller";
import { Account } from "./entities/account.entity";
import { TransactionModule } from "@transaction/transaction.module";
import { UserModule } from "@user/user.module";
import { BillPaymentService } from "@api-services/bill-payment/bill-payment.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 10000,
        maxRedirects: 5,
      }),
    }),
    DefaultAdminModule,
    TransactionModule,
    UserModule,
  ],
  exports: [TypeOrmModule],
  controllers: [AccountController],
  providers: [AccountService, BillPaymentService],
})
export class AccountModule {
  constructor(private readonly adminSite: DefaultAdminSite) {
    this.adminSite.register("Account", Account);
  }
}
