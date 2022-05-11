import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PaginateQuery } from 'nestjs-paginate';
import { SavingsGroupService } from './savings-group.service';
import { CreateSavingsGroupDto } from './dto/create-savings-group.dto';
import { UpdateSavingsGroupDto } from './dto/update-savings-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/roles.guard';
import { Role } from '../user/interfaces/user.interface';
import { UserDecorator } from '../user/decorators/user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('v1/savings-group')
export class SavingsGroupController {
  constructor(private readonly savingsGroupService: SavingsGroupService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  create(@Body() createSavingsGroupDto: CreateSavingsGroupDto, @UserDecorator() user: User) {
    return this.savingsGroupService.create(createSavingsGroupDto, user);
  }

  @Get()
  async findAll(@Query() query: PaginateQuery) {
    return await this.savingsGroupService.findAll(query);
  }

  @Get('by-name/:name')
  async findByName(@Param('name') name: string) {
    return await this.savingsGroupService.findByName(name);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.savingsGroupService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSavingsGroupDto: UpdateSavingsGroupDto) {
    return this.savingsGroupService.update(+id, updateSavingsGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.savingsGroupService.remove(+id);
  }
}
