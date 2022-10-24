import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UseGuards
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiConsumes,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiInternalServerErrorResponse,
    ApiCreatedResponse,
    ApiConflictResponse,
    ApiNotFoundResponse,
    ApiUnauthorizedResponse,
    ApiOperation
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDecorator } from './decorators/user.decorator';
import { Role } from './interfaces/user.interface';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { ResetPasswordDto, ValidEmailDto } from './dto/common-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user.dto';
import { PaginateQuery } from 'nestjs-paginate';
import { SuccessResponse } from '../utils/successResponse';


@ApiTags('User')
@Controller('users')
export class UserController {
    constructor(private readonly usersService: UserService) { }

    @Post('register')
    @ApiOperation({
        description: 'Creates a New User Account'
    })
    @ApiConsumes('multipart/form-data', 'application/json')
    @ApiCreatedResponse({
        description: 'User Created Successfully'
    })
    @ApiConflictResponse({
        description: 'User with Specified Email Already exists on the Server'
    })
    @ApiInternalServerErrorResponse({
        description: 'An Internal Error Occurred while processing the request'
    })
    @HttpCode(201)
    async create(@Body() createUserDto: CreateUserDto) {

        const responseData = await this.usersService.create(createUserDto);

        return new SuccessResponse(201, 'User Created', responseData)
    };

    @Get('')
    @ApiBearerAuth()
    @ApiOperation({
        description: 'Returns all Users on the Server, Only User(s) with with User Admin Privileges can make a successful request to this endpoint'
    })
    @ApiOkResponse({
        description: 'All Users Fetched Successfully'
    })
    @ApiUnauthorizedResponse({
        description: 'Access Token supplied with the request has expired or is invalid'
    })
    @ApiForbiddenResponse({
        description: 'User does not have Required Permission to fetch all users data'
    })
    @ApiInternalServerErrorResponse({
        description: 'An Internal Error Occurred while processing the request'
    })
    @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
    async findAll(@Query() query: PaginateQuery) {

        const responseData = await this.usersService.findAll(query);

        return new SuccessResponse(200, 'All Users', responseData);

    };

    @Get('userinfo')
    @ApiBearerAuth()
    @ApiOperation({
        description: 'Self-service, allows authenticated user(s) to get their data'
    })
    @ApiOkResponse({
        description: 'User data Returned successfully'
    })
    @ApiUnauthorizedResponse({
        description: 'Access Token supplied with the request has expired or is invalid'
    })
    @ApiInternalServerErrorResponse({
        description: 'An Internal Error Occurred while processing the request'
    })
    @UseGuards(JwtAuthGuard, RoleGuard(Role.USER))
    async findOne(@UserDecorator('id') id: string) {

        const responseData = await this.usersService.findOneById(id);

        return new SuccessResponse(200, 'User Retrieved By ID', responseData)

    }

    @Post('verification-code')
    @ApiOperation({
        description: 'Get Verification for password reset, email supplied with the reuqest must be registered against a user'
    })
    @ApiOkResponse({
        description: 'Verification Code successfully sent to the specified email'
    })
    @ApiNotFoundResponse({
        description: 'A User with the Specified Email does not exist on the server'
    })
    @ApiInternalServerErrorResponse({
        description: 'An Internal Error Occurred while processing the request'
    })
    async getVerificationCode(@Body() emailDto: ValidEmailDto) {
        
        const { email } = emailDto;
        
        await this.usersService.getVerificationCode(email);

        return new SuccessResponse(200, 'Verification Code Sent')

    }

    @Put('reset-password')
    @HttpCode(204)
    @ApiConsumes('multipart/form-data', 'application/json')
    @ApiOperation({
        description: 'Password Reset for Unauthenticated User(s) who forgot their password, a valid verification code must be supplied with this request'
    })
    @ApiOkResponse({
        description: 'Password Reset Successful'
    })
    @ApiForbiddenResponse({
        description: 'Verification Code Supplied is invalid or it has expired'
    })
    @ApiInternalServerErrorResponse({
        description: 'An Internal Error Occurred while processing the request'
    })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.usersService.resetPassword(resetPasswordDto);
    }

    @Put('change-password')
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data', 'application/json')
    @ApiOperation({
        description: 'Password change for Authenticated User(s) who know their password'
    })
    @ApiOkResponse({
        description: 'Password Change Successful'
    })
    @ApiUnauthorizedResponse({
        description: 'Access Token supplied with the request has expired or is invalid'
    })
    @ApiInternalServerErrorResponse({
        description: 'An Internal Error Occurred while processing the request'
    })
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    async changePassword(@UserDecorator('id') id: string, @Body() changePasswordDto: UpdateUserPasswordDto) {
        return this.usersService.changePassword(id, changePasswordDto)
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({
        description: 'Deletes a user account, THIS ENDPOINT IS NOT FULLY COMPLETE'
    })
    async remove(@Param('id') id: string) {
        
        await this.usersService.delete(id);

        return new SuccessResponse(200, 'User Deleted')
        
    }

}
