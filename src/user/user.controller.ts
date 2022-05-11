import { Controller, Get, Post, Put, Body, Param, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDecorator } from './decorators/user.decorator';
import { Role } from './interfaces/user.interface';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { ResetPasswordDto, ValidEmailDto } from './dto/common-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('v1/users')
export class UserController {
    constructor(private readonly usersService: UserService) { }

    @Post('create')
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get('userinfo')
    @UseGuards(JwtAuthGuard, RoleGuard(Role.USER))
    findOne(@UserDecorator('id') id: string) {
        return this.usersService.findOneById(id);
    }

    @Get('get-verification-code/:email')
    async getVerificationCode(@Param() params: ValidEmailDto) {
        const { email } = params;
        return this.usersService.getVerificationCode(email);
    }

    @Put('reset-password')
    @HttpCode(204)
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.usersService.resetPassword(resetPasswordDto);
    }

    @Put('change-password')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    async changePassword(@UserDecorator('id') id: string, @Body() changePasswordDto: UpdateUserPasswordDto) {
        return this.usersService.changePassword(id, changePasswordDto)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.delete(id);
    }

}
