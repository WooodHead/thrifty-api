import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { PaginateQuery } from "nestjs-paginate";
import { TransactionService } from "./transaction.service";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { UserDecorator } from "../user/decorators/user.decorator";
import {
  AccountIdDto,
  TransactionDateDto,
  TransactionDateRangeDto,
  TransactionAccountDateDto,
  TransactionAccountDateRangeDto,
  TransactionIdDto,
} from "./dto/common-transaction.dto";
import { SuccessResponse } from "../utils/successResponse";

@Controller("transactions")
@ApiTags("Transactions")
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get("user")
  @ApiOperation({
    description:
      "Returns All Transactions By an Authenticated User. Request can be paginated",
  })
  @ApiOkResponse({
    description:
      "SUCCESS: All Transactions by the Authenticated User on the server returned",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async findAllByUser(
    @UserDecorator("id") id: string,
    @Query() query: PaginateQuery
  ) {
    const responseData = await this.transactionService.findByUser(id, query);

    return new SuccessResponse(200, "All Transactions By User", responseData);
  }

  @Get("user/:searchDate")
  @ApiOperation({
    description:
      "Returns All Transactions By an Authenticated User on a given date. Request can be paginated",
  })
  @ApiOkResponse({
    description:
      "SUCCESS: All Transactions by the Authenticated User on the specified date returned",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async findByUserAndDate(
    @Param() params: TransactionDateDto,
    @Query() query: PaginateQuery,
    @UserDecorator("id") id: string
  ) {
    const responseData = await this.transactionService.findByUserAndDate(
      id,
      params.searchDate,
      query
    );

    return new SuccessResponse(
      200,
      "All Transactions By User and Date",
      responseData
    );
  }

  @Get("user/date-range")
  @ApiOperation({
    description:
      "Returns All Transactions By an Authenticated User within a given date range. Request can be paginated",
  })
  @ApiOkResponse({
    description:
      "SUCCESS: All Transactions by the Authenticated User within the given date range returned",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async findByUserAndDateRange(
    @Body() dateRangeDto: TransactionDateRangeDto,
    @Query() query: PaginateQuery,
    @UserDecorator("id") id: string
  ) {
    const responseData = await this.transactionService.findByUserAndDateRange(
      id,
      dateRangeDto,
      query
    );

    return new SuccessResponse(
      200,
      "Transactions By User and Date Range",
      responseData
    );
  }

  @Get("account")
  @ApiOperation({
    description: `Returns All Transactions done by the authenticated on a given Account by the Account ID, 
    only Users with Admin Privileges can make a successful request to this endpoint. 
    Request can be paginated`,
  })
  @ApiOkResponse({
    description:
      "SUCCESS: All Transactions for the specified Account ID on the server returned",
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
  async findByAccount(
    @Body() accountIDDto: AccountIdDto,
    @Query() query: PaginateQuery,
    @UserDecorator("id") id: string
  ) {
    const { accountId } = accountIDDto;

    const responseData = await this.transactionService.findByAccountAndUser(
      accountId,
      id,
      query
    );

    return new SuccessResponse(
      200,
      "Transactions Retrieved By Account",
      responseData
    );
  }

  @Get("account/date")
  @ApiOperation({
    description: `Returns All Transactions done by the authenticated on a given Account by the Account ID on a given date, 
    Request can be paginated`,
  })
  @ApiOkResponse({
    description:
      "SUCCESS: All Transactions for the specified Account ID on the given search date returned",
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
  async findByAccountAndDate(
    @Body() transactionDateDto: TransactionAccountDateDto,
    @Query() query: PaginateQuery,
    @UserDecorator("id") id: string
  ) {
    const responseData = await this.transactionService.findByAccountUserAndDate(
      transactionDateDto,
      query,
      id
    );

    return new SuccessResponse(
      200,
      "Transaction Retreived By Account and Date",
      responseData
    );
  }

  @Get("account/date-range")
  @ApiOperation({
    description: `Returns All Transactions done by the authenticated on a given Account by the Account ID and by a given date range. 
    Request can be paginated`,
  })
  @ApiOkResponse({
    description:
      "SUCCESS: All Transactions for the specified Account ID on the given search date range returned",
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
  async findByAccountAndDateRange(
    @Body() dateRangeDto: TransactionAccountDateRangeDto,
    @Query() query: PaginateQuery,
    @UserDecorator("id") id: string
  ) {
    const responseData =
      await this.transactionService.findByAccountUserAndDateRange(
        dateRangeDto,
        query,
        id
      );

    return new SuccessResponse(
      200,
      "Transactions Retrieved By Date Range",
      responseData
    );
  }

  @Patch(":id")
  @ApiOperation({
    description: "Updates a Transaction, NOT YET COMPLETE",
  })
  async update(
    @Param() params: TransactionIdDto,
    @Body() updateTransactionDto: UpdateTransactionDto
  ) {
    const { transactionId } = params;

    const responseData = await this.transactionService.update(
      transactionId,
      updateTransactionDto
    );

    return new SuccessResponse(200, "Transaction Updated", responseData);
  }
}
