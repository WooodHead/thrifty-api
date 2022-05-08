import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
    @IsString()
    @IsEmail({ message: 'Please enter a valid email address' })
    readonly email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    readonly password: string;
}