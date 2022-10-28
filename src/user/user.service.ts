import {
    Injectable,
    NotFoundException,
    HttpException,
    UnauthorizedException,
    HttpStatus
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { PostgresErrorCodes } from '@common/interfaces/postgresErrorCodes';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
    ) { }

    async findOneByEmail(email: string): Promise<User> {
        try {

            const foundUser = await this.usersRepository.findOneBy({ email });

            if (foundUser) {
                return foundUser;
            };

            throw new UnauthorizedException('Invalid Credentials');

        } catch (error) {
            console.error(error)
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    };

    async findOneById(id: string): Promise<Partial<User>> {
        try {

            const foundUser = await this.usersRepository.findOne({
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
                where: { id }
            });

            if (foundUser) {

                return foundUser;
            };

            throw new NotFoundException(`User with id: ${id} does not exist on this server`);

        } catch (error) {
            console.error(error.message)
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    };

    async create(createUserDto: CreateUserDto): Promise<User> {
        try {

            const newUser = this.usersRepository.create(createUserDto);

            await this.usersRepository.save(newUser);

            return newUser;

        } catch (error) {
            console.error(error.message)
            if (error?.code === PostgresErrorCodes.UniqueViolation) {
                throw new HttpException(
                    `User with ${createUserDto.email} already exists`,
                    HttpStatus.BAD_REQUEST,
                );
            }
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    };

    async delete(id: string) {
        try {

            return await this.usersRepository.delete(id);

        } catch (error) {
            console.error(error.message)
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
