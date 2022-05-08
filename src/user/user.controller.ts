import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDecorator } from './decorators/user.decorator';
import { Role } from './interfaces/user.interface';
import { RoleGuard } from 'src/auth/guards/roles.guard';

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

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.delete(id);
    }

}
