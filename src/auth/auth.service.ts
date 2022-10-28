import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { UserService } from '@user/user.service';
import { User } from '@user/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
    ) { }

    async validateUser(email: string, pass: string): Promise<User> {
        try {

            const user = await this.usersService.findOneByEmail(email);

            if (user && await user.isPasswordValid(pass)) {
                user.lastLogin = new Date();
                await this.usersRepository.save(user);
                return user;
            };

            throw new UnauthorizedException('Invalid Credentials');

        } catch (error) {
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    };

    async validateJwt(sub: string): Promise<any> {
        try {

            const user = await this.usersRepository.findOne({
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    lastLogin: true,
                    isActive: true,
                    personalKey: true,
                    roles: true
                },
                where: { id: sub }
            });

            if (user) {

                return user;
            }

            throw new UnauthorizedException('Invalid Credentials');

        } catch (error) {
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async login(user: User) {
        try {

            const personalKey = await user.generatePersonalKey();

            const payload = {
                sub: user.id,
                email: user.email,
                name: user.firstName + ' ' + user.lastName,
                lastLogin: user.lastLogin,
                roles: user.roles,
                isActive: user.isActive,
                rtk: personalKey,
            };

            const token = this.jwtService.sign(payload);

            const refreshToken = sign(
                payload,
                {
                    key: this.configService.get<string>('REFRESH_TOKEN_PRIVATE_KEY'),
                    passphrase: this.configService.get<string>('REFRESH_TOKEN_SECRET')
                },
                {
                    algorithm: 'RS256',
                    expiresIn: '7d'
                }
            );

            await user.updateRefreshToken(refreshToken);

            return { token, refreshToken };

        } catch (error) {
            console.error(error);
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async logout(user: User) {
        try {

            const logOutUser = await this.usersRepository.findOneBy({ id: user.id });

            await logOutUser.generatePersonalKey();

        } catch (error) {
            console.error(error);
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async validateRefreshToken(token: string): Promise<any> {
        try {

            if (!token) throw new BadRequestException('Refresh Token Missing');

            const { sub, rtk } = verify(token, this.configService.get<string>('REFRESH_TOKEN_PUBLIC_KEY')) as JwtPayload;

            const user = await this.usersRepository.findOne({
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    lastLogin: true,
                    isActive: true,
                    personalKey: true,
                    roles: true
                },
                where: { id: sub }
            });

            if (user && user.validatePersonalKey(rtk)) {
                return await this.login(user);
            };

            throw new UnauthorizedException('Invalid Refresh Token');

        } catch (error) {
            console.error(error);
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
