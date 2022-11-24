import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
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
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { SavingsGroupService } from "./savings-group.service";
import { CreateSavingsGroupDto } from "./dto/create-savings-group.dto";
import { UpdateSavingsGroupDto } from "./dto/update-savings-group.dto";
import { JwtAuthGuard } from "@auth/guards/jwt-auth.guard";
import { UserDecorator } from "@user/decorators/user.decorator";
import { User } from "@user/entities/user.entity";
import {
  ContributeFundsDto,
  UpdateGroupMemberDto,
} from "./dto/savings-group.dto";
import { SuccessResponse } from "@utils/successResponse";
import { FeatureFlagGuard } from "@admin/feature-flag/feature-flag.guard";

@Controller("savings-groups")
@UseGuards(JwtAuthGuard)
@ApiTags("Savings Group")
@ApiBearerAuth()
export class SavingsGroupController {
  constructor(private readonly savingsGroupService: SavingsGroupService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    description:
      "Creates a new Savings Group and adds the user making the request as the Savings Group Admin",
  })
  @ApiCreatedResponse({
    description:
      "SUCCESS: Savings group created with the details in the request body",
  })
  @ApiBadRequestResponse({
    description:
      "Required Request Body is empty or contains unacceptable values",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiConflictResponse({
    description:
      "Another Savings Group with the specified groupName already exists on the server",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  create(
    @Body() createSavingsGroupDto: CreateSavingsGroupDto,
    @UserDecorator() user: User
  ) {
    return this.savingsGroupService.create(createSavingsGroupDto, user);
  }

  @Patch("members/add")
  @ApiOperation({
    description:
      "Adds a new member to a Savings Group, only the groupAdmin of a Savings Group can add a member to the group",
  })
  @ApiOkResponse({
    description: "SUCCESS: Specified Member added to the target Savings group",
  })
  @ApiBadRequestResponse({
    description:
      "Required Request Body is empty or contains unacceptable values",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiForbiddenResponse({
    description:
      "User making the request is not the group admin of the Savings Group",
  })
  @ApiNotFoundResponse({
    description:
      "Savings Group or user to add with specified IDs does not exist on the server",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async addSavingsGroupMember(
    @Body() addMemberDto: UpdateGroupMemberDto,
    @UserDecorator() user: User
  ) {
    const responseMessage =
      await this.savingsGroupService.addSavingsGroupMember(addMemberDto, user);

    return new SuccessResponse(200, responseMessage);
  }

  @Patch("members/remove")
  @ApiOperation({
    description:
      "Removes a member from to a Savings Group, only the groupAdmin of a Savings Group can remove a member from the group",
  })
  @ApiOkResponse({
    description:
      "SUCCESS: Specified Member removed from the target Savings group",
  })
  @ApiBadRequestResponse({
    description:
      "Required Request Body is empty or contains unacceptable values",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiForbiddenResponse({
    description:
      "User making the request is not the group admin of the Savings Group",
  })
  @ApiNotFoundResponse({
    description:
      "Savings Group or user to remove with specified IDs does not exist on the server",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async removeGroupMember(
    @Body() removeMemberDto: UpdateGroupMemberDto,
    @UserDecorator() user: User
  ) {
    const responseMessage =
      await this.savingsGroupService.removeSavingsGroupMember(
        removeMemberDto,
        user
      );

    return new SuccessResponse(200, responseMessage);
  }

  @Patch("contribute")
  @ApiOperation({
    description:
      "Members of a Savings Group can contibute funds to their Savings Group with this endpoint",
  })
  @ApiOkResponse({
    description:
      "SUCCESS: Amount sepcified in the request body added to the savings group",
  })
  @ApiBadRequestResponse({
    description:
      "Required Request Body is empty or contains unacceptable values",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiForbiddenResponse({
    description: "User making the request is not a member of the Savings Group",
  })
  @ApiNotFoundResponse({
    description:
      "Savings Group with the specified ID does not exist on the server",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async contibuteFunds(
    @UserDecorator() user: User,
    @Body() contributeFundsDto: ContributeFundsDto
  ) {
    const responseMessage =
      await this.savingsGroupService.contriubeFundsToGroup(
        user,
        contributeFundsDto
      );

    return new SuccessResponse(200, responseMessage);
  }

  @Get("name")
  @ApiOperation({
    description:
      "Search for A Savings Group by group name, only Group Admin of the group can get the group by name",
  })
  @ApiOkResponse({
    description:
      "SUCCESS: Savngs Group with the specified name on the server returned",
  })
  @ApiBadRequestResponse({
    description: "Request Param is empty or contains unacceptable values",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiForbiddenResponse({
    description:
      "User does not have the Required Permission for the requested operation",
  })
  @ApiNotFoundResponse({
    description:
      "Savings Group with the specified name does not exist on the server",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async findByName(@Query("name") name: string, @UserDecorator() user: User) {
    const responseData = await this.savingsGroupService.findByName(name, user);

    return new SuccessResponse(
      200,
      "Savings Group Retrieved By Name",
      responseData
    );
  }

  @Patch(":id")
  @UseGuards(FeatureFlagGuard("update-savings-group")) // Experimental Feature
  @ApiOperation({
    description: "Updates a Savings Group",
  })
  @ApiOkResponse({
    description: "Savings Update Successful",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiForbiddenResponse({
    description:
      "User does not have the Required Permission for the requested operation",
  })
  @ApiConflictResponse({
    description: "Savings Group with similar name exists",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  update(
    @Param("id") id: string,
    @Body() updateSavingsGroupDto: UpdateSavingsGroupDto,
    @UserDecorator() user: User
  ) {
    return this.savingsGroupService.update(id, updateSavingsGroupDto, user);
  }

  @Delete(":id")
  @ApiOperation({
    description: "Deletes a Savings Group",
  })
  @ApiOkResponse({
    description: "Savings Group Deleted",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiForbiddenResponse({
    description:
      "User does not have the Required Permission for the requested operation",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  remove(@Param("id") id: string, @UserDecorator() user: User) {
    return this.savingsGroupService.remove(id, user);
  }
}
