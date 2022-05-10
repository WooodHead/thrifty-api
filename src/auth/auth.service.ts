import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { compare } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

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
            if (!user) throw new UnauthorizedException('Invalid Credentials');
            const isPasswordMatched = await compare(pass, user.password);
            if (!isPasswordMatched) throw new UnauthorizedException('Invalid Credentials');
            await this.usersRepository.update(user.id, { lastLogin: new Date() });
            return user;
        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    };

    async validateJwt(sub: string): Promise<any> {
        try {
            const user = await this.usersRepository.findOne(sub);
            if (user) {
                const { refreshToken, resetPassword, ...data } = user;
                return data;
            }
            throw new UnauthorizedException('Invalid Credentials');
        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async login(user: User) {
        try {
            const payload = {
                sub: user.id,
                email: user.email,
                name: user.firstName + ' ' + user.lastName,
                lastLogin: user.lastLogin,
                roles: user.roles,
                isActive: user.isActive,
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
            return { token, refreshToken };
        } catch (error) {
            console.error(error);
            throw new HttpException(error.message ?? 'SOMETHING WENT WRONG', error.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async logout(user: User) {
        try {
            const personalKey = randomBytes(32).toString('hex');
            await this.usersRepository.update(user.id, { personalKey });
        } catch (error) {
            console.error(error);
            throw new HttpException(error.message ?? 'SOMETHING WENT WRONG', error.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async validateRefreshToken(token: string): Promise<any> {
        try {
            const decoded = verify(token, this.configService.get<string>('REFRESH_TOKEN_PUBLIC_KEY')) as JwtPayload;
            const user = await this.usersRepository.findOne(decoded.sub);
            if (user) {
                return await this.login(user);
            }
            throw new UnauthorizedException('Invalid Credentials');
        } catch (error) {
            console.error(error);
            throw new HttpException(error.message ?? 'SOMETHING WENT WRONG', error.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
