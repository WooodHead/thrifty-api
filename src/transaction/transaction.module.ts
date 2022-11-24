import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DefaultAdminModule, DefaultAdminSite } from "nestjs-admin";
import { TransactionService } from "./transaction.service";
import { TransactionController } from "./transaction.controller";
import { Transaction } from "./entities/transaction.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), DefaultAdminModule],
  exports: [TypeOrmModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {
  constructor(private readonly adminSite: DefaultAdminSite) {
    this.adminSite.register("Transaction", Transaction);
  }
}
