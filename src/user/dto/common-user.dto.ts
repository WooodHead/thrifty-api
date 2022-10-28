import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidEmailDto {
    
    @ApiProperty()
    @IsEmail()
    readonly email: string;
    
}

export class ResetPasswordDto extends ValidEmailDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly password: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly code: string;
}