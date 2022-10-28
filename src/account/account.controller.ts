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
import { UserDecorator } from '@user/decorators/user.decorator';
import { User } from '@user/entities/user.entity';
import {
  AccountNameDto,
  AccountNumberDto,
  DepositOrWithdrawMoneyDto,
  TransferFundsToInternalDto,
  TransferFundsToExternalDto
} from './dto/common-account.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { PayBillsDto } from '@services/bill-payment/dto/bill-payment.dto';
import { SuccessResponse } from '@utils/successResponse';


@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiTags('Account')
@ApiBearerAuth()
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
  ) { }

  // Global Caching disabled for this route, Caching is done at Service-level
  @Get('user')
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

    const responseData = await this.accountService.findAccountByUser(id, query);

    return new SuccessResponse(200, 'All Accounts By User', responseData);

  }

  @Get('balance')
  @ApiOperation({
    description: `Returns the account balance of the specified account. 
    Only authenticated users can call this endpoint and users can only query accounts belonging to them.`
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
  async checkAccountBalance(@Query() accountNumberDto: AccountNumberDto, @UserDecorator('id') id: string) {

    const { accountNumber } = accountNumberDto

    const responseData = await this.accountService.checkAccountBalance(+accountNumber, id);

    return new SuccessResponse(200, 'Account Retrieved By Account Number', responseData);

  };

  @Get('number')
  @ApiOperation({
    description: 'Searches for an account by account number belonging to the authenticated user'
  })
  @ApiOkResponse({
    description: 'SUCCESS: Account with the specified account number on the server returned'
  })
  @ApiBadRequestResponse({
    description: 'Request Query is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'User does not have the Required Permission for the requested operation'
  })
  @ApiNotFoundResponse({
    description: 'Account with the specified accountNumber does not exist on the server'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async findByAccountNumber(@Query() accountNumberDto: AccountNumberDto, @UserDecorator('id') id: string) {

    const { accountNumber } = accountNumberDto;

    const responseData = await this.accountService.findByAccountNumber(+accountNumber, id);

    return new SuccessResponse(200, 'Account Retrieved By Account Number', responseData);

  };

  @Get('name')
  @ApiOperation({
    description: 'Searches for an account by account name, belonging to the authenticated user'
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
  async findByAccountName(@Query() accountNameDto: AccountNameDto, @UserDecorator('id') id: string) {

    const { accountName } = accountNameDto

    const responseData = await this.accountService.findByAccountName(accountName, id);

    return new SuccessResponse(200, 'Account Retrieved By Account Name', responseData)

  };

  @Post()
  @ApiOperation({
    description: 'Opens a new Account, Account number is auto-generated internally'
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
  @HttpCode(201)
  async openAccount(@Body() createAccountDto: CreateAccountDto) {

    const responseData = await this.accountService.create(createAccountDto);

    return new SuccessResponse(201, 'Account Created', responseData)

  };

  @Post('deposit')
  @HttpCode(200)
  @ApiOperation({
    description: `Deposits funds into the account specified in the request body. 
    Operation credits the specified account, 
    checks made against the supplied account number and name combination`
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

    const responseData = await this.accountService.depositFunds(transactionInfo, user);

    return new SuccessResponse(200, 'Funds Deposit Successful', responseData);

  };

  @Post('withdraw')
  @HttpCode(200)
  @ApiOperation({
    description: `Withdraws funds from the account specified in the request body. 
    Operation debits the specified account, 
    checks made against the supplied account number and name combination`
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

    const responseData = await this.accountService.withdrawFunds(transactionInfo, user);

    return new SuccessResponse(200, 'Funds Withdrawal Successful', responseData)

  };

  @Post('internal-transfer')
  @HttpCode(200)
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

    const responseData = await this.accountService.internalFundsTransfer(transferInternalDto, user);

    return new SuccessResponse(200, 'Funds Transfer Successful', responseData);

  }

  @Post('external-transfer')
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

    const responseData = await this.accountService.externalFundsTransfer(transferExternalDto, user);

    return new SuccessResponse(200, 'Transfer Successful', responseData);

  }

  @Post('pay-bills')
  @HttpCode(200)
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
  async payBills(@Body() payBillDto: PayBillsDto, @UserDecorator() user: User) {

    const responseData = await this.accountService.billPayment(payBillDto, user);

    return new SuccessResponse(200, 'Bill Payment Status', responseData)
  }

  @Patch(':accountNumber')
  @ApiOperation({
    description: 'Updates other details of an account'
  })
  @ApiOkResponse({
    description: 'Account Update Successful'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiNotFoundResponse({
    description: 'Account with the supplied accountNumber not found'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  update(
    @Param() accountNumberDto: AccountNumberDto,
    @Body() updateAccountDto: UpdateAccountDto,
    @UserDecorator('id') id: string
  ) {

    const { accountNumber } = accountNumberDto;

    const responseData = this.accountService.update(accountNumber, updateAccountDto, id);

    return new SuccessResponse(200, 'Account Updated', responseData);

  }

  @Delete(':accountNumber')
  @ApiOperation({
    description: 'Deletes an account'
  })
  @ApiOkResponse({
    description: 'Account Deleted Successfully'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiNotFoundResponse({
    description: 'Account with the supplied accountNumber not found'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async remove(@Param() accountNumberDto: AccountNumberDto, @UserDecorator('id') id: string) {

    const { accountNumber } = accountNumberDto;

    const responseData = await this.accountService.remove(accountNumber, id);

    return new SuccessResponse(200, 'Account Deleted', responseData)
  }
  
}
