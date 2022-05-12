import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { PaginateQuery } from 'nestjs-paginate';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDecorator } from '../user/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { TransactionDateRangeDto, TransactionDateDto, TransactionIdDto, AccountIdDto, AccountIdAndDateDto } from './dto/common-transaction.dto';

@Controller('api/v1/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @UserDecorator() user: User,
  ) {
    createTransactionDto.user = user;
    return await this.transactionService.create(createTransactionDto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: PaginateQuery) {
    return await this.transactionService.findAll(query);
  }

  @Get('by-date-range')
  @UseGuards(JwtAuthGuard)
  async findByDateRange(
    @Body() dateRangeDto: TransactionDateRangeDto,
    @Query() query: PaginateQuery,
  ) {
    return await this.transactionService.findByDateRange(dateRangeDto, query);
  }

  @Get('by-date/:searchDate')
  @UseGuards(JwtAuthGuard)
  async findByDate(
    @Param() params: TransactionDateDto,
    @Query() query: PaginateQuery,
  ) {
    return await this.transactionService.findByDate(params.searchDate, query);
  }

  @Get('all-by-user')
  @UseGuards(JwtAuthGuard)
  async findAllByUser(
    @UserDecorator() user: User,
    @Query() query: PaginateQuery,
  ) {
    const { id } = user;
    return await this.transactionService.findByUser(id, query);
  }

  @Get('by-user/:searchDate')
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
  @UseGuards(JwtAuthGuard)
  async findByAccount(
    @Param() params: AccountIdDto,
    @Query() query: PaginateQuery,
  ) {
    const { accountId } = params;
    return await this.transactionService.findByAccount(accountId, query);
  }

  @Get('by-account/:accountId/:searchDate')
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
  @UseGuards(JwtAuthGuard)
  async findOne(@Param() params: TransactionIdDto) {
    const { transactionId } = params;
    return await this.transactionService.findOne(transactionId);
  }

  @Patch(':id')
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
