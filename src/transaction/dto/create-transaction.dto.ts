import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsEnum, ValidateNested, IsObject, IsNumber, IsOptional } from 'class-validator';
import { IExternalAccount, TransactionMode, TransactionStatus, TransactionType } from '../interfaces/transaction.interface';
import { User } from '../../user/entities/user.entity';
import { Account } from '../../account/entities/account.entity';

export class ExternalAccountDto implements IExternalAccount {
  accountNumber: number;
  accountName: string;
  accountType: string;
  bankName: string;
  bankCode: string;
  branchCode: string;
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
