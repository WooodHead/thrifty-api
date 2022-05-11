import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ValidEmailDto {
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string
    
    @IsString()
    @IsNotEmpty()
    code: string;
}