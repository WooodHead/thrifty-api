import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
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
    ApiUnauthorizedResponse,
    ApiOperation
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDecorator } from './decorators/user.decorator';
import { Role } from './interfaces/user.interface';
import { RoleGuard } from '@auth/guards/roles.guard';
import { PaginateQuery } from 'nestjs-paginate';
import { SuccessResponse } from '@utils/successResponse';


@Controller('users')
@ApiTags('User')
export class UserController {
    constructor(private readonly usersService: UserService) { }

    @Post()
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
