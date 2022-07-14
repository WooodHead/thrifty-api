import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, IsString, Length, Min, MinLength, ValidateNested } from 'class-validator';
import { ExternalAccountDto } from '../../transaction/dto/create-transaction.dto';

export class CheckAccountBalanceDto {
    @ApiProperty()
    @IsString()
    @Length(10)
    accountNumber: string
};

export class AccountIdDto {
    @Length(36, 36, {
        message: 'Account ID must be 36 characters long',
    })
    readonly accountId: string;
}

export class AccountNumberDto {
    @Length(10, 10, {
        message: 'Account Number must be 10 characters long',
    })
    readonly accountNumber: string;
}

export class AccountNameDto {
    @MinLength(1, {
        message: 'Account Name must be greater than Zero',
    })
    readonly accountName: string;
}

export class DepositOrWithdrawMoneyDto {
    @ApiProperty()
    @IsString()
    @Length(10)
    accountNumber: string;

    @ApiProperty()
    @IsInt()
    @Min(1, { message: 'Transaction Amount must be greater than Zero' })
    transactionAmount: number;

    @ApiProperty()
    @IsString()
    @Length(1)
    transactionParty: string
}

export class TransferFundsToInternalDto {
    @ApiProperty()
    @IsString()
    @Length(10)
    fromAccount: string;

    @ApiProperty()
    @IsInt()
    @Min(1, { message: 'Transaction Amount must be greater than Zero' })
    amountToTransfer: number;

    @ApiProperty()
    @IsString()
    @Length(10)
    toInternalAccount: string;

    @ApiProperty()
    @IsString()
    @MinLength(1, { message: 'Transfer Account Name length must be greater than Zero'})
    toInternalAccountName: string;
}

export class TransferFundsToExternalDto {
    @ApiProperty()
    @IsString()
    @Length(10)
    fromAccount: string;

    @ApiProperty()
    @IsInt()
    @Min(1, { message: 'Transaction Amount must be greater than Zero' })
    amountToTransfer: number;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => ExternalAccountDto)
    toExternalAccount: ExternalAccountDto;
}