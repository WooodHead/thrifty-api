import { IsNotEmpty, IsISO8601, MinLength } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class TransactionDateRangeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsISO8601()
  readonly fromDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsISO8601()
  readonly toDate: Date;
}

export class TransactionDateDto {
  @IsNotEmpty()
  @IsISO8601()
  readonly searchDate: Date;
}

export class TransactionIdDto {
  @MinLength(36, {
    message: 'Transaction ID must be at least 36 characters long',
  })
  readonly transactionId: string;
}

export class AccountIdDto {
  @MinLength(36, { message: 'Account ID must be at least 36 characters long' })
  readonly accountId: string;
}

export class AccountIdAndDateDto {
  @MinLength(36, {
    message: 'Account ID must be at least 36 characters long',
  })
  readonly accountId: string;

  @IsNotEmpty()
  @IsISO8601()
  readonly searchDate: Date;
}
