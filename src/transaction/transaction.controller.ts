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
import { TransactionService } from './transaction.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDecorator } from '../user/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import {
  AccountIdDto,
  AccountIdAndDateDto,
  TransactionDateDto,
  TransactionDateRangeDto,
  TransactionIdDto,
} from './dto/common-transaction.dto';
import { RoleGuard } from '../auth/guards/roles.guard';
import { Role } from '../user/interfaces/user.interface';

@Controller('transactions')
@ApiTags('Transactions')
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Get('all')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Returns All Transactions on the Server, only Users with Admin Privileges can make a successful request to this endpoint. Request can be paginated'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All Transactions on the server returned',
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
  async findAll(@Query() query: PaginateQuery) {
    return await this.transactionService.findAll(query);
  }

  @Get('by-date-range')
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
    return await this.transactionService.findByDateRange(dateRangeDto, query);
  }

  @Get('by-date/:searchDate')
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
    return await this.transactionService.findByDate(params.searchDate, query);
  }

  @Get('all-by-user')
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
    return await this.transactionService.findByUser(id, query);
  }

  @Get('by-user/:searchDate')
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
    return await this.transactionService.findByUserAndDate(
      id,
      params.searchDate,
      query,
    );
  }

  @Get('by-user-and-date-range')
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
    return await this.transactionService.findByUserAndDateRange(
      id,
      dateRangeDto,
      query,
    );
  }

  @Get('by-account/:accountId')
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
    @Param() params: AccountIdDto,
    @Query() query: PaginateQuery,
  ) {
    const { accountId } = params;
    return await this.transactionService.findByAccount(accountId, query);
  }

  @Get('by-account/:accountId/:searchDate')
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
    @Param() params: AccountIdAndDateDto,
    @Query() query: PaginateQuery,
  ) {
    const { accountId, searchDate } = params;
    return await this.transactionService.findByAccountAndDate(
      accountId,
      searchDate,
      query,
    );
  }

  @Get('by-account-and-date-range/:accountId')
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
    @Body() dateRangeDto: TransactionDateRangeDto,
    @Param() params: AccountIdAndDateDto,
    @Query() query: PaginateQuery,
  ) {
    const { accountId } = params;
    return await this.transactionService.findByAccountAndDateRange(
      accountId,
      dateRangeDto,
      query,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Returns a Transaction by ID, only Users with Admin Privileges can make a successful request to this endpoint'
  })
  @ApiOkResponse({
    description: 'SUCCESS: Transaction with the specified ID on the server returned'
  })
  @ApiBadRequestResponse({
    description: 'Required Request Parameter is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'User does not have the Required Permission for the requested operation'
  })
  @ApiNotFoundResponse({
    description: 'Savings Group with the specified ID does not exist on the server'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async findOne(@Param() params: TransactionIdDto) {
    const { transactionId } = params;
    return await this.transactionService.findOne(transactionId);
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
    return await this.transactionService.update(
      transactionId,
      updateTransactionDto,
    );
  }
}
