import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Any } from 'typeorm';
import { PaginateQuery, paginate, Paginated } from 'nestjs-paginate';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { DepositOrWithdrawMoneyDto } from './dto/common-account.dto';
import { User } from '../user/entities/user.entity';
import { Account } from './entities/account.entity';
import { TransactionService } from '../transaction/transaction.service';
import { CreateTransactionDto } from '../transaction/dto/create-transaction.dto';
import { TransactionStatus, TransactionType, TransactionMode } from '../transaction/interfaces/transaction.interface'
import { generateAccountNumber } from '../utils/generateAccountNumber';

@Injectable()
export class AccountService {

  constructor(
    private transactionService: TransactionService,
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }

  async findAll(query: PaginateQuery): Promise<Paginated<Account>> {
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

  async findOne(id: string): Promise<Account> {
    try {
      const account = await this.accountRepository.findOneBy({ id });
      if (!account)
        throw new NotFoundException(
          `Account with ID: ${id} not found on this server`,
        );
      return account;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByAccountNumber(accountNumber: number) {
    try {
      const account = await this.accountRepository.findOneBy({ accountNumber });
      if (account) return account;
      throw new NotFoundException(`Account with name: ${name} not found on this server`);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByName(name: string) {
    try {
      const account = await this.accountRepository.findOneBy({ accountName: name });
      if (account) return account;
      throw new NotFoundException(`Account with name: ${name} not found on this server`);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByUser(userId: string, query: PaginateQuery): Promise<Paginated<Account>> {
    try {
      return await paginate(query, this.accountRepository, {
        sortableColumns: ['createdAt'],
        defaultSortBy: [['createdAt', 'DESC']],
        where: { accountHolders: { id: userId } },
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkAccountBalance(accountNumber: number, userId: string) {
    try {
      const account = await this.accountRepository.findOneBy({
        accountNumber,
        accountHolders: { id: userId }
      });

      if (account) return account.accountBalance;

      throw new NotFoundException(`Invalid user/account number combination`);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async depositMoney(transactionInfo: DepositOrWithdrawMoneyDto, userId: string) {
    try {
      const { accountNumber, transactionAmount, transactionParty } = transactionInfo;

      // Search for account and add transaction amout to account balance
      const account = await this.accountRepository.findOneBy({
        accountNumber: +accountNumber,
        accountHolders: { id: userId }
      });

      if (!account) throw new NotFoundException(`Invalid User/Account number combination`);
      account.accountBalance += transactionAmount;
      account.bookBalance += transactionAmount;

      // Prepare and create transaction record
      const newTransaction = new CreateTransactionDto();

      newTransaction.description = `Deposit of ${transactionAmount} made by ${transactionParty}`;
      newTransaction.transactionAmount = transactionAmount;
      newTransaction.user = await this.userRepository.findOneBy({ id: userId })
      newTransaction.toInternalAccount = account;
      newTransaction.transactionStatus = TransactionStatus.SUCCESSFUL;
      newTransaction.transactionType = TransactionType.FUNDS_DEPOSIT;
      newTransaction.transactionMode = TransactionMode.CREDIT;
      newTransaction.accountBalance = account.accountBalance;

      await account.save();

      return await this.transactionService.create(newTransaction);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async withdrawMoney(transactionInfo: DepositOrWithdrawMoneyDto, userId: string) {
    try {
      const { accountNumber, transactionAmount, transactionParty } = transactionInfo;
      // Search for account and add transaction amout to account balance
      const account = await this.accountRepository.findOneBy({
        accountNumber: +accountNumber,
        accountHolders: { id: userId }
      });

      if (!account) throw new NotFoundException(`Invalid User/Account number combination`);

      if (account.accountBalance < transactionAmount) throw new ForbiddenException(`Unable to process transaction, Insufficient funds`)
      account.accountBalance -= transactionAmount;
      account.bookBalance -= transactionAmount;

      // Prepare and create transaction record
      const newTransaction = new CreateTransactionDto();

      newTransaction.description = `cash Withdrawal of ${transactionAmount} made by ${transactionParty}`;
      newTransaction.transactionAmount = transactionAmount;
      newTransaction.user = await this.userRepository.findOneBy({ id: userId })
      newTransaction.toInternalAccount = account;
      newTransaction.transactionStatus = TransactionStatus.SUCCESSFUL;
      newTransaction.transactionType = TransactionType.FUNDS_WITHDRAWAL;
      newTransaction.transactionMode = TransactionMode.DEBIT;
      newTransaction.accountBalance = account.accountBalance;

      await account.save();

      return await this.transactionService.create(newTransaction);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(createAccountDto: CreateAccountDto) {
    try {
      const { accountName, accountHolders, openingBalance } = createAccountDto;
      const allAccounts = (await this.accountRepository.find()).map(account => account.accountNumber);

      const newAccount = new Account();

      newAccount.accountName = accountName;
      newAccount.accountNumber = generateAccountNumber(allAccounts);
      newAccount.accountBalance = openingBalance;
      newAccount.bookBalance = openingBalance;
      newAccount.accountHolders = await this.userRepository.findBy({ id: Any(accountHolders) });
      newAccount.accountType = createAccountDto.accountType;

      return await this.accountRepository.save(newAccount);

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
