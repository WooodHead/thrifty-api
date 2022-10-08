import { BadRequestException, CACHE_MANAGER, ConflictException, ForbiddenException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
      const { accountBalance, bookBalance } = account;
      account.accountBalance = +accountBalance + transactionAmount;
      account.bookBalance = +bookBalance + transactionAmount;
      await this.accountRepository.save(account);

      // Prepare and create transaction record
      const newCreditTransaction = new Transaction();

      await newCreditTransaction.generateDepositTransaction(account, transactionAmount, transactionParty, user)

      return newCreditTransaction

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
        accountNumber: accountNumber,
        accountHolders: { id: user.id }
      });

      if (!account) throw new ForbiddenException(`Invalid User/Account number combination`);
      if (account.accountBalance < transactionAmount) throw new ForbiddenException(`Unable to process transaction, Insufficient funds`)

      // Debit the Respective Account
      const { accountBalance, bookBalance } = account;
      account.accountBalance = +accountBalance - transactionAmount;
      account.bookBalance = +bookBalance - transactionAmount;
      await this.accountRepository.save(account);

      // Prepare and create transaction record
      const newDebitTransaction = new Transaction();

      await newDebitTransaction.generateWithdrawalTransaction(account, transactionAmount, transactionParty, user)

      return newDebitTransaction

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
      const debitAccount = await this.accountRepository.findOneBy({
        accountNumber: fromAccount,
        accountHolders: { id: user.id }
      });

      if (!debitAccount) throw new ForbiddenException(`fromAccount: Invalid User/Account number combination`);
      if (debitAccount.accountBalance < amountToTransfer) throw new ForbiddenException(`Unable to process transaction, Insufficient funds`)

      const creditAccount = await this.accountRepository.findOneBy({
        accountNumber: toInternalAccount,
        accountName: toInternalAccountName
      });

      if (!creditAccount) throw new NotFoundException(`creditAccount: Invalid Account number/name combination`);

      if (debitAccount.accountNumber === creditAccount.accountNumber) throw new ConflictException('You cannot make transfers between the same account')

      // Debit and Credit Respective Accounts
      const { accountBalance, bookBalance } = debitAccount
      debitAccount.accountBalance = +accountBalance - amountToTransfer;
      debitAccount.bookBalance = +bookBalance - amountToTransfer;

      creditAccount.accountBalance = +creditAccount.accountBalance + amountToTransfer;
      creditAccount.bookBalance = +creditAccount.bookBalance + amountToTransfer;

      await this.accountRepository.save([debitAccount, creditAccount]);

      // Generate Credit and Debit Transaction for both Accounts
      const newDebitTransaction = new Transaction();
      const newCreditTransaction = new Transaction();

      await newDebitTransaction.generateInternalTransferTransaction(debitAccount, creditAccount, amountToTransfer, true, user)
      await newCreditTransaction.generateInternalTransferTransaction(debitAccount, creditAccount, amountToTransfer, false, user)

      return newDebitTransaction;

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
      const debitAccount = await this.accountRepository.findOneBy({
        accountNumber: fromAccount,
        accountHolders: { id: user.id }
      });

      if (!debitAccount) throw new BadRequestException(`Invalid User/Account number combination`);

      if (debitAccount.accountBalance < amountToTransfer) throw new ForbiddenException(`Unable to process transaction, Insufficient funds`)

      // Debit the Respective internal account
      const { accountBalance, bookBalance } = debitAccount
      debitAccount.accountBalance = +accountBalance - amountToTransfer;
      debitAccount.bookBalance = +bookBalance - amountToTransfer;

      await this.accountRepository.save(debitAccount);

      // Prepare and create transaction record
      const newDebitTransaction = new Transaction();

      await newDebitTransaction.generateExternalTransferTransaction(debitAccount, amountToTransfer, toExternalAccount, user)

      return newDebitTransaction;

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async billPayment(payBillDto: PayBillsDto, user: User) {

    const { accountNumber } = payBillDto;
    // Search for account and check if there is sufficient balance to cover the transaction amount
    const debitAccount = await this.accountRepository.findOneBy({
      accountNumber,
      accountHolders: { id: user.id }
    });

    if (!debitAccount) throw new BadRequestException(`Invalid User/Account number combination`);

    if (debitAccount.accountBalance < payBillDto.amount) throw new ForbiddenException(`Unable to process transaction, Insufficient funds`)

    // Initiate Payment Request with Third-Party Bill-Payment Provider
    payBillDto.reference = generateTransactionRef();
    const paymentDetails = await this.billPaymentService.payBills(payBillDto);

    if (paymentDetails.status === 'success') {

      // Debit Customer's Account
      const { accountBalance, bookBalance } = debitAccount
      debitAccount.accountBalance = +accountBalance - payBillDto.amount;
      debitAccount.bookBalance = +bookBalance - payBillDto.amount;

      await this.accountRepository.save(debitAccount);

      // Prepare and create transaction record
      const newDebitTransaction = new Transaction();

      await newDebitTransaction.generateBillPaymentTransaction(debitAccount, payBillDto, paymentDetails, user)

      return newDebitTransaction;
    }

    return { tx_status: 'IN PROGRESS', tx_ref: payBillDto.reference };
  }

  async create(createAccountDto: CreateAccountDto) {
    try {
      
      const { accountName, accountHolders } = createAccountDto;

      const allAccountNumbers = (await this.accountRepository.find({
        select: {
          accountNumber: true,
        }
      })).map(account => account.accountNumber);

      const newAccount = new Account();

      newAccount.accountName = accountName;
      newAccount.accountNumber = generateAccountNumber(allAccountNumbers);
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
