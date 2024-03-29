import {
  Controller,
  Delete,
  Get,
  Post,
  Param,
  Patch,
  Query,
  UseGuards,
  Body,
  HttpCode,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@auth/guards/jwt-auth.guard";
import { RoleGuard } from "@auth/guards/roles.guard";
import { Role } from "@user/interfaces/user.interface";
import { SuccessResponse } from "@utils/successResponse";
import { PaginateQuery } from "nestjs-paginate";
import { AdminService } from "./admin.service";
import { BillPaymentService } from "@api-services/bill-payment/bill-payment.service";
import { BillCategoryDto } from "@api-services/bill-payment/dto/bill-payment.dto";
import { EntityIdDto } from "./dto/admin.dto";
import { FeatureFlagService } from "./feature-flag/feature-flag.service";
import {
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
} from "./dto/featureFlag.dto";
import {
  TransactionDateDto,
  TransactionDateRangeDto,
} from "@transaction/dto/common-transaction.dto";
import { Roles } from "@auth/decorators/role.decorator";

@Controller("admin")
@Roles(Role.ADMIN)
@ApiTags("Admin")
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly billPaymentService: BillPaymentService
  ) {}

  @Get("users")
  @ApiOperation({
    description:
      "Returns all Users on the Server, Only User(s) with with User Admin Privileges can make a successful request to this endpoint",
  })
  @ApiOkResponse({
    description: "All Users Fetched Successfully",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiForbiddenResponse({
    description:
      "User does not have Required Permission to fetch all users data",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async findAllUsers(@Query() query: PaginateQuery) {
    const responseData = await this.adminService.findAllUsers(query);

    return new SuccessResponse(200, "All Users", responseData);
  }

  @Get("accounts")
  @ApiOperation({
    description: `Returns All Accounts on the Server, 
    only Users with Admin Privileges can make a successful request to this endpoint. 
    Request can be paginated`,
  })
  @ApiOkResponse({
    description: "SUCCESS: All Accounts on the server returned",
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
  async findAllAccounts(@Query() query: PaginateQuery) {
    const responseData = await this.adminService.findAllAccounts(query);

    return new SuccessResponse(200, "All Accounts", responseData);
  }

  @Get("accounts/:id")
  @ApiOperation({
    description:
      "Searches for an Account by account ID. Admin privileges required to call this endpoint",
  })
  @ApiOkResponse({
    description:
      "SUCCESS: Account with the specified account ID on the server returned",
  })
  @ApiBadRequestResponse({
    description: "Request Parameter is empty or contains unacceptable values",
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
    description: "Project with the specified name does not exist on the server",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async findAccountByID(@Param() params: EntityIdDto) {
    const { id } = params;

    const responseData = await this.adminService.findAccountByID(id);

    return new SuccessResponse(200, "Account Retrieved By ID", responseData);
  }

  @Get("transactions")
  @ApiOperation({
    description: `Returns All Transactions on the Server, 
    only Users with Admin Privileges can make a successful request to this endpoint. 
    Request can be paginated`,
  })
  @ApiOkResponse({
    description: "SUCCESS: All Transactions on the server returned",
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
  async findAllTransactions(@Query() query: PaginateQuery) {
    const responseData = await this.adminService.findAllTransactions(query);

    return new SuccessResponse(200, "All Transactions", responseData);
  }

  @Get("transactions/:id")
  @ApiOperation({
    description:
      "Returns a Transaction by ID, only Users with Admin Privileges can make a successful request to this endpoint",
  })
  @ApiOkResponse({
    description:
      "SUCCESS: Transaction with the specified ID on the server returned",
  })
  @ApiBadRequestResponse({
    description:
      "Required Request Parameter is empty or contains unacceptable values",
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
      "Savings Group with the specified ID does not exist on the server",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async findOne(@Param() params: EntityIdDto) {
    const { id } = params;

    const responseData = await this.adminService.findTransactionByID(id);

    return new SuccessResponse(
      200,
      "Transaction Retrieved By ID",
      responseData
    );
  }

  @Get("transactions/date/:searchDate")
  @ApiOperation({
    description: `Returns All Transactions done on a given date on the Server, 
    only Users with Admin Privileges can make a successful request to this endpoint. 
    Request can be paginated`,
  })
  @ApiOkResponse({
    description:
      "SUCCESS: All Transactions for the specified date on the server returned",
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
  async findByDate(
    @Param() params: TransactionDateDto,
    @Query() query: PaginateQuery
  ) {
    const responseData = await this.adminService.findTransactionByDate(
      params.searchDate,
      query
    );

    return new SuccessResponse(200, "Transactions By Date", responseData);
  }

  @Get("transactions/date-range")
  @ApiOperation({
    description: `Returns All Transactions within a given date range on the Server, 
    only Users with Admin Privileges can make a successful request to this endpoint. 
    Request can be paginated`,
  })
  @ApiOkResponse({
    description:
      "All Transactions within the specified date range on the server returned",
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
  async findByDateRange(
    @Body() dateRangeDto: TransactionDateRangeDto,
    @Query() query: PaginateQuery
  ) {
    const responseData = await this.adminService.findTransactionByDateRange(
      dateRangeDto,
      query
    );

    return new SuccessResponse(
      200,
      "All Transactions By Date Range",
      responseData
    );
  }

  @Get("savings-groups")
  @ApiOperation({
    description: `Returns All Savings Group on the Server, 
    only Users with Admin Privileges can make a successful request to this endpoint. 
    Request can be paginated`,
  })
  @ApiOkResponse({
    description: "SUCCESS: All Savings Group on the server returned",
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
  async findAll(@Query() query: PaginateQuery) {
    const responseData = await this.adminService.findAllSavingsGroups(query);

    return new SuccessResponse(200, "All Savings Groups", responseData);
  }

  @Get("savings-group/:id")
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiOperation({
    description:
      "Returns a Savings Group by ID, only Users with Admin Privileges can make a successful request to this endpoint",
  })
  @ApiOkResponse({
    description:
      "SUCCESS: Savings Group with the specified ID on the server returned",
  })
  @ApiBadRequestResponse({
    description:
      "Required Request Parameter is empty or contains unacceptable values",
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
      "Savings Group with the specified ID does not exist on the server",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async findSavingsGroupByID(@Param("id") id: string) {
    const responseData = await this.adminService.findSavingsGroupByID(id);

    return new SuccessResponse(
      200,
      "Savings Group Retrieved By ID",
      responseData
    );
  }

  @Get("bill-payment/products")
  @ApiOperation({
    description:
      "Returns all Product types for making bill payments. Admin privileges required to call this endpoint",
  })
  @ApiOkResponse({
    description: "SUCCESS: All available bill payment product types returned",
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
    description: "Project with the specified name does not exist on the server",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async getAllBillerCategories() {
    const responseData = await this.billPaymentService.getBillCategories();

    return new SuccessResponse(200, "Bill Payment Categories", responseData);
  }

  @Get("bill-payment/products/type")
  @ApiOperation({
    description:
      "Returns bill payments products filtered by bill type. Admin privileges required to call this endpoint",
  })
  @ApiOkResponse({
    description:
      "SUCCESS: All available bill payment product types matching the filter criteria returned",
  })
  @ApiBadRequestResponse({
    description: "Request Parameter is empty or contains unacceptable values",
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
    description: "Project with the specified name does not exist on the server",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async getFlutterwaveBiller(@Query() billTypeDto: BillCategoryDto) {
    const { billType } = billTypeDto;

    const responseData = await this.billPaymentService.getBillCategoryByType(
      billType
    );

    return new SuccessResponse(
      200,
      "Bill Payment Category By Type",
      responseData
    );
  }

  @Post("feature-flags")
  @ApiOperation({
    description: "Creates a new Flag",
  })
  @ApiCreatedResponse({
    description: "SUCCESS: Feature Flag Created",
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
      "User does not have the Required Permission for the requested operation",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  @HttpCode(201)
  async createFeatureFlag(@Body() createFeatureFlagDto: CreateFeatureFlagDto) {
    const responseData = await this.featureFlagService.createFeatureFlag(
      createFeatureFlagDto
    );

    return new SuccessResponse(201, "Feature Flag Created", responseData);
  }

  @Patch("feature-flags/:id")
  @ApiOperation({
    description: "Updates A Feature Flag",
  })
  @ApiOkResponse({
    description: "Feature Flag Update Successful",
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
    description: "Feature Flag with the supplied id not found",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async updateFeatureFlag(
    @Param() params: EntityIdDto,
    @Body() updateFeatureFlagDto: UpdateFeatureFlagDto
  ) {
    const { id } = params;

    await this.featureFlagService.updateFeatureFlag(id, updateFeatureFlagDto);

    return new SuccessResponse(200, "Feature Flag Updated");
  }

  @Delete("feature-flags/:id")
  @ApiOperation({
    description: "Deletes a Feature Flag",
  })
  @ApiOkResponse({
    description: "Feature Flag Deleted Successfully",
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
    description: "Feature Flag with the supplied id not found",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async removeFeatureFlag(@Param() params: EntityIdDto) {
    const { id } = params;

    await this.featureFlagService.deleteFeatureFlag(id);

    return new SuccessResponse(200, "Account Deleted");
  }
}
