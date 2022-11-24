import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import {
  BillCategoryTypes,
  Recurrence,
} from "../interfaces/bill-payment.interface";

export class BillCategoryDto {
  @IsEnum(BillCategoryTypes)
  billType: BillCategoryTypes;
}

export class PayBillsDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1000000000)
  @Max(9999999999)
  readonly accountNumber: number;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  customer: string;

  @IsInt()
  @Min(1, { message: "Amount must be greater than 0" })
  @IsNotEmpty()
  amount: number;

  @IsEnum(Recurrence)
  recurrence: Recurrence;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reference: string;
}
