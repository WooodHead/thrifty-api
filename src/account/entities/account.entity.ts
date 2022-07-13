import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { AbstractEntity } from '../../common/entities/abstract.entity';
import { User } from '../../user/entities/user.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { AccountStatus, AccountType, AccountCurrency } from '../interfaces/account.interface';

@Entity()
export class Account extends AbstractEntity {

    @Column('int', { unique: true })
    accountNumber: number;

    @Column('varchar')
    accountName: string

    @Column('enum', { enum: AccountType, default: AccountType.INDIVIDUAL_SAVINGS })
    accountType: AccountType;

    @Column('enum', { enum: AccountCurrency, default: AccountCurrency.NGN })
    accountCurrency: AccountCurrency

    @Column('enum', { enum: AccountStatus, default: AccountStatus.ACTIVE })
    accountStatus: AccountStatus;

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    accountBalance: number;

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    bookBalance: number;

    @ManyToMany(() => User, user => user.accounts)
    @JoinTable()
    accountHolders: User[]

    @OneToMany(() => Transaction, (transactions) => transactions.fromAccount)
    transactions: Transaction[];
}
