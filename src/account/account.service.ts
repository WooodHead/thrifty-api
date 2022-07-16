import { CACHE_MANAGER, ConflictException, ForbiddenException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Any } from 'typeorm';
import { Cache } from 'cache-manager';
import { PaginateQuery, paginate, Paginated } from 'nestjs-paginate';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { DepositOrWithdrawMoneyDto, TransferFundsToExternalDto, TransferFundsToInternalDto } from './dto/common-account.dto';
import { User } from '../user/entities/user.entity';
import { Account } from './entities/account.entity';
import { TransactionStatus, TransactionType, TransactionMode } from '../transaction/interfaces/transaction.interface'
import { generateAccountNumber } from '../utils/generateAccountNumber';
import { Transaction } from '../transaction/entities/transaction.entity';
import { BillPaymentService } from '../services/bill-payment/bill-payment.service';
import { PayBillsDto } from 'src/services/bill-payment/dto/bill-payment.dto';
import { generateTransactionRef } from '../utils/generateTrsnactionRef';

@Injectable()
export class AccountService {

  constructor(
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly billPaymentService: BillPaymentService,
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
      throw new NotFoundException(`Account with accountNumber: ${accountNumber} not found on this server`);
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

  // Caching implemented at Sevice level
  async findAccountByUser(userId: string, query: PaginateQuery): Promise<Paginated<Account> | any> {
    try {

      const data = await this.cacheManager.get(`accounts-by-user/${userId}`);

      if (data) return { fromCache: true, data };

      // Query builder used here instead of findOptions to fix cannot query many-to-many relations error
      const queryBuilder = this.accountRepository
        .createQueryBuilder('account')
        .leftJoin('account.accountHolders', 'user')
        .where('user.id =:userId', { userId })

      const accounts = await paginate<Account>(query, queryBuilder, {
        sortableColumns: ['createdAt'],
        defaultSortBy: [['createdAt', 'DESC']]
      })

      await this.cacheManager.set(`accounts-by-user/${userId}`, accounts, { ttl: 300 })

      return accounts;

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

      throw new ForbiddenException(`Invalid user/account number combination`);
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

      if (!account) throw new ForbiddenException(`Invalid User/Account number combination`);
      
      // Credit the Respective Account
      account.accountBalance = +account.accountBalance + transactionAmount;
      account.bookBalance = +account.bookBalance + transactionAmount;
      await this.accountRepository.save(account);

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

      if (!account) throw new ForbiddenException(`Invalid User/Account number combination`);
      if (account.accountBalance < transactionAmount) throw new ForbiddenException(`Unable to process transaction, Insufficient funds`)
      
      // Debit the Respective Account
      account.accountBalance = +account.accountBalance - transactionAmount;
      account.bookBalance = +account.bookBalance - transactionAmount;
      await this.accountRepository.save(account);

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

      if (!account) throw new ForbiddenException(`fromAccount: Invalid User/Account number combination`);
      if (account.accountBalance < amountToTransfer) throw new ForbiddenException(`Unable to process transaction, Insufficient funds`)

      const toAccount = await this.accountRepository.findOneBy({
        accountNumber: +toInternalAccount,
        accountName: toInternalAccountName
      });

      if (!toAccount) throw new NotFoundException(`toAccount: Invalid Account number/name combination`);

      if (account.accountNumber === toAccount.accountNumber) throw new ConflictException('You cannot make transfers between the same account')

      // Debit and Credit Respective Accounts
      account.accountBalance = +account.accountBalance - amountToTransfer;
      account.bookBalance = +account.bookBalance - amountToTransfer;

      toAccount.accountBalance = +toAccount.accountBalance + amountToTransfer;
      toAccount.bookBalance = +toAccount.bookBalance + amountToTransfer;

      await this.accountRepository.save([account, toAccount]);

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

      if (!account) throw new ForbiddenException(`Invalid User/Account number combination`);
      if (account.accountBalance < amountToTransfer) throw new ForbiddenException(`Unable to process transaction, Insufficient funds`)

      // Debit the Respective internal account
      account.accountBalance = +account.accountBalance - amountToTransfer;
      account.bookBalance = +account.bookBalance - amountToTransfer;
      await this.accountRepository.save(account);

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

      return await this.transactionRepository.save(newTransaction);

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async billPayment(payBillDto: PayBillsDto, user: User, accountNumber: number) {

    // Search for account and check if there is sufficient balance to cover the transaction amount
    const account = await this.accountRepository.findOneBy({
      accountNumber,
      accountHolders: { id: user.id }
    });

    if (!account) throw new ForbiddenException(`Invalid User/Account number combination`);
    if (account.accountBalance < payBillDto.amount) throw new ForbiddenException(`Unable to process transaction, Insufficient funds`)

    // Initiate Payment Request with Third-Party Bill-Payment Provider
    payBillDto.reference = generateTransactionRef();
    const paymentDetails = await this.billPaymentService.payBills(payBillDto);

    if (paymentDetails.status === 'success') {
      // Debit Customer's Account
      account.accountBalance = +account.accountBalance - payBillDto.amount;
      account.bookBalance = +account.bookBalance - payBillDto.amount;
      await this.accountRepository.save(account);

      // Prepare and create transaction record
      const newTransaction = new Transaction();

      newTransaction.transactionDate = new Date()
      newTransaction.description = `Bill Payment of amount ${payBillDto.amount} made by ${user.firstName + ' ' + user.lastName}`;
      newTransaction.transactionAmount = payBillDto.amount;
      newTransaction.transactionMode = TransactionMode.DEBIT;
      newTransaction.transactionType = TransactionType.BILLPAYMENT;
      newTransaction.transactionStatus = TransactionStatus.SUCCESSFUL;
      newTransaction.fromAccount = account;
      newTransaction.billPaymentDetails = paymentDetails
      newTransaction.customer = user
      newTransaction.accountBalance = account.accountBalance;

      return await this.transactionRepository.save(newTransaction);
    }

    return { tx_status: 'IN PROGRESS', tx_ref: payBillDto.reference };
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

  async remove(accountNumber: number) {
    try {
      const accountToDelete = await this.accountRepository.findOneBy({ accountNumber })
      return await this.accountRepository.remove(accountToDelete)
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    };
  }
}
