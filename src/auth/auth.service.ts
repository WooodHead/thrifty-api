import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { compare } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
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
            return {
                message: 'Login Successful',
                authToken: this.jwtService.sign(payload),
            };
        } catch (error) {
            throw new HttpException(error.message, error.status ?? HttpStatus.BAD_REQUEST)
        }
    }

    async logout(user: User) {
        try {
            // await this.usersRepository.update(user.id, { lastLogout: new Date() });
            return {
                message: 'Logout Successful',
            }
        } catch (error) {
            throw new HttpException(error.message, error.status ?? HttpStatus.BAD_REQUEST)
        }
    }
}
