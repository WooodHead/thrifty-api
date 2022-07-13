import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsInt, Min, IsEnum } from 'class-validator';
import { AccountStatus, AccountType } from '../interfaces/account.interface';

export class CreateAccountDto {
    @ApiProperty()
    @IsString()
    @Length(3)
    accountName: string;

    @ApiProperty()
    @IsInt()
    @Min(1, { message: 'Opening Balance must be greater than zero' })
    openingBalance: number;

    @ApiProperty()
    @Length(36, 36, {
        each: true,
        message: 'Each account holder ID must be 36 characters long',
    })
    accountHolders: string[];

    @ApiProperty()
    @IsEnum(AccountType)
    accountType: AccountType;
}
