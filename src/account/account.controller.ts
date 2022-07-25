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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
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

@Controller('accounts')
@ApiTags('Account')
@ApiBearerAuth()
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly billPaymentService: BillPaymentService,
  ) { }

  @Get('all')
  @ApiOperation({
    description: 'Returns All Accounts on the Server, only Users with Admin Privileges can make a successful request to this endpoint. Request can be paginated'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All Accounts on the server returned',
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'User does not have the Required Permission for the requested operation'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  async findAll(@Query() query: PaginateQuery) {
    return await this.accountService.findAll(query);
  }

  // Global Caching disabled for this route, Caching is done at Service-level
  @Get('get-account-by-user')
  @ApiOperation({
    description: 'Returns All Accounts for a specified user'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All Accounts for the specified user on the server returned',
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  @UseGuards(JwtAuthGuard)
  async findAccountByUser(@Query() query: PaginateQuery, @UserDecorator('id') id: string) {
    return await this.accountService.findAccountByUser(id, query);
  }

  @Get('check-account-balance/:accountNumber')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Returns the account balance of the specified account. Only authenticated users can call this endpoint and users can only query accounts belonging to them.'
  })
  @ApiOkResponse({
    description: 'SUCCESS: Balance on the specified account returned',
  })
  @ApiBadRequestResponse({
    description: 'Request Parameter is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'User supplied an account number not belonging to them'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async checkAccountBalance(@Param() params: AccountNumberDto, @UserDecorator('id') id: string) {
    const { accountNumber } = params
    return await this.accountService.checkAccountBalance(+accountNumber, id);
  };

  @Get('get-by-account-number/:accountNumber')
  @ApiOperation({
    description: 'Searches for an account by account number. Admin privileges required to call this endpoint'
  })
  @ApiOkResponse({
    description: 'SUCCESS: Account with the specified account number on the server returned'
  })
  @ApiBadRequestResponse({
    description: 'Request Parameter is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'User does not have the Required Permission for the requested operation'
  })
  @ApiNotFoundResponse({
    description: 'Project with the specified name does not exist on the server'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  async findByAccountNumber(@Param() params: AccountNumberDto) {
    const { accountNumber } = params
    return await this.accountService.findByAccountNumber(+accountNumber);
  };

  @Get('get-by-account-name/:accountName')
  @ApiOperation({
    description: 'Searches for an account by account name. Admin privileges required to call this endpoint'
  })
  @ApiOkResponse({
    description: 'SUCCESS: Account with the specified account name on the server returned'
  })
  @ApiBadRequestResponse({
    description: 'Request Parameter is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'User does not have the Required Permission for the requested operation'
  })
  @ApiNotFoundResponse({
    description: 'Project with the specified name does not exist on the server'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  async findByAccountName(@Param() params: AccountNameDto) {
    const { accountName } = params
    return await this.accountService.findByAccountName(accountName);
  }

  @Get('get-bill-payment-products')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Returns all Product types for making bill payments. Admin privileges required to call this endpoint'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All available bill payment product types returned'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'User does not have the Required Permission for the requested operation'
  })
  @ApiNotFoundResponse({
    description: 'Project with the specified name does not exist on the server'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async getAllBillerCategories() {
    return await this.billPaymentService.getBillCategories();
  }

  @Get('get-bill-payment-products/:billType')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Returns all Product types for making bill payments filtered by type category. Admin privileges required to call this endpoint'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All available bill payment product types matching the filter criteria returned'
  })
  @ApiBadRequestResponse({
    description: 'Request Parameter is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'User does not have the Required Permission for the requested operation'
  })
  @ApiNotFoundResponse({
    description: 'Project with the specified name does not exist on the server'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async getFlutterwaveBiller(@Param() params: BillCategoryDto) {
    return await this.billPaymentService.getBillCategoryByType(params.billType);
  }

  @Get('get-account-by-id/:id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Searches for an Account by account ID. Admin privileges required to call this endpoint'
  })
  @ApiOkResponse({
    description: 'SUCCESS: Account with the specified account ID on the server returned'
  })
  @ApiBadRequestResponse({
    description: 'Request Parameter is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'User does not have the Required Permission for the requested operation'
  })
  @ApiNotFoundResponse({
    description: 'Project with the specified name does not exist on the server'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async findOne(@Param() params: AccountIdDto) {
    const { accountId } = params
    return await this.accountService.findOne(accountId);
  }

  @Post('open-new-account')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Opens a new Account, Account number is auto-generated internally with checks being made against existing account numbers'
  })
  @ApiCreatedResponse({
    description: 'SUCCESS: New Account opened with the details in the request body'
  })
  @ApiBadRequestResponse({
    description: 'Required Request Body is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async openAccount(@Body() createAccountDto: CreateAccountDto, @UserDecorator() user: User) {
    return await this.accountService.create(createAccountDto);
  }

  @Post('deposit-funds')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Deposits funds into the account specified in the request body. Operation credits the specified account, checks made against the supplied account number and name combination'
  })
  @ApiOkResponse({
    description: 'SUCCESS: Funds deposited into the specified account'
  })
  @ApiBadRequestResponse({
    description: 'Request Body is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'Invalid Account Name/Number combination'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async depositFunds(@Body() transactionInfo: DepositOrWithdrawMoneyDto, @UserDecorator() user: User) {
    return await this.accountService.depositFunds(transactionInfo, user)
  }

  @Post('withdraw-funds')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Withdraws funds from the account specified in the request body. Operation debits the specified account, checks made against the supplied account number and name combination'
  })
  @ApiOkResponse({
    description: 'SUCCESS: Account debited and Funds withdrawn from the specified account'
  })
  @ApiBadRequestResponse({
    description: 'Request Body is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'Invalid Account Name/Number combination OR Insufficient balance to carry out the transaction'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async withdrawFunds(@Body() transactionInfo: DepositOrWithdrawMoneyDto, @UserDecorator() user: User) {
    return await this.accountService.withdrawFunds(transactionInfo, user)
  }

  @Post('internal-transfer')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `Transfers funds between internal accounts. Operation debits one account and credits the other account, 
    checks made against the supplied account number and name combination and for sufficient balance to cary out the transaction`
  })
  @ApiOkResponse({
    description: 'Funds transfer between the specified accounts successful'
  })
  @ApiBadRequestResponse({
    description: 'Request Body is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'Invalid Account Name/Number combination OR Insufficient balance to carry out the transaction'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async internalTransfer(@Body() transferInternalDto: TransferFundsToInternalDto, @UserDecorator() user: User) {
    return await this.accountService.internalFundsTransfer(transferInternalDto, user)
  }

  @Post('external-transfer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `Transfers funds from internal accounts to an external account. Operation debits the internal account, 
    the external account is an object containing random values describing the details of the external account, 
    checks made against the supplied account number and name combination`
  })
  @ApiOkResponse({
    description: 'Funds transfer between the specified accounts successful'
  })
  @ApiBadRequestResponse({
    description: 'Request Body is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'Invalid Account Name/Number combination OR Insufficient balance to carry out the transaction'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async externalTransfer(@Body() transferExternalDto: TransferFundsToExternalDto, @UserDecorator() user: User) {
    return await this.accountService.externalFundsTransfer(transferExternalDto, user)
  }

  @Post('bill-payment/:accountNumber')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `Makes a bill payment transaction. Operation debits an account, 
    checks made against the supplied account number and name combination and for sufficient balance on the debit account`
  })
  @ApiOkResponse({
    description: 'Funds transfer between the specified accounts successful'
  })
  @ApiBadRequestResponse({
    description: 'Request Body is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'Invalid Account Name/Number combination OR Insufficient balance to carry out the transaction'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async payBills(@Body() payBillDto: PayBillsDto, @Param() params: AccountNumberDto, @UserDecorator() user: User) {
    const { accountNumber } = params
    return await this.accountService.billPayment(payBillDto, user, +accountNumber)
  }

  @Patch(':id')
  @ApiOperation({
    description: 'Updates other details of an account. NOT YET COMPLETE'
  })
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(+id, updateAccountDto);
  }

  @Delete(':accountNumber')
  async remove(@Param('accountNumber') accountNumber: string) {
    return await this.accountService.remove(+accountNumber);
  }
}
