import {
    Injectable,
    NotFoundException,
    HttpException,
    UnauthorizedException,
    HttpStatus,
    ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/common-user.dto';
import { EmailService } from '@services/email/email.service';
import { SendMailOptions } from '@services/email/interfaces/email.interface';
import { getVerificationEmailTemplate } from '@services/email/templates/verificationCode';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { PostgresErrorCodes } from '@common/interfaces/postgresErrorCodes';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly emailService: EmailService
    ) { }

    async findAll(query: PaginateQuery): Promise<Paginated<User>> {
        try {

            return await paginate(query, this.usersRepository, {
                sortableColumns: ['createdAt'],
                select: ['id', 'email', 'firstName', 'lastName', 'createdAt', 'lastLogin', 'updatedAt'],
                defaultSortBy: [['createdAt', 'DESC']],
            });

        } catch (error) {
            console.error(error);
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

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

    async getVerificationCode(email: string): Promise<boolean> {
        try {

            const foundUser = await this.usersRepository.findOne({
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                },
                where: { email }
            });

            if (foundUser) {

                const code = await foundUser.generatePasswordResetCode();

                const { firstName, lastName } = foundUser

                const mailOptions: SendMailOptions = [
                    email,
                    'Verification code',
                    `Your verification code is ${code}`,
                    getVerificationEmailTemplate(firstName, lastName, code)
                ];

                await this.emailService.sendEmail(...mailOptions)

                return true
            }

            throw new NotFoundException(`User with email: ${email} not found on this server`)

        } catch (error) {
            console.error(error)
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
        try {

            const { email, code, password } = resetPasswordDto

            const foundUser = await this.usersRepository.findOne({
                select: {
                    id: true,
                    email: true,
                    password: true,
                    resetPassword: {
                        code: true,
                        expiresBy: true
                    }
                },
                where: { email }
            });

            if (foundUser && await foundUser.verifyPasswordResetCode(code)) {

                return await foundUser.updatePassword(password)

            }

            throw new ForbiddenException('Verification code is invalid or it has expired')

        } catch (error) {
            console.error(error)
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async changePassword(id: string, changePasswordDto: UpdateUserPasswordDto): Promise<boolean> {
        try {

            const foundUser = await this.usersRepository.findOne({
                select: {
                    id: true,
                    password: true
                },
                where: { id }
            });

            if (foundUser) {

                const { password } = changePasswordDto;

                return await foundUser.updatePassword(password)

            }

            throw new NotFoundException(`User with ${id} not found on this server`)

        } catch (error) {
            console.error(error)
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

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
