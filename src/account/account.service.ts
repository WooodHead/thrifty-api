import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Any } from 'typeorm';
import { PaginateQuery, paginate, Paginated } from 'nestjs-paginate';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { DepositOrWithdrawMoneyDto, TransferFundsToExternalDto, TransferFundsToInternalDto } from './dto/common-account.dto';
import { User } from '../user/entities/user.entity';
import { Account } from './entities/account.entity';
import { TransactionStatus, TransactionType, TransactionMode } from '../transaction/interfaces/transaction.interface'
import { generateAccountNumber } from '../utils/generateAccountNumber';
import { Transaction } from '../transaction/entities/transaction.entity';

@Injectable()
export class AccountService {

  constructor(
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
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

  async findByAccountName(name: string) {
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

  async findAccountByUser(userId: string, query: PaginateQuery): Promise<Paginated<Account>> {
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

  async depositFunds(transactionInfo: DepositOrWithdrawMoneyDto, user: User) {
    try {
      const { accountNumber, transactionAmount, transactionParty } = transactionInfo;

      // Search for account and add transaction amout to account balance
      const account = await this.accountRepository.findOneBy({
        accountNumber: +accountNumber,
        accountHolders: { id: user.id }
      });

      if (!account) throw new NotFoundException(`Invalid User/Account number combination`);
      account.accountBalance = +account.accountBalance + transactionAmount;
      account.bookBalance = +account.accountBalance + transactionAmount;

      // Prepare and create transaction record
      const newTransaction = new Transaction();

      newTransaction.transactionDate = new Date()
      newTransaction.description = `Deposit of ${transactionAmount} made by ${transactionParty}`;
      newTransaction.transactionAmount = transactionAmount;
      newTransaction.transactionMode = TransactionMode.CREDIT;
      newTransaction.transactionType = TransactionType.FUNDS_DEPOSIT;
      newTransaction.transactionStatus = TransactionStatus.SUCCESSFUL;
      newTransaction.toInternalAccount = account;
      newTransaction.customer = user
      newTransaction.accountBalance = account.accountBalance;

      await this.accountRepository.save(account);

      return await this.transactionRepository.save(newTransaction);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async withdrawFunds(transactionInfo: DepositOrWithdrawMoneyDto, user: User) {
    try {

      const { accountNumber, transactionAmount, transactionParty } = transactionInfo;

      // Search for account and add transaction amout to account balance
      const account = await this.accountRepository.findOneBy({
        accountNumber: +accountNumber,
        accountHolders: { id: user.id }
      });

      if (!account) throw new NotFoundException(`Invalid User/Account number combination`);

      if (account.accountBalance < transactionAmount) throw new ForbiddenException(`Unable to process transaction, Insufficient funds`)
      account.accountBalance = +account.accountBalance - transactionAmount;
      account.bookBalance = +account.accountBalance - transactionAmount;

      // Prepare and create transaction record
      const newTransaction = new Transaction();

      newTransaction.transactionDate = new Date()
      newTransaction.description = `cash Withdrawal of ${transactionAmount} made by ${transactionParty}`;
      newTransaction.transactionAmount = transactionAmount;
      newTransaction.transactionMode = TransactionMode.DEBIT;
      newTransaction.transactionType = TransactionType.FUNDS_WITHDRAWAL;
      newTransaction.transactionStatus = TransactionStatus.SUCCESSFUL;
      newTransaction.fromAccount = account;
      newTransaction.customer = user
      newTransaction.accountBalance = account.accountBalance;

      await this.accountRepository.save(account);

      return await this.transactionRepository.save(newTransaction);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async internalFundsTransfer(transferInternalDto: TransferFundsToInternalDto, user: User) {
    try {
      const { fromAccount, toInternalAccount, toInternalAccountName, amountToTransfer } = transferInternalDto;

      // Search for account and add transaction amout to account balance
      const account = await this.accountRepository.findOneBy({
        accountNumber: +fromAccount,
        accountHolders: { id: user.id }
      });

      if (!account) throw new NotFoundException(`Invalid User/Account number combination`);
      if (account.accountBalance < amountToTransfer) throw new ForbiddenException(`Unable to process transaction, Insufficient funds`)

      const toAccount = await this.accountRepository.findOneBy({
        accountNumber: +toInternalAccount,
        accountName: toInternalAccountName
      });

      if (!toAccount) throw new NotFoundException(`Invalid Account number/name combination`);

      // Adjust both accounts
      account.accountBalance = +account.accountBalance - amountToTransfer;
      account.bookBalance = +account.accountBalance - amountToTransfer;

      toAccount.accountBalance = +toAccount.accountBalance + amountToTransfer;
      toAccount.bookBalance = +toAccount.accountBalance + amountToTransfer;

      // Prepare and create transaction record
      const newTransaction = new Transaction();

      newTransaction.transactionDate = new Date()
      newTransaction.description = `Funds transfer of ${amountToTransfer} from ${fromAccount} - ${account.accountName} to ${toInternalAccount} - ${toAccount.accountName}`;
      newTransaction.transactionAmount = amountToTransfer;
      newTransaction.transactionMode = TransactionMode.DEBIT;
      newTransaction.transactionType = TransactionType.INSTANTTRANSFER;
      newTransaction.transactionStatus = TransactionStatus.SUCCESSFUL;
      newTransaction.fromAccount = account;
      newTransaction.toInternalAccount = toAccount;
      newTransaction.customer = user;
      newTransaction.accountBalance = account.accountBalance;

      await this.accountRepository.save([account, toAccount]);

      return await this.transactionRepository.save(newTransaction);

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async externalFundsTransfer(transferExternalDto: TransferFundsToExternalDto, user: User) {
    try {
      const { fromAccount, toExternalAccount, amountToTransfer } = transferExternalDto;

      // Search for account and add transaction amout to account balance
      const account = await this.accountRepository.findOneBy({
        accountNumber: +fromAccount,
        accountHolders: { id: user.id }
      });

      if (!account) throw new NotFoundException(`Invalid User/Account number combination`);
      if (account.accountBalance < amountToTransfer) throw new ForbiddenException(`Unable to process transaction, Insufficient funds`)

      // Deduct Funds from internal account
      account.accountBalance = +account.accountBalance - amountToTransfer;
      account.bookBalance = +account.accountBalance - amountToTransfer;

      // Prepare and create transaction record
      const newTransaction = new Transaction();

      newTransaction.transactionDate = new Date()
      newTransaction.description = `Funds transfer of ${amountToTransfer} from ${fromAccount} - ${account.accountName} to ${toExternalAccount.bankName} - ${toExternalAccount.accountNumber} - ${toExternalAccount.accountName}`;
      newTransaction.transactionAmount = amountToTransfer;
      newTransaction.transactionMode = TransactionMode.DEBIT;
      newTransaction.transactionType = TransactionType.INSTANTTRANSFER;
      newTransaction.transactionStatus = TransactionStatus.SUCCESSFUL;
      newTransaction.fromAccount = account;
      newTransaction.toExternalAccount = toExternalAccount;
      newTransaction.customer = user;
      newTransaction.accountBalance = account.accountBalance;

      await this.accountRepository.save(account);

      return await this.transactionRepository.save(newTransaction);

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
