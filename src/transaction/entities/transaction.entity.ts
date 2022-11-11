import { Column, Entity, ManyToOne, BeforeInsert } from 'typeorm';
import { AbstractEntity } from '@common/entities/abstract.entity';
import { User } from '@user/entities/user.entity';
import { Account } from '@account/entities/account.entity';
import {
  TransactionMode,
  TransactionType,
  TransactionStatus,
  IExternalAccount,
  IGenExtTxParams,
  IGenIntTxParams,
  IGenBillTxParams
} from '../interfaces/transaction.interface';
import { PayBillsDto } from '@src/api-services/bill-payment/dto/bill-payment.dto';


@Entity()
export class Transaction extends AbstractEntity {

  @Column('timestamp without time zone')
  transactionDate: Date;

  @Column('varchar', { length: 255, default: '' })
  description: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  transactionAmount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  transactionCharges: number;

  @Column('enum', { enum: TransactionType, default: TransactionType.BILLPAYMENT })
  transactionType: TransactionType;

  @Column('enum', { enum: TransactionMode, default: TransactionMode.DEBIT })
  transactionMode: TransactionMode;

  @Column('enum', { enum: TransactionStatus, default: TransactionStatus.PENDING })
  transactionStatus: TransactionStatus;

  @ManyToOne(() => User, (user) => user.transactions)
  customer: User;

  @ManyToOne(() => Account, (account) => account.transactions, { nullable: true })
  account: Account;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  accountBalance: number;

  @Column('jsonb', { nullable: true })
  toExternalAccount: IExternalAccount;

  @Column('jsonb', { nullable: true })
  billPaymentDetails: any;

  @Column('varchar', { length: 255, nullable: true })
  transactionRef: string;

  @BeforeInsert()
  addTransactionRef() {
    this.transactionRef = `${this.transactionType}-${this.transactionMode}-${this.transactionDate.getTime()}`;
  }

  public async generateDepositTransaction(
    account: Account,
    transactionAmount: number,
    transactionParty: string,
    user: User
  ) {

    this.transactionDate = new Date()
    this.description = `Deposit of ${transactionAmount} made by ${transactionParty}`;
    this.transactionAmount = transactionAmount;
    this.transactionMode = TransactionMode.CREDIT;
    this.transactionType = TransactionType.FUNDS_DEPOSIT;
    this.transactionStatus = TransactionStatus.SUCCESSFUL;
    this.account = account;
    this.customer = user
    this.accountBalance = account.accountBalance;

    await this.save()
  }

  public async generateWithdrawalTransaction(
    account: Account,
    transactionAmount: number,
    transactionParty: string,
    user: User
  ) {

    this.transactionDate = new Date()
    this.description = `Cash Withdrawal of ${transactionAmount} made by ${transactionParty}`;
    this.transactionAmount = transactionAmount;
    this.transactionMode = TransactionMode.DEBIT;
    this.transactionType = TransactionType.FUNDS_WITHDRAWAL;
    this.transactionStatus = TransactionStatus.SUCCESSFUL;
    this.account = account;
    this.customer = user
    this.accountBalance = account.accountBalance;

    await this.save()

  }

  public async generateInternalTransferTransaction({
    debitAccount,
    creditAccount,
    transactionAmount,
    isDebit,
    user
  }: IGenIntTxParams
  ) {

    const {
      accountBalance: debitAccountBalance,
      accountName: debitAccountName,
      accountNumber: debitAccountNumber
    } = debitAccount;

    const {
      accountBalance: creditAccountBalance,
      accountName: creditAccountName,
      accountNumber: creditAccountNumber
    } = creditAccount;

    const creditDescription = `CREDIT: Funds Transfer of ${transactionAmount} from ${debitAccountName} - ${debitAccountNumber}`
    const debitDescription = `DEBIT: Funds Transfer of ${transactionAmount} to ${creditAccountName} - ${creditAccountNumber}`

    this.transactionDate = new Date();
    this.description = isDebit ? debitDescription : creditDescription;
    this.transactionAmount = transactionAmount;
    this.transactionMode = isDebit ? TransactionMode.DEBIT : TransactionMode.CREDIT;
    this.transactionStatus = TransactionStatus.SUCCESSFUL;
    this.accountBalance = isDebit ? debitAccountBalance : creditAccountBalance;

    this.transactionMode = TransactionMode.DEBIT;
    this.transactionType = TransactionType.INSTANTTRANSFER;
    this.transactionStatus = TransactionStatus.SUCCESSFUL;
    this.account = isDebit ? debitAccount : creditAccount;
    this.customer = user;

    await this.save()

  };

  public async generateExternalTransferTransaction({
    debitAccount,
    transactionAmount,
    toExternalAccount,
    user
  }: IGenExtTxParams
  ) {

    const { accountName, accountNumber, accountBalance } = debitAccount;

    this.transactionDate = new Date()
    this.description = `Funds transfer of ${transactionAmount} from ${accountNumber} - ${accountName} 
      to ${toExternalAccount.bankName} - ${toExternalAccount.accountNumber} - ${toExternalAccount.accountName}`;
    this.transactionAmount = transactionAmount;
    this.transactionMode = TransactionMode.DEBIT;
    this.transactionType = TransactionType.INSTANTTRANSFER;
    this.transactionStatus = TransactionStatus.SUCCESSFUL;
    this.account = debitAccount;
    this.toExternalAccount = toExternalAccount;
    this.customer = user;
    this.accountBalance = accountBalance;

    await this.save();

  }

  public async generateBillPaymentTransaction({
    debitAccount,
    transactionAmount,
    paymentDetails,
    user
  }: IGenBillTxParams) {

    const { accountBalance } = debitAccount;
    const { firstName, lastName } = user;

    this.transactionDate = new Date()
    this.description = `Bill Payment of amount ${transactionAmount} made by ${firstName + ' ' + lastName}`;
    this.transactionAmount = transactionAmount;
    this.transactionMode = TransactionMode.DEBIT;
    this.transactionType = TransactionType.BILLPAYMENT;
    this.transactionStatus = TransactionStatus.SUCCESSFUL;
    this.account = debitAccount;
    this.billPaymentDetails = paymentDetails
    this.customer = user
    this.accountBalance = accountBalance;

    await this.save()

  }

}
