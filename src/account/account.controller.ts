import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaginateQuery } from 'nestjs-paginate';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UserDecorator } from '../user/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { AccountIdDto, AccountNumberDto } from './dto/common-account.dto';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) { }

  @ApiBearerAuth()
  @Post('open-new-account')
  openAccount(@Body() createAccountDto: CreateAccountDto, @UserDecorator() user: User) {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  findAll(@Query() query: PaginateQuery) {
    return this.accountService.findAll(query);
  }

  @Get('by-account-number/:accountNumber')
  findByAccountNumber(@Param() params: AccountNumberDto) {
    const { accountNumber } = params
    return this.accountService.findByAccountNumber(+accountNumber);
  }

  @Get(':id')
  findOne(@Param() params: AccountIdDto) {
    const { accountId } = params
    return this.accountService.findOne(accountId);
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
