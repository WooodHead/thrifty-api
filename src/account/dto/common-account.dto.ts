import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ExternalAccountDto } from "@transaction/dto/create-transaction.dto";

export class AccountNumberDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1000000000)
  @Max(9999999999)
  readonly accountNumber: number;
}

export class AccountIdDto {
  @IsUUID(4)
  readonly accountId: string;
}

export class AccountNameDto {
  @MinLength(1, {
    message: "Account Name must be greater than Zero",
  })
  readonly accountName: string;
}

export class DepositOrWithdrawMoneyDto extends AccountNumberDto {
  @ApiProperty()
  @IsInt()
  @Min(1, { message: "Transaction Amount must be greater than Zero" })
  readonly transactionAmount: number;

  @ApiProperty()
  @IsString()
  @Length(1)
  readonly transactionParty: string;
}

export class TransferFundsToInternalDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1000000000)
  @Max(9999999999)
  readonly fromAccount: number;

  @ApiProperty()
  @IsInt()
  @Min(1, { message: "Transaction Amount must be greater than Zero" })
  readonly amountToTransfer: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1000000000)
  @Max(9999999999)
  readonly toInternalAccount: number;

  @ApiProperty()
  @IsString()
  @MinLength(1, {
    message: "Transfer Account Name length must be greater than Zero",
  })
  readonly toInternalAccountName: string;
}

export class TransferFundsToExternalDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1000000000)
  @Max(9999999999)
  readonly fromAccount: number;

  @ApiProperty()
  @IsInt()
  @Min(1, { message: "Transaction Amount must be greater than Zero" })
  readonly amountToTransfer: number;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => ExternalAccountDto)
  readonly toExternalAccount: ExternalAccountDto;
}
