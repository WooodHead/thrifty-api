import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Length, Min } from 'class-validator';

export class CheckAccountBalanceDto {
    @ApiProperty()
    @IsString()
    @Length(10)
    accountNumber: string
};

export class DepositOrWithdrawMoneyDto {
    @ApiProperty()
    @IsString()
    @Length(10)
    accountNumber: string;

    @ApiProperty()
    @IsInt()
    @Min(1, { message: 'Transaction Amount must be greater than zero' })
    transactionAmount: number;

    @ApiProperty()
    @IsString()
    @Length(1)
    transactionParty: string
}

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