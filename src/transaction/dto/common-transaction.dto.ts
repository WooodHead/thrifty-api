import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsISO8601, IsUUID } from "class-validator";

export class TransactionDateDto {
  @ApiProperty()
  @IsISO8601()
  @IsNotEmpty()
  readonly searchDate: Date;
}

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

export class TransactionAccountDateDto extends TransactionDateDto {
  @ApiProperty()
  @IsUUID(4)
  readonly accountID: string;
}

export class TransactionAccountDateRangeDto extends TransactionDateRangeDto {
  @ApiProperty()
  @IsUUID(4)
  readonly accountID: string;
}

export class TransactionIdDto {
  @ApiProperty()
  @IsUUID(4)
  readonly transactionId: string;
}

export class AccountIdDto {
  @ApiProperty()
  @IsUUID(4)
  readonly accountId: string;
}
