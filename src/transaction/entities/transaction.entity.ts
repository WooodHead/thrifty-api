import { Column, Entity, ManyToOne, BeforeInsert } from 'typeorm';
import { AbstractEntity } from '../../common/entities/abstract.entity';
import { User } from '../../user/entities/user.entity';
import { Account } from '../../account/entities/account.entity';
import { TransactionMode, TransactionType, TransactionStatus, IExternalAccount } from '../interfaces/transaction.interface';

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
  fromAccount: Account;

  @ManyToOne(() => Account, (account) => account.transactions, { nullable: true })
  toInternalAccount: Account;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  accountBalance: number;

  @Column('jsonb', { nullable: true })
  toExternalAccount: IExternalAccount;

  @Column('varchar', { length: 255, nullable: true })
  transactionRef: string;

  @BeforeInsert()
  addTransactionRef() {
    this.transactionRef = `${this.transactionType}-${this.transactionMode}-${this.transactionDate.getTime()}`;
  }

}
