import { Type } from 'class-transformer';
import { IsString, IsEnum, ValidateNested, IsObject, IsNumber, IsOptional } from 'class-validator';
import { IExternalAccount, TransactionStatus, TransactionType } from '../interfaces/transaction.interface';
import { User } from '../../user/entities/user.entity';

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
  @IsString()
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  transactionAmount: number;

  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsEnum(TransactionStatus)
  transactionStatus: TransactionStatus;

  @IsOptional()
  user: User;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ExternalAccountDto)
  toExternalAccount: ExternalAccountDto;

  @IsNumber({ maxDecimalPlaces: 2 })
  accountBalance: number;

  @IsOptional()
  @IsString()
  transactionRef: string;
}
