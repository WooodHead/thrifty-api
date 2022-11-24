import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "@auth/guards/jwt-auth.guard";
import { UserDecorator } from "./decorators/user.decorator";
import { Role } from "./interfaces/user.interface";
import { RoleGuard } from "@auth/guards/roles.guard";
import { SuccessResponse } from "@utils/successResponse";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
@ApiTags("User")
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post()
  @ApiOperation({
    description: "Creates a New User Account",
  })
  @ApiConsumes("multipart/form-data", "application/json")
  @ApiCreatedResponse({
    description: "User Created Successfully",
  })
  @ApiConflictResponse({
    description: "User with Specified Email Already exists on the Server",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  @HttpCode(201)
  async create(@Body() createUserDto: CreateUserDto) {
    const responseData = await this.usersService.create(createUserDto);

    return new SuccessResponse(201, "User Created", responseData);
  }

  @Get("userinfo")
  @ApiBearerAuth()
  @ApiOperation({
    description: "Self-service, allows authenticated user(s) to get their data",
  })
  @ApiOkResponse({
    description: "User data Returned successfully",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  @UseGuards(JwtAuthGuard, RoleGuard(Role.USER))
  async findOne(@UserDecorator("id") id: string) {
    const responseData = await this.usersService.findOneById(id);

    return new SuccessResponse(200, "User Retrieved By ID", responseData);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RoleGuard(Role.USER))
  @ApiBearerAuth()
  @ApiOperation({
    description: "Updates the current authenticated user basic info",
  })
  @ApiOkResponse({
    description: "User Updated",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @UserDecorator("id") id: string
  ) {
    await this.usersService.update(id, updateUserDto);

    return new SuccessResponse(200, "User Updated");
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RoleGuard(Role.USER))
  @ApiBearerAuth()
  @ApiOperation({
    description: "Deletes the current authenticated User",
  })
  @ApiOkResponse({
    description: "User Deleted",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async remove(@Param("id") id: string) {
    await this.usersService.delete(id);

    return new SuccessResponse(200, "User Deleted");
  }
}
