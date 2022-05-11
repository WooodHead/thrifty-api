import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginateQuery, paginate, Paginated } from 'nestjs-paginate';
import { SavingsGroup } from './entities/savings-group.entity';
import { CreateSavingsGroupDto } from './dto/create-savings-group.dto';
import { UpdateSavingsGroupDto } from './dto/update-savings-group.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SavingsGroupService {
  constructor(
    @InjectRepository(SavingsGroup)
    private readonly savingsGroupRepository: Repository<SavingsGroup>,
  ) { }

  async findAll(query: PaginateQuery): Promise<Paginated<SavingsGroup>> {
    try {
      return await paginate(query, this.savingsGroupRepository, {
        sortableColumns: ['createdAt'],
        defaultSortBy: [['createdAt', 'DESC']],
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<SavingsGroup> {
    try {
      const transaction = await this.savingsGroupRepository.findOne({
        where: { id },
        relations: ['groupMembers', 'groupAdmin']
      });
      if (transaction) return transaction;
      throw new NotFoundException(`Transaction with ID: ${id} not found on this server`);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByName(name: string) {
    try {
      const transaction = await this.savingsGroupRepository.findOne({ where: { groupName: name } });
      if (transaction) return transaction;
      throw new NotFoundException(`Transaction with name: ${name} not found on this server`);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(createSavingsGroupDto: CreateSavingsGroupDto, user: User) {
    try {
      const savingsGroup = await this.savingsGroupRepository.findOne({ where: { groupName: createSavingsGroupDto.groupName } });
      if (savingsGroup) throw new ConflictException(`SavingsGroup with name: ${createSavingsGroupDto.groupName} already exists`);
      createSavingsGroupDto.groupAdmin = user;
      const newSavingsGroup = this.savingsGroupRepository.create(createSavingsGroupDto);
      await this.savingsGroupRepository.save(newSavingsGroup);
      return newSavingsGroup;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  update(id: number, updateSavingsGroupDto: UpdateSavingsGroupDto) {
    return `This action updates a #${id} savingsGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} savingsGroup`;
  }
}
