import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsInt, Min, IsEnum, IsUUID, ArrayNotEmpty } from 'class-validator';
import { AccountType } from '../interfaces/account.interface';

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
    @IsUUID(4, { each: true })
    @Length(36, 36, { each: true })
    @ArrayNotEmpty()
    accountHolders: string[];

    @ApiProperty()
    @IsEnum(AccountType)
    accountType: AccountType;
}
