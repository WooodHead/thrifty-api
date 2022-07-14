import { Controller, Get, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaginateQuery } from 'nestjs-paginate';
import { TransactionService } from './transaction.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDecorator } from '../user/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { TransactionDateRangeDto, TransactionDateDto, TransactionIdDto, AccountIdDto, AccountIdAndDateDto } from './dto/common-transaction.dto';

@ApiTags('Transactions')
@Controller('/v1/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: PaginateQuery) {
    return await this.transactionService.findAll(query);
  }

  @Get('by-date-range')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findByDateRange(
    @Body() dateRangeDto: TransactionDateRangeDto,
    @Query() query: PaginateQuery,
  ) {
    return await this.transactionService.findByDateRange(dateRangeDto, query);
  }

  @Get('by-date/:searchDate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findByDate(
    @Param() params: TransactionDateDto,
    @Query() query: PaginateQuery,
  ) {
    return await this.transactionService.findByDate(params.searchDate, query);
  }

  @Get('all-by-user')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findAllByUser(
    @UserDecorator() user: User,
    @Query() query: PaginateQuery,
  ) {
    const { id } = user;
    return await this.transactionService.findByUser(id, query);
  }

  @Get('by-user/:searchDate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findByUserAndDate(
    @Param() params: TransactionDateDto,
    @Query() query: PaginateQuery,
    @UserDecorator() user: User,
  ) {
    const { id } = user;
    return await this.transactionService.findByUserAndDate(
      id,
      params.searchDate,
      query,
    );
  }

  @Get('by-user-and-date-range')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findByUserAndDateRange(
    @Body() dateRangeDto: TransactionDateRangeDto,
    @Query() query: PaginateQuery,
    @UserDecorator() user: User,
  ) {
    const { id } = user;
    return await this.transactionService.findByUserAndDateRange(
      id,
      dateRangeDto,
      query,
    );
  }

  @Get('by-account/:accountId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findByAccount(
    @Param() params: AccountIdDto,
    @Query() query: PaginateQuery,
  ) {
    const { accountId } = params;
    return await this.transactionService.findByAccount(accountId, query);
  }

  @Get('by-account/:accountId/:searchDate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findOne(@Param() params: TransactionIdDto) {
    const { transactionId } = params;
    return await this.transactionService.findOne(transactionId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
