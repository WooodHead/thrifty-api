import { Injectable, ConflictException, NotFoundException, HttpException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
    ) { }

    async findOneByEmail(email: string): Promise<User> {
        try {
            const foundUser = await this.usersRepository.findOne({ email });
            if (!foundUser) throw new UnauthorizedException('Invalid Credentials');
            return foundUser;
        } catch (error) {
            console.error(error)
            throw new HttpException(error.message, error.status);
        }
    };

    async findOneById(id: string): Promise<User> {
        try {
            const foundUser = await this.usersRepository.findOne(id);
            if (!foundUser) throw new NotFoundException(`User with id: ${id} does not exist on this server`);
            return foundUser;
        } catch (error) {
            console.error(error.message)
            throw new HttpException(error.message, error.status);
        }
    };

    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            const isUserExist = await this.usersRepository.findOne({ email: createUserDto.email })
            if (isUserExist) throw new ConflictException(`User with ${createUserDto.email} already exists`);

            const newUser = this.usersRepository.create(createUserDto);
            await this.usersRepository.save(newUser);

            return newUser;
        } catch (error) {
            console.error(error.message)
            throw new HttpException(error.message, error.status);
        }
    };

    async delete(id: string) {

        try {
            await this.usersRepository.delete(id);
            return { statusCode: 200, message: 'User deleted' };
        } catch (error) {
            console.error(error.message)
            throw new HttpException(error.message, error.status);
        }
    }
}
