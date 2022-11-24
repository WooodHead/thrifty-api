import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ValidEmailDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @MinLength(6, {
    message: "Current Password must be at least six characters long",
  })
  @IsString()
  readonly currentPassword: string;

  @ApiProperty()
  @MinLength(6, {
    message: "New Password must be at least six characters long",
  })
  @IsString()
  readonly newPassword: string;
}

export class ResetPasswordDto extends ValidEmailDto {
  @ApiProperty()
  @MinLength(6, {
    message: "New Password must be at least six characters long",
  })
  @IsString()
  @IsNotEmpty()
  readonly newPassword: string;

  @ApiProperty()
  @Length(6)
  @IsString()
  @IsNotEmpty()
  readonly code: string;
}
