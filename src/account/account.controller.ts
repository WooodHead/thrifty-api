import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaginateQuery } from 'nestjs-paginate';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UserDecorator } from '../user/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { AccountIdDto, AccountNumberDto, AccountNameDto, DepositOrWithdrawMoneyDto, TransferFundsToInternalDto, TransferFundsToExternalDto } from './dto/common-account.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) { }

  @ApiBearerAuth()
  @Get()
  findAll(@Query() query: PaginateQuery) {
    return this.accountService.findAll(query);
  }

  @ApiBearerAuth()
  @Get('get-account-by-user')
  @UseGuards(JwtAuthGuard)
  findAccountByUser(@Query() query: PaginateQuery, @UserDecorator('id') id: string,) {
    return this.accountService.findAccountByUser(id, query);
  }

  @ApiBearerAuth()
  @Get('check-account-balance/:accountNumber')
  @UseGuards(JwtAuthGuard)
  checkAccountBalance(@Param() params: AccountNumberDto, @UserDecorator('id') id: string) {
    const { accountNumber } = params
    return this.accountService.checkAccountBalance(+accountNumber, id);
  }

  @ApiBearerAuth()
  @Get('get-by-account-number/:accountNumber')
  @UseGuards(JwtAuthGuard)
  findByAccountNumber(@Param() params: AccountNumberDto) {
    const { accountNumber } = params
    return this.accountService.findByAccountNumber(+accountNumber);
  }

  @ApiBearerAuth()
  @Get('get-by-account-name/:accountName')
  @UseGuards(JwtAuthGuard)
  findByAccountName(@Param() params: AccountNameDto) {
    const { accountName } = params
    return this.accountService.findByAccountName(accountName);
  }

  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param() params: AccountIdDto) {
    const { accountId } = params
    return this.accountService.findOne(accountId);
  }

  @ApiBearerAuth()
  @Post('open-new-account')
  @UseGuards(JwtAuthGuard)
  openAccount(@Body() createAccountDto: CreateAccountDto, @UserDecorator() user: User) {
    return this.accountService.create(createAccountDto);
  }

  @ApiBearerAuth()
  @Post('deposit-funds')
  @UseGuards(JwtAuthGuard)
  depositFunds(@Body() transactionInfo: DepositOrWithdrawMoneyDto, @UserDecorator() user: User) {
    return this.accountService.depositFunds(transactionInfo, user)
  }

  @ApiBearerAuth()
  @Post('withdraw-funds')
  @UseGuards(JwtAuthGuard)
  withdrawFunds(@Body() transactionInfo: DepositOrWithdrawMoneyDto, @UserDecorator() user: User) {
    return this.accountService.withdrawFunds(transactionInfo, user)
  }

  @ApiBearerAuth()
  @Post('internal-transfer')
  @UseGuards(JwtAuthGuard)
  internalTransfer(@Body() transferInternalDto: TransferFundsToInternalDto, @UserDecorator() user: User) {
    return this.accountService.internalFundsTransfer(transferInternalDto, user)
  }

  @ApiBearerAuth()
  @Post('external-transfer')
  @UseGuards(JwtAuthGuard)
  externalTransfer(@Body() transferExternalDto: TransferFundsToExternalDto, @UserDecorator() user: User) {
    return this.accountService.externalFundsTransfer(transferExternalDto, user)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(+id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(+id);
  }
}
