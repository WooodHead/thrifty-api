import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';


export class LoginUserDto {
    
    @ApiProperty()
    @IsString()
    @IsEmail({ message: 'Please enter a valid email address' })
    readonly email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    readonly password: string;
}