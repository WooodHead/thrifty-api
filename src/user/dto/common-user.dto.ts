import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ValidEmailDto {
    @ApiProperty()
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @ApiProperty()
    @IsEmail()
    email: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    code: string;
}