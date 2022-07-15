import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsISO8601, IsUUID } from 'class-validator';

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
  @IsUUID(4)
  readonly transactionId: string;
}

export class AccountIdDto {
  @IsUUID(4)
  readonly accountId: string;
}

export class AccountIdAndDateDto {
  @IsUUID(4)
  readonly accountId: string;

  @IsNotEmpty()
  @IsISO8601()
  readonly searchDate: Date;
}
