import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import { Account } from '@account/entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@user/entities/user.entity';
import { Transaction } from '@transaction/entities/transaction.entity';


@Injectable()
export class AdminService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
    @InjectRepository(Account) private readonly transactionRepository: Repository<Transaction>
  ) { }

  async findAllUsers(query: PaginateQuery): Promise<Paginated<User>> {
    try {

      return await paginate(query, this.userRepository, {
        sortableColumns: ['createdAt'],
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'createdAt',
          'lastLogin',
          'updatedAt'
        ],
        defaultSortBy: [['createdAt', 'DESC']],
      });

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllAccounts(query: PaginateQuery): Promise<Paginated<Account>> {
    try {

      return await paginate(query, this.accountRepository, {
        sortableColumns: ['createdAt'],
        defaultSortBy: [['createdAt', 'DESC']],
      });

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAccountByID(id: string): Promise<Account> {
    try {

      const account = await this.accountRepository.findOneBy({ id });

      if (account) return account

      throw new NotFoundException(`Account with ID: ${id} not found`);

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllTransactions(query: PaginateQuery): Promise<Paginated<Transaction>> {
    try {

      return await paginate(query, this.transactionRepository, {
        sortableColumns: ['createdAt'],
        defaultSortBy: [['createdAt', 'DESC']],
      });

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findTransactionByID(id: string): Promise<Transaction> {
    try {

      const transaction = await this.transactionRepository.findOneBy({ id });

      if (transaction) return transaction;

      throw new NotFoundException(`Transaction with ID: ${id} not found`);

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
