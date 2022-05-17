import { Controller, HttpCode, Post, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiBasicAuth, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UserDecorator } from '../user/decorators/user.decorator';
import { User } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { cookieOptions } from './constants/auth.constant';


@ApiTags('Auth')
@Controller('/v1/auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @ApiBasicAuth()
    @Post('login')
    @HttpCode(200)
    @UseGuards(LocalAuthGuard)
    async login(@UserDecorator() user: User, @Res({ passthrough: true }) res: Response) {
        const { token, refreshToken } = await this.authService.login(user);
        res.cookie('jit', refreshToken, cookieOptions);
        return {
            statusCode: 200,
            message: 'Login Successful',
            authToken: token,
        };
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(200)
    async logout(@UserDecorator() user: User, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(user);
        res.clearCookie('jit', cookieOptions);
        return { message: 'Logout Successful' };
    }

    @ApiCookieAuth('JWT')
    @Post('refresh-token')
    @HttpCode(200)
    async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const { jit } = req.signedCookies;
        const { token, refreshToken } = await this.authService.validateRefreshToken(jit);
        res.cookie('jit', refreshToken, cookieOptions);
        return {
            statusCode: 200,
            message: 'Token Refresh Successful',
            authToken: token,
        };
    }
}
