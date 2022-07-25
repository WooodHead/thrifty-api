import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
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
import { SavingsGroupService } from './savings-group.service';
import { CreateSavingsGroupDto } from './dto/create-savings-group.dto';
import { UpdateSavingsGroupDto } from './dto/update-savings-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/roles.guard';
import { Role } from '../user/interfaces/user.interface';
import { UserDecorator } from '../user/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { ContributeFundsDto, UpdateGroupMemberDto } from './dto/savings-group.dto';

@Controller('savings-group')
@ApiTags('Savings Group')
@ApiBearerAuth()
export class SavingsGroupController {
  constructor(private readonly savingsGroupService: SavingsGroupService) { }

  @Post('create')
  @ApiOperation({
    description: 'Creates a new Savings Group and adds the user making the request as the Savings Group Admin'
  })
  @ApiCreatedResponse({
    description: 'SUCCESS: Savings group created with the details in the request body'
  })
  @ApiBadRequestResponse({
    description: 'Required Request Body is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiConflictResponse({
    description: 'Another Savings Group with the specified groupName already exists on the server'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  create(@Body() createSavingsGroupDto: CreateSavingsGroupDto, @UserDecorator() user: User) {
    return this.savingsGroupService.create(createSavingsGroupDto, user);
  }

  @Patch('add-group-member')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Adds a new member to a Savings Group, only the groupAdmin of a Savings Group can add a member to the group'
  })
  @ApiOkResponse({
    description: 'SUCCESS: Specified Member added to the target Savings group'
  })
  @ApiBadRequestResponse({
    description: 'Required Request Body is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'User making the request is not the group admin of the Savings Group'
  })
  @ApiNotFoundResponse({
    description: 'Savings Group or user to add with specified IDs does not exist on the server'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async addSavingsGroupMember(@Body() addMemberDto: UpdateGroupMemberDto, @UserDecorator() user: User) {
    return await this.savingsGroupService.addSavingsGroupMember(addMemberDto, user);
  }

  @Patch('remove-group-member')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Removes a member from to a Savings Group, only the groupAdmin of a Savings Group can remove a member from the group'
  })
  @ApiOkResponse({
    description: 'SUCCESS: Specified Member removed from the target Savings group'
  })
  @ApiBadRequestResponse({
    description: 'Required Request Body is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'User making the request is not the group admin of the Savings Group'
  })
  @ApiNotFoundResponse({
    description: 'Savings Group or user to remove with specified IDs does not exist on the server'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async removeGroupMember(@Body() removeMemberDto: UpdateGroupMemberDto, @UserDecorator() user: User) {
    return await this.savingsGroupService.removeSavingsGroupMember(removeMemberDto, user);
  }

  @Patch('contribute-funds')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Members of a Savings Group can contibute funds to their Savings Group with this endpoint'
  })
  @ApiOkResponse({
    description: 'SUCCESS: Amount sepcified in the request body added to the savings group'
  })
  @ApiBadRequestResponse({
    description: 'Required Request Body is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'User making the request is not a member of the Savings Group'
  })
  @ApiNotFoundResponse({
    description: 'Savings Group with the specified ID does not exist on the server'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  contibuteFunds(@UserDecorator() user: User, @Body() contributeFundsDto: ContributeFundsDto) {
    return this.savingsGroupService.contriubeFundsToGroup(user, contributeFundsDto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Returns All Savings Group on the Server, only Users with Admin Privileges can make a successful request to this endpoint. Request can be paginated'
  })
  @ApiOkResponse({
    description: 'SUCCESS: All Savings Group on the server returned',
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
    return await this.savingsGroupService.findAll(query);
  }

  @Get('by-name/:name')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Search for A Savings Group by group name, only Users with Admin Privileges can make a successful request to this endpoint'
  })
  @ApiOkResponse({
    description: 'SUCCESS: Savngs Group with the specified name on the server returned'
  })
  @ApiBadRequestResponse({
    description: 'Request Param is empty or contains unacceptable values'
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token supplied with the request has expired or is invalid'
  })
  @ApiForbiddenResponse({
    description: 'User does not have the Required Permission for the requested operation'
  })
  @ApiNotFoundResponse({
    description: 'Savings Group with the specified name does not exist on the server'
  })
  @ApiInternalServerErrorResponse({
    description: 'An Internal Error Occurred while processing the request'
  })
  async findByName(@Param('name') name: string) {
    return await this.savingsGroupService.findByName(name);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Returns a Savings Group by ID, only Users with Admin Privileges can make a successful request to this endpoint'
  })
  @ApiOkResponse({
    description: 'SUCCESS: Savings Group with the specified ID on the server returned'
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
  async findOne(@Param('id') id: string) {
    return await this.savingsGroupService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description: 'Updates a Savings Group, NOT YET COMPLETE'
  })
  update(@Param('id') id: string, @Body() updateSavingsGroupDto: UpdateSavingsGroupDto) {
    return this.savingsGroupService.update(+id, updateSavingsGroupDto);
  }

  @Delete(':id')
  @ApiOperation({
    description: 'Deletes a Savings Group, NOT YET COMPLETE'
  })
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  remove(@Param('id') id: string) {
    return this.savingsGroupService.remove(+id);
  }
}
