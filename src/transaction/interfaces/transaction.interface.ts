import { User } from "@user/entities/user.entity";
import { Account } from "@account/entities/account.entity";

export enum TransactionType {
  INSTANTTRANSFER = "INSTANT TRANSFER",
  BILLPAYMENT = "BILL PAYMENT",
  FUNDS_DEPOSIT = "FUNDS DEPOSIT",
  FUNDS_WITHDRAWAL = "FUNDS WITHDRAWAL",
}

export enum TransactionMode {
  DEBIT = "DEBIT",
  CREDIT = "CREDIT",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  SUCCESSFUL = "SUCCESSFUL",
  REVERSED = "REVERSED",
  REVERSAL_REQUESTED = "REVERSAL-REQUESTED",
  REVERSAL_APPROVED = "REVERSAL-APPROVED",
  REVERSAL_REJECTED = "REVERSAL-REJECTED",
  REVERSAL_CANCELLED = "REVERSAL-CANCELLED",
  REVERSAL_FAILED = "REVERSAL-FAILED",
  REVERSAL_SUCCESSFUL = "REVERSAL-SUCCESSFUL",
}

export interface IExternalAccount {
  accountNumber: number;
  accountName: string;
  accountType: string;
  bankName: string;
  bankCode: string;
  branchCode: string;
  branchName: string;
}

export interface IGenExtTxParams {
  debitAccount: Account;
  toExternalAccount: IExternalAccount;
  transactionAmount: number;
  user: User;
}

export interface IGenIntTxParams
  extends Omit<IGenExtTxParams, "toExternalAccount"> {
  creditAccount: Account;
  isDebit: boolean;
}

export interface IGenBillTxParams
  extends Omit<IGenExtTxParams, "toExternalAccount"> {
  paymentDetails: any;
}
