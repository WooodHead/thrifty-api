import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SavingsGroupService } from './savings-group.service';
import { CreateSavingsGroupDto } from './dto/create-savings-group.dto';
import { UpdateSavingsGroupDto } from './dto/update-savings-group.dto';

@Controller('v1/savings-group')
export class SavingsGroupController {
  constructor(private readonly savingsGroupService: SavingsGroupService) {}

  @Post()
  create(@Body() createSavingsGroupDto: CreateSavingsGroupDto) {
    return this.savingsGroupService.create(createSavingsGroupDto);
  }

  @Get()
  findAll() {
    return this.savingsGroupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.savingsGroupService.findOne(+id);
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
