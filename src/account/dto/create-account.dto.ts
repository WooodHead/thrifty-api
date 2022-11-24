import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsEnum,
  IsUUID,
  ArrayNotEmpty,
  MinLength,
} from "class-validator";
import { AccountType } from "../interfaces/account.interface";

export class CreateAccountDto {
  @ApiProperty()
  @MinLength(3)
  @IsString()
  readonly accountName: string;

  @ApiProperty()
  @IsUUID(4, { each: true })
  @ArrayNotEmpty()
  readonly accountHolders: string[];

  @ApiProperty()
  @IsEnum(AccountType)
  readonly accountType: AccountType;
}
