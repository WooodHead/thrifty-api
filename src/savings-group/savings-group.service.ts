import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavingsGroup } from './entities/savings-group.entity';
import { CreateSavingsGroupDto } from './dto/create-savings-group.dto';
import { UpdateSavingsGroupDto } from './dto/update-savings-group.dto';
import { UpdateGroupMemberDto, ContributeFundsDto } from './dto/savings-group.dto';
import { User } from '@user/entities/user.entity';
import { UserToSavingsGroup } from '@common/entities/user-to-savingsgroup.entity';
import { PostgresErrorCodes } from '@common/interfaces/postgresErrorCodes';


@Injectable()
export class SavingsGroupService {
  constructor(
    @InjectRepository(SavingsGroup) private readonly savingsGroupRepository: Repository<SavingsGroup>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserToSavingsGroup) private readonly userToSavingsGroupRepository: Repository<UserToSavingsGroup>,
  ) { }


  async findByName(name: string, adminUser: User) {
    try {

      const savingsGroup = await this.savingsGroupRepository.findOne({
        where: {
          groupName: name,
          groupAdmin: {
            id: adminUser.id
          }
        }
      });

      if (savingsGroup) return savingsGroup;

      throw new NotFoundException(`Savings Group with groupName: ${name} not found on this server`);

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

      createSavingsGroupDto.groupAdmin = user;

      const newSavingsGroup = this.savingsGroupRepository.create(createSavingsGroupDto);

      await this.savingsGroupRepository.save(newSavingsGroup);

      return newSavingsGroup;

    } catch (error) {
      console.error(error.message)
      if (error?.code === PostgresErrorCodes.UniqueViolation) {
        throw new ConflictException(
          `Savings Group with groupName: ${createSavingsGroupDto.groupName} already exists`
        );
      }
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addSavingsGroupMember(addMemberDto: UpdateGroupMemberDto, adminUser: User) {
    try {

      const { userId, savingsGroupId } = addMemberDto;

      // check if user exists
      const userToAdd = await this.userRepository.findOneBy({ id: userId });

      if (!userToAdd) {
        throw new NotFoundException(`User with ID: ${userId} not found on this server`)
      };

      // check if savingsGroup exists
      const savingsGroup = await this.savingsGroupRepository.findOne({
        relations: { groupAdmin: true },
        where: { id: savingsGroupId }
      });

      if (!savingsGroup) {
        throw new NotFoundException(`SavingsGroup with ID: ${savingsGroupId} not found on this server`)
      };

      // Check if the user making the request is the savingsGroup Admin
      if (savingsGroup.groupAdmin.id === adminUser.id) {

        // check if user is already a member of the savingsGroup
        const userAlreadyAdded = await this.userToSavingsGroupRepository.findOne({ where: { ...addMemberDto } });

        if (userAlreadyAdded) {
          throw new ConflictException(`User with ID: ${userId} already belongs to savingsGroup with ID: ${savingsGroupId}`)
        };

        // add user to savingsGroup
        const addUserToGroup = this.userToSavingsGroupRepository.create(addMemberDto);

        await this.userToSavingsGroupRepository.save(addUserToGroup);

        return `User with ID: ${userId} added to savingsGroup with ID: ${savingsGroupId}`;

      }

      throw new ForbiddenException(
        'You are not the Admin of this Savings Group, please contact the group admin to add a new member'
      )

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeSavingsGroupMember(removeMemberDto: UpdateGroupMemberDto, adminUser: User) {
    try {

      const { userId, savingsGroupId } = removeMemberDto;

      // check if user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(`User with ID: ${userId} not found on this server`)
      };

      // check if savingsGroup exists
      const savingsGroup = await this.savingsGroupRepository.findOne({
        relations: { groupAdmin: true },
        where: { id: savingsGroupId }
      });

      if (!savingsGroup) {
        throw new NotFoundException(`SavingsGroup with ID: ${savingsGroupId} not found on this server`)
      };

      // Check if the user making the request is the savingsGroup Admin
      if (savingsGroup.groupAdmin.id === adminUser.id) {

        // Check if user is a member of the savings group
        const { groupMembers } = savingsGroup;

        const userIsMember = groupMembers.some(member => member.userId === user.id);

        if (!userIsMember) {
          throw new NotFoundException(`User with ID: ${userId} is not a member of savingsGroup with ID: ${savingsGroupId}`)
        };

        // remove user from savingsGroup
        const removeUserFromGroup = await this.userToSavingsGroupRepository.findOne({ where: { ...removeMemberDto } });

        await this.userToSavingsGroupRepository.remove(removeUserFromGroup);

        return `User with ID: ${userId} removed from savingsGroup with ID: ${savingsGroupId}`;

      }

      throw new ForbiddenException(
        `You are not the Admin of this Savings Group, please contact the group admin to remove a member from the group`
      )

    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async contriubeFundsToGroup(user: User, contibuteFundsDto: ContributeFundsDto) {
    try {
      const { savingsGroupId, amountToSave } = contibuteFundsDto;

      // check if savingsGroup exists
      const savingsGroup = await this.savingsGroupRepository
        .createQueryBuilder('savingsGroup')
        .where('savingsGroup.id = :id', { id: savingsGroupId })
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

      if (!savingsGroup) {
        throw new NotFoundException(`SavingsGroup with ID: ${savingsGroupId} not found on this server`)
      };

      // Check if user is a member of the savings group
      const { groupMembers } = savingsGroup;

      const userIsMember = groupMembers.some(member => member.userId === user.id);

      if (!userIsMember) {
        throw new ForbiddenException(
          `User with ID: ${user.id} is not a member of savingsGroup with ID: ${savingsGroupId}`
        );
      }

      const saveToGroup = await this.userToSavingsGroupRepository.findOne({
        where: {
          userId: user.id,
          savingsGroupId
        }
      });

      saveToGroup.contributedFunds = +saveToGroup.contributedFunds + amountToSave;

      await this.userToSavingsGroupRepository.save(saveToGroup);

      return `
      ${amountToSave} contributed to ${savingsGroup.groupName} group.
      New savings group balance is ${saveToGroup.contributedFunds}
      `

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
