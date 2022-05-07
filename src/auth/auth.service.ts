import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        try {
            const user = await this.usersService.findOneByEmail(email);
            const isPasswordMatched = await compare(pass, user.password);
            if (!isPasswordMatched) throw new UnauthorizedException('Invalid Credentials');
            return user;
        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    };

    async login(user: User) {
        try {
            const payload = { 
                sub: user.id,
                email: user.email,  
                firstName: user.firstName, 
                lastName: user.lastName,
                role: user.role, 
                isActive: user.isActive, 
            };
            return {
                access_token: this.jwtService.sign(payload),
            };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }
}
