import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { PaginateQuery } from 'nestjs-paginate';
import { TransactionService } from './transaction.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDecorator } from '../user/decorators/user.decorator';
import {
  AccountIdDto,
  TransactionDateDto,
  TransactionDateRangeDto,
  TransactionAccountDateDto,
  TransactionAccountDateRangeDto,
  TransactionIdDto,
} from './dto/common-transaction.dto';
import { RoleGuard } from '../auth/guards/roles.guard';
import { Role } from '../user/interfaces/user.interface';
import { SuccessResponse } from '../utils/successResponse';

@Controller('transactions')
@ApiTags('Transactions')
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Get('date-range')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Returns All Transactions within a given date range on the Server, only Users with Admin Privileges can make a successful request to this endpoint. Request can be paginated'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All Transactions within the specified date range on the server returned',
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
  async findByDateRange(
    @Body() dateRangeDto: TransactionDateRangeDto,
    @Query() query: PaginateQuery,
  ) {

    const responseData = await this.transactionService.findByDateRange(dateRangeDto, query);

    return new SuccessResponse(200, 'All Transactions By Date Range', responseData);

  }

  @Get('date/:searchDate')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Returns All Transactions done on a given date on the Server, only Users with Admin Privileges can make a successful request to this endpoint. Request can be paginated'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All Transactions for the specified date on the server returned',
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
  async findByDate(
    @Param() params: TransactionDateDto,
    @Query() query: PaginateQuery,
  ) {

    const responseData = await this.transactionService.findByDate(params.searchDate, query);

    return new SuccessResponse(200, 'Transactions By Date', responseData)

  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Returns All Transactions By an Authenticated User. Request can be paginated'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All Transactions by the Authenticated User on the server returned',
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async findAllByUser(
    @UserDecorator('id') id: string,
    @Query() query: PaginateQuery,
  ) {

    const responseData = await this.transactionService.findByUser(id, query);

    return new SuccessResponse(200, 'All Transactions By User', responseData)

  }

  @Get('user/:searchDate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Returns All Transactions By an Authenticated User on a given date. Request can be paginated'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All Transactions by the Authenticated User on the specified date returned',
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async findByUserAndDate(
    @Param() params: TransactionDateDto,
    @Query() query: PaginateQuery,
    @UserDecorator('id') id: string,
  ) {

    const responseData = await this.transactionService.findByUserAndDate(
      id,
      params.searchDate,
      query,
    );

    return new SuccessResponse(200, 'All Transactions By User and Date', responseData);

  }

  @Get('user/date-range')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Returns All Transactions By an Authenticated User within a given date range. Request can be paginated'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All Transactions by the Authenticated User within the given date range returned',
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async findByUserAndDateRange(
    @Body() dateRangeDto: TransactionDateRangeDto,
    @Query() query: PaginateQuery,
    @UserDecorator('id') id: string,
  ) {
    
    const responseData = await this.transactionService.findByUserAndDateRange(
      id,
      dateRangeDto,
      query,
    );

    return new SuccessResponse(200, 'Transactions By User and Date Range', responseData)

  }

  @Get('account')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Returns All Transactions done on a given Account by the Account ID, only Users with Admin Privileges can make a successful request to this endpoint. Request can be paginated'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All Transactions for the specified Account ID on the server returned',
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
  async findByAccount(
    @Body() accountIDDto: AccountIdDto,
    @Query() query: PaginateQuery,
  ) {

    const { accountId } = accountIDDto;

    const responseData = await this.transactionService.findByAccount(accountId, query);

    return new SuccessResponse(200, 'Transactions Retrieved By Account', responseData);

  }

  @Get('account/date')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Returns All Transactions done on a given Account by the Account ID on a given date, only Users with Admin Privileges can make a successful request to this endpoint. Request can be paginated'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All Transactions for the specified Account ID on the given search date returned',
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
  async findByAccountAndDate(
    @Body() transactionDateDto: TransactionAccountDateDto,
    @Query() query: PaginateQuery,
  ) {

    const responseData = await this.transactionService.findByAccountAndDate(
      transactionDateDto,
      query,
    );

    return new SuccessResponse(200, 'Transaction Retreived By Account and Date', responseData)
  }

  @Get('account/date-range')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Returns All Transactions done on a given Account by the Account ID and by a given date range, only Users with Admin Privileges can make a successful request to this endpoint. Request can be paginated'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All Transactions for the specified Account ID on the given search date range returned',
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
  async findByAccountAndDateRange(
    @Body() dateRangeDto: TransactionAccountDateRangeDto,
    @Query() query: PaginateQuery,
  ) {

    const responseData = await this.transactionService.findByAccountAndDateRange(
      dateRangeDto,
      query,
    );

    return new SuccessResponse(200, 'Transactions Retrieved By Date Range', responseData)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Updates a Transaction, NOT YET COMPLETE'
  })
  async update(
    @Param() params: TransactionIdDto,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    const { transactionId } = params;

    const responseData = await this.transactionService.update(
      transactionId,
      updateTransactionDto,
    );

    return new SuccessResponse(200, 'Transaction Updated', responseData)

  }
}
