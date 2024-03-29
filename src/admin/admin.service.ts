import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginateQuery, Paginated, paginate } from "nestjs-paginate";
import { Between, Repository } from "typeorm";
import { Account } from "@account/entities/account.entity";
import { User } from "@user/entities/user.entity";
import { Transaction } from "@transaction/entities/transaction.entity";
import { TransactionDateRangeDto } from "@transaction/dto/common-transaction.dto";
import { SavingsGroup } from "@savings-group/entities/savings-group.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(SavingsGroup)
    private readonly savingsGroupRepository: Repository<SavingsGroup>
  ) {}

  async findAllUsers(query: PaginateQuery): Promise<Paginated<User>> {
    try {
      return await paginate(query, this.userRepository, {
        sortableColumns: ["createdAt"],
        select: [
          "id",
          "email",
          "firstName",
          "lastName",
          "createdAt",
          "lastLogin",
          "updatedAt",
        ],
        defaultSortBy: [["createdAt", "DESC"]],
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? "SOMETHING WENT WRONG",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAllAccounts(query: PaginateQuery): Promise<Paginated<Account>> {
    try {
      return await paginate(query, this.accountRepository, {
        sortableColumns: ["createdAt"],
        defaultSortBy: [["createdAt", "DESC"]],
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? "SOMETHING WENT WRONG",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAccountByID(id: string): Promise<Account> {
    try {
      const account = await this.accountRepository.findOneBy({ id });

      if (account) return account;

      throw new NotFoundException(`Account with ID: ${id} not found`);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? "SOMETHING WENT WRONG",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAllTransactions(
    query: PaginateQuery
  ): Promise<Paginated<Transaction>> {
    try {
      return await paginate(query, this.transactionRepository, {
        sortableColumns: ["createdAt"],
        defaultSortBy: [["createdAt", "DESC"]],
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? "SOMETHING WENT WRONG",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
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
        error.message ?? "SOMETHING WENT WRONG",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findTransactionByDate(
    searchDate: Date,
    query: PaginateQuery
  ): Promise<Paginated<Transaction>> {
    try {
      const endDate = new Date(searchDate).getTime() + 86400000;

      return await paginate(query, this.transactionRepository, {
        sortableColumns: ["createdAt"],
        defaultSortBy: [["createdAt", "DESC"]],
        where: { createdAt: Between(new Date(searchDate), new Date(endDate)) },
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? "SOMETHING WENT WRONG",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findTransactionByDateRange(
    dateRangeDto: TransactionDateRangeDto,
    query: PaginateQuery
  ): Promise<Paginated<Transaction>> {
    try {
      const { fromDate, toDate } = dateRangeDto;

      return await paginate(query, this.transactionRepository, {
        sortableColumns: ["createdAt"],
        defaultSortBy: [["createdAt", "DESC"]],
        where: { createdAt: Between(new Date(fromDate), new Date(toDate)) },
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? "SOMETHING WENT WRONG",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAllSavingsGroups(
    query: PaginateQuery
  ): Promise<Paginated<SavingsGroup>> {
    try {
      return await paginate(query, this.savingsGroupRepository, {
        sortableColumns: ["createdAt"],
        defaultSortBy: [["createdAt", "DESC"]],
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? "SOMETHING WENT WRONG",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findSavingsGroupByID(id: string): Promise<SavingsGroup> {
    try {
      const savingsGroup = await this.savingsGroupRepository
        .createQueryBuilder("savingsGroup")
        .where("savingsGroup.id = :id", { id })
        .leftJoinAndSelect("savingsGroup.groupAdmin", "groupAdmin")
        .select([
          "savingsGroup.id",
          "savingsGroup.groupName",
          "savingsGroup.groupType",
          "savingsGroup.groupDescription",
          "savingsGroup.createdAt",
          "savingsGroup.updatedAt",
          "groupAdmin.id",
        ])
        .leftJoinAndSelect("savingsGroup.groupMembers", "groupMembers")
        .getOne();

      if (savingsGroup) return savingsGroup;

      throw new NotFoundException(
        `Transaction with ID: ${id} not found on this server`
      );
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? "SOMETHING WENT WRONG",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
