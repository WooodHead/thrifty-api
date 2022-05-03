import { Injectable } from '@nestjs/common';
import { CreateSavingsGroupDto } from './dto/create-savings-group.dto';
import { UpdateSavingsGroupDto } from './dto/update-savings-group.dto';

@Injectable()
export class SavingsGroupService {
  create(createSavingsGroupDto: CreateSavingsGroupDto) {
    return 'This action adds a new savingsGroup';
  }

  findAll() {
    return `This action returns all savingsGroup`;
  }

  findOne(id: number) {
    return `This action returns a #${id} savingsGroup`;
  }

  update(id: number, updateSavingsGroupDto: UpdateSavingsGroupDto) {
    return `This action updates a #${id} savingsGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} savingsGroup`;
  }
}
