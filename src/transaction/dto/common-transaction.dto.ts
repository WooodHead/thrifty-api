import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsISO8601, Length } from 'class-validator';

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
  @Length(36, 36, {
    message: 'Transaction ID must be at least 36 characters long',
  })
  readonly transactionId: string;
}

export class AccountIdDto {
  @Length(36, 36, { message: 'Account ID must be at least 36 characters long' })
  readonly accountId: string;
}

export class AccountIdAndDateDto {
  @Length(36, 36, {
    message: 'Account ID must be at least 36 characters long',
  })
  readonly accountId: string;

  @IsNotEmpty()
  @IsISO8601()
  readonly searchDate: Date;
}
