import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  MinLength,
  ValidateNested,
} from "class-validator";
import {
  TransactionMode,
  TransactionStatus,
  TransactionType,
} from "../interfaces/transaction.interface";
import { User } from "../../user/entities/user.entity";
import { Account } from "../../account/entities/account.entity";

export class ExternalAccountDto {
  @IsString()
  @Length(10, 10, {
    message:
      "Invalid Account Number: Outgoing Account Number must be 10 characters long",
  })
  @IsNotEmpty()
  accountNumber: number;

  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  accountName: string;

  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  accountType: string;

  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  bankCode: string;

  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  branchCode: string;

  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  branchName: string;
}

export class CreateTransactionDto {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  transactionAmount: number;

  @ApiProperty()
  @IsEnum(TransactionType)
  transactionMode: TransactionMode;

  @ApiProperty()
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty()
  @IsEnum(TransactionStatus)
  transactionStatus: TransactionStatus;

  @ApiProperty()
  @IsOptional()
  user: User;

  @ApiProperty()
  @IsOptional()
  toInternalAccount: Account;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ExternalAccountDto)
  toExternalAccount: ExternalAccountDto;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  accountBalance: number;

  @ApiProperty()
  @IsOptional()
  transactionDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  transactionRef: string;
}
