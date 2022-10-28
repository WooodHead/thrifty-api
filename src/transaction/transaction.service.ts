import { HttpException, Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { PaginateQuery, paginate, Paginated } from 'nestjs-paginate';
import { Transaction } from './entities/transaction.entity';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import {
  TransactionDateDto,
  TransactionDateRangeDto,
  TransactionAccountDateDto,
  TransactionAccountDateRangeDto
} from './dto/common-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) { }

  async findByUser(userId: string, query: PaginateQuery): Promise<Paginated<Transaction>> {
    try {
      return await paginate(query, this.transactionRepository, {
        sortableColumns: ['createdAt'],
        defaultSortBy: [['createdAt', 'DESC']],
        where: { customer: { id: userId } },
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByUserAndDate(
    userId: string,
    searchDate: Date,
    query: PaginateQuery
  ): Promise<Paginated<Transaction>> {
    try {

      const endDate = new Date(searchDate).getTime() + 86400000;

      return await paginate(query, this.transactionRepository, {
        sortableColumns: ['createdAt'],
        defaultSortBy: [['createdAt', 'DESC']],
        where: {
          customer: { id: userId },
          createdAt: Between(new Date(searchDate), new Date(endDate))
        },
      });

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByUserAndDateRange(
    userId: string, DateRangeDto:
      TransactionDateRangeDto,
    query: PaginateQuery
  ): Promise<Paginated<Transaction>> {
    try {

      const { fromDate, toDate } = DateRangeDto;

      return await paginate(query, this.transactionRepository, {
        sortableColumns: ['createdAt'],
        defaultSortBy: [['createdAt', 'DESC']],
        where: {
          customer: { id: userId },
          createdAt: Between(new Date(fromDate), new Date(toDate))
        },
      });

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByAccountAndUser(accountId: string, userID: string, query: PaginateQuery): Promise<Paginated<Transaction>> {
    try {

      return await paginate(query, this.transactionRepository, {
        sortableColumns: ['createdAt'],
        defaultSortBy: [['createdAt', 'DESC']],
        where: {
          account: { id: accountId },
          customer: { id: userID }
        },
      });

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByAccountUserAndDate(
    transactionDateDto: TransactionAccountDateDto,
    query: PaginateQuery,
    userID: string
  ): Promise<Paginated<Transaction>> {
    try {

      const { accountID, searchDate } = transactionDateDto

      const endDate = new Date(searchDate).getTime() + 86400000;

      return await paginate(query, this.transactionRepository, {
        sortableColumns: ['createdAt'],
        defaultSortBy: [['createdAt', 'DESC']],
        where: {
          account: { id: accountID },
          customer: { id: userID },
          createdAt: Between(new Date(searchDate), new Date(endDate))
        },
      });

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByAccountUserAndDateRange(
    dateRangeDto: TransactionAccountDateRangeDto,
    query: PaginateQuery,
    userID: string
  ): Promise<Paginated<Transaction>> {
    try {

      const { accountID, fromDate, toDate } = dateRangeDto;

      return await paginate(query, this.transactionRepository, {
        sortableColumns: ['createdAt'],
        defaultSortBy: [['createdAt', 'DESC']],
        where: {
          account: { id: accountID },
          customer: { id: userID },
          createdAt: Between(new Date(fromDate), new Date(toDate)),
        },
      });

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    try {
      const transaction = await this.transactionRepository.findOneBy({ id });
      if (transaction) {
        await this.transactionRepository.update(id, updateTransactionDto);
      }
      throw new NotFoundException(`Transaction with ${id} not found`);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
