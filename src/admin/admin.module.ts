import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AccountModule } from '@account/account.module';
import { UserModule } from '@user/user.module';
import { BillPaymentService } from '@services/bill-payment/bill-payment.service';
import { TransactionModule } from '@transaction/transaction.module';

@Module({
  imports: [AccountModule, UserModule, TransactionModule],
  controllers: [AdminController],
  providers: [AdminService, BillPaymentService]
})
export class AdminModule { }
