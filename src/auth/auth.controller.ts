import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Req,
  Res,
  Put,
} from "@nestjs/common";
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Request, Response } from "express";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { AuthService } from "./auth.service";
import { UserDecorator } from "@user/decorators/user.decorator";
import { User } from "@user/entities/user.entity";
import { cookieOptions } from "./constants/auth.constant";
import { LoginUserDto } from "./dto/login-user.dto";
import { SuccessResponse } from "@utils/successResponse";
import {
  ChangePasswordDto,
  ValidEmailDto,
  ResetPasswordDto,
} from "./dto/auth.dto";
import { SkipAuth } from "./decorators/skip-auth.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiBasicAuth()
  @ApiBody({ type: LoginUserDto })
  @ApiConsumes("application/x-www-form-urlencoded", "application/json")
  @ApiOperation({
    description: "Login User with valid credentials",
  })
  @ApiOkResponse({
    description: "Successful Login",
  })
  @ApiUnauthorizedResponse({
    description: "Login Attempt failed due to invalid credentials",
  })
  @ApiInternalServerErrorResponse({
    description:
      "An Internal Server Error occured while processing the request",
  })
  @HttpCode(200)
  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  async login(
    @UserDecorator() user: User,
    @Res({ passthrough: true }) res: Response
  ) {
    const { token, refreshToken } = await this.authService.login(user);

    res.cookie("jit", refreshToken, cookieOptions);

    return new SuccessResponse(200, "Login Successful", token);
  }

  @Post("logout")
  @ApiBearerAuth()
  @ApiOperation({
    description: "Log out a user and clears refresh token cookies",
  })
  @ApiOkResponse({
    description: "Logout successful",
  })
  @ApiUnauthorizedResponse({
    description: "Access Token supplied with the request has expired",
  })
  @ApiInternalServerErrorResponse({
    description:
      "An Internal Server Error occured while processing the request",
  })
  @HttpCode(200)
  async logout(
    @UserDecorator() user: User,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.logout(user);

    res.clearCookie("jit", cookieOptions);

    return new SuccessResponse(200, "Logout Successful");
  }

  @Post("refresh-token")
  @ApiCookieAuth()
  @ApiOperation({
    description: "Gets a new Token with a valid refresh token",
  })
  @ApiOkResponse({
    description: "Token Refresh successful",
  })
  @ApiNotFoundResponse({
    description: "Cookie with Refresh token not included in the request",
  })
  @ApiUnauthorizedResponse({
    description: "Refresh Token supplied with the request has expired",
  })
  @ApiInternalServerErrorResponse({
    description:
      "An Internal Server Error occured while processing the request",
  })
  @HttpCode(200)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const { jit } = req.signedCookies;

    const { token, refreshToken } = await this.authService.validateRefreshToken(
      jit
    );

    res.cookie("jit", refreshToken, cookieOptions);

    return new SuccessResponse(200, "Token Refresh Successful", token);
  }

  @Post("get-code")
  @ApiOperation({
    description:
      "Get Verification for password reset, email supplied with the reuqest must be registered against a user",
  })
  @ApiOkResponse({
    description: "Verification Code successfully sent to the specified email",
  })
  @ApiNotFoundResponse({
    description: "A User with the Specified Email does not exist on the server",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async getVerificationCode(@Body() emailDto: ValidEmailDto) {
    const { email } = emailDto;

    await this.authService.getVerificationCode(email);

    return new SuccessResponse(200, "Verification Code Sent");
  }

  @Put("reset-password")
  @HttpCode(204)
  @ApiConsumes("multipart/form-data", "application/json")
  @ApiOperation({
    description:
      "Password Reset for Unauthenticated User(s) who forgot their password, a valid verification code must be supplied with this request",
  })
  @ApiOkResponse({
    description: "Password Reset Successful",
  })
  @ApiForbiddenResponse({
    description: "Verification Code Supplied is invalid or it has expired",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Put("change-password")
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data", "application/json")
  @ApiOperation({
    description:
      "Password change for Authenticated User(s) who know their password",
  })
  @ApiOkResponse({
    description: "Password Change Successful",
  })
  @ApiUnauthorizedResponse({
    description:
      "Access Token supplied with the request has expired or is invalid",
  })
  @ApiInternalServerErrorResponse({
    description: "An Internal Error Occurred while processing the request",
  })
  @HttpCode(204)
  async changePassword(
    @UserDecorator("id") id: string,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(id, changePasswordDto);
  }
}
