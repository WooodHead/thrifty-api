import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaginateQuery } from 'nestjs-paginate';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UserDecorator } from '../user/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import {
  AccountIdDto,
  AccountNameDto,
  AccountNumberDto,
  DepositOrWithdrawMoneyDto,
  TransferFundsToInternalDto,
  TransferFundsToExternalDto
} from './dto/common-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/roles.guard';
import { Role } from '../user/interfaces/user.interface';
import { BillPaymentService } from '../services/bill-payment/bill-payment.service';
import { BillCategoryDto, PayBillsDto } from '../services/bill-payment/dto/bill-payment.dto';

@ApiTags('Account')
@Controller('/v1/accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly billPaymentService: BillPaymentService,
  ) { }

  @ApiBearerAuth()
  @Get('all')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  async findAll(@Query() query: PaginateQuery) {
    return await this.accountService.findAll(query);
  }

  // Global Caching disabled for this route, Caching is done at Service-level
  @ApiBearerAuth()
  @Get('get-account-by-user')
  @UseGuards(JwtAuthGuard)
  async findAccountByUser(@Query() query: PaginateQuery, @UserDecorator('id') id: string) {
    return await this.accountService.findAccountByUser(id, query);
  }

  @ApiBearerAuth()
  @Get('check-account-balance/:accountNumber')
  @UseGuards(JwtAuthGuard)
  async checkAccountBalance(@Param() params: AccountNumberDto, @UserDecorator('id') id: string) {
    const { accountNumber } = params
    return await this.accountService.checkAccountBalance(+accountNumber, id);
  }

  @ApiBearerAuth()
  @Get('get-by-account-number/:accountNumber')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  async findByAccountNumber(@Param() params: AccountNumberDto) {
    const { accountNumber } = params
    return await this.accountService.findByAccountNumber(+accountNumber);
  }

  @ApiBearerAuth()
  @Get('get-by-account-name/:accountName')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  async findByAccountName(@Param() params: AccountNameDto) {
    const { accountName } = params
    return await this.accountService.findByAccountName(accountName);
  }

  @Get('get-bill-payment-products')
  async getAllBillerCategories() {
    return await this.billPaymentService.getBillCategories();
  }

  @Get('get-bill-payment-products/:billType')
  async getFlutterwaveBiller(@Param() params: BillCategoryDto) {
    return await this.billPaymentService.getBillCategoryByType(params.billType);
  }

  @ApiBearerAuth()
  @Get('get-account-by-id/:id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  async findOne(@Param() params: AccountIdDto) {
    const { accountId } = params
    return await this.accountService.findOne(accountId);
  }

  @ApiBearerAuth()
  @Post('open-new-account')
  @UseGuards(JwtAuthGuard)
  async openAccount(@Body() createAccountDto: CreateAccountDto, @UserDecorator() user: User) {
    return await this.accountService.create(createAccountDto);
  }

  @ApiBearerAuth()
  @Post('deposit-funds')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async depositFunds(@Body() transactionInfo: DepositOrWithdrawMoneyDto, @UserDecorator() user: User) {
    return await this.accountService.depositFunds(transactionInfo, user)
  }

  @ApiBearerAuth()
  @Post('withdraw-funds')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async withdrawFunds(@Body() transactionInfo: DepositOrWithdrawMoneyDto, @UserDecorator() user: User) {
    return await this.accountService.withdrawFunds(transactionInfo, user)
  }

  @ApiBearerAuth()
  @Post('internal-transfer')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async internalTransfer(@Body() transferInternalDto: TransferFundsToInternalDto, @UserDecorator() user: User) {
    return await this.accountService.internalFundsTransfer(transferInternalDto, user)
  }

  @ApiBearerAuth()
  @Post('external-transfer')
  @UseGuards(JwtAuthGuard)
  async externalTransfer(@Body() transferExternalDto: TransferFundsToExternalDto, @UserDecorator() user: User) {
    return await this.accountService.externalFundsTransfer(transferExternalDto, user)
  }

  @ApiBearerAuth()
  @Post('bill-payment/:accountNumber')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async payBills(@Body() payBillDto: PayBillsDto, @Param() params: AccountNumberDto, @UserDecorator() user: User) {
    const { accountNumber } = params
    return await this.accountService.billPayment(payBillDto, user, +accountNumber)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(+id, updateAccountDto);
  }

  @Delete(':accountNumber')
  async remove(@Param('accountNumber') accountNumber: string) {
    return await this.accountService.remove(+accountNumber);
  }
}
