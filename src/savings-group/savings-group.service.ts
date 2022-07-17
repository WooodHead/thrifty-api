import { ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginateQuery, paginate, Paginated } from 'nestjs-paginate';
import { SavingsGroup } from './entities/savings-group.entity';
import { CreateSavingsGroupDto } from './dto/create-savings-group.dto';
import { UpdateSavingsGroupDto } from './dto/update-savings-group.dto';
import { UpdateGroupMemberDto, ContributeFundsDto } from './dto/savings-group.dto';
import { User } from '../user/entities/user.entity';
import { UserToSavingsGroup } from '../common/entities/user-to-savingsgroup.entity';

@Injectable()
export class SavingsGroupService {
  constructor(
    @InjectRepository(SavingsGroup) private readonly savingsGroupRepository: Repository<SavingsGroup>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserToSavingsGroup) private readonly userToSavingsGroupRepository: Repository<UserToSavingsGroup>,
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
      const savingsGroup = await this.savingsGroupRepository
        .createQueryBuilder('savingsGroup')
        .where('savingsGroup.id = :id', { id })
        .leftJoinAndSelect('savingsGroup.groupAdmin', 'groupAdmin')
        .select([
          'savingsGroup.id',
          'savingsGroup.groupName',
          'savingsGroup.groupType',
          'savingsGroup.groupDescription',
          'savingsGroup.createdAt',
          'savingsGroup.updatedAt',
          'groupAdmin.id'
        ])
        .leftJoinAndSelect('savingsGroup.groupMembers', 'groupMembers')
        .getOne();
      if (savingsGroup) return savingsGroup;
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
      const savingsGroup = await this.savingsGroupRepository.findOne({ where: { groupName: name } });
      if (savingsGroup) return savingsGroup;
      throw new NotFoundException(`Savings Group with name: ${name} not found on this server`);
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

  async addSavingsGroupMember(addMemberDto: UpdateGroupMemberDto) {
    try {
      const { userId, savingsGroupId } = addMemberDto;

      // check if user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException(`User with ID: ${userId} not found on this server`);

      // check if savingsGroup exists
      const savingsGroup = await this.savingsGroupRepository.findOne({ where: { id: savingsGroupId } });
      if (!savingsGroup) throw new NotFoundException(`SavingsGroup with ID: ${savingsGroupId} not found on this server`);

      // check if user is already a member of the savingsGroup
      const userAlreadyAdded = await this.userToSavingsGroupRepository.findOne({ where: { ...addMemberDto } });
      if (userAlreadyAdded) throw new ConflictException(`User with ID: ${userId} already belongs to savingsGroup with ID: ${savingsGroupId}`);

      // add user to savingsGroup
      const addUserToGroup = this.userToSavingsGroupRepository.create(addMemberDto);
      await this.userToSavingsGroupRepository.save(addUserToGroup);

      return { message: `User with ID: ${userId} added to savingsGroup with ID: ${savingsGroupId}` };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeSavingsGroupMember(removeMemberDto: UpdateGroupMemberDto) {
    try {
      const { userId, savingsGroupId } = removeMemberDto;

      // check if user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException(`User with ID: ${userId} not found on this server`);

      // check if savingsGroup exists
      const savingsGroup = await this.findOne(savingsGroupId);
      if (!savingsGroup) throw new NotFoundException(`SavingsGroup with ID: ${savingsGroupId} not found on this server`);

      // Check if user is a member of the savings group
      const { groupMembers } = savingsGroup;
      const userIsMember = groupMembers.some(member => member.userId === user.id);
      if (!userIsMember) throw new NotFoundException(`User with ID: ${userId} is not a member of savingsGroup with ID: ${savingsGroupId}`);

      // remove user from savingsGroup
      const removeUserFromGroup = await this.userToSavingsGroupRepository.findOne({ where: { ...removeMemberDto } });
      await this.userToSavingsGroupRepository.remove(removeUserFromGroup);

      return { message: `User with ID: ${userId} removed from savingsGroup with ID: ${savingsGroupId}` };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async contriubeFundsToGroup(userId: string, contibuteFundsDto: ContributeFundsDto) {
    try {
      const { savingsGroupId, amountToSave } = contibuteFundsDto;

      // check if user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException(`User with ID: ${userId} not found on this server`);

      // check if savingsGroup exists
      const savingsGroup = await this.findOne(savingsGroupId);
      if (!savingsGroup) throw new NotFoundException(`SavingsGroup with ID: ${savingsGroupId} not found on this server`);

      // Check if user is a member of the savings group
      const { groupMembers } = savingsGroup;
      const userIsMember = groupMembers.some(member => member.userId === user.id);
      if (!userIsMember) throw new ForbiddenException(`User with ID: ${userId} is not a member of savingsGroup with ID: ${savingsGroupId}`);

      const saveToGroup = await this.userToSavingsGroupRepository.findOne({ where: { userId, savingsGroupId } });
      saveToGroup.contributedFunds = +saveToGroup.contributedFunds + amountToSave;

      await this.userToSavingsGroupRepository.save(saveToGroup);

      return { message: `SUCESS!!! ${amountToSave} contributed to ${savingsGroup.groupName} group, new savings balance is ${saveToGroup.contributedFunds}` }

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  update(id: number, updateSavingsGroupDto: UpdateSavingsGroupDto) {
    return `This action updates a #${id} savingsGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} savingsGroup`;
  }
}
