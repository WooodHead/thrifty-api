import { Controller, HttpCode, Post, UseGuards, Req, Res } from '@nestjs/common';
import {
    ApiBasicAuth,
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCookieAuth,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UserDecorator } from '../user/decorators/user.decorator';
import { User } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { cookieOptions } from './constants/auth.constant';
import { LoginUserDto } from './dto/login-user.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiBasicAuth()
    @ApiBody({ type: LoginUserDto })
    @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
    @ApiOperation({
        description: 'Logs in a User with valid email/password combinations'
    })
    @ApiOkResponse({
        description: 'Successful Login'
    })
    @ApiUnauthorizedResponse({
        description: 'Login Attempt failed due to invalid email/password combination'
    })
    @ApiInternalServerErrorResponse({
        description: 'An Internal Server Error occured while processing the request'
    })
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

    @Post('logout')
    @ApiBearerAuth()
    @ApiOperation({
        description: 'Logs out a user and clears refresh token cookies'
    })
    @ApiOkResponse({
        description: 'Logout successful'
    })
    @ApiUnauthorizedResponse({
        description: 'Access Token supplied with the request has expired'
    })
    @ApiInternalServerErrorResponse({
        description: 'An Internal Server Error occured while processing the request'
    })
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    async logout(@UserDecorator() user: User, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(user);
        res.clearCookie('jit', cookieOptions);
        return { message: 'Logout Successful' };
    }

    @Post('refresh-token')
    @ApiCookieAuth()
    @ApiOperation({
        description: 'Gets a new Token with a valid refresh token'
    })
    @ApiOkResponse({
        description: 'Token Refresh successful'
    })
    @ApiNotFoundResponse({
        description: 'Cookie with Refresh token not included in the request'
    })
    @ApiUnauthorizedResponse({
        description: 'Refresh Token supplied with the request has expired'
    })
    @ApiInternalServerErrorResponse({
        description: 'An Internal Server Error occured while processing the request'
    })
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
