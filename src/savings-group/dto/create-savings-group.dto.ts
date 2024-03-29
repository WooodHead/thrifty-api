import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { GroupType } from "../interfaces/savings-group.interface";
import { User } from "@user/entities/user.entity";

export class CreateSavingsGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly groupName: string;

  @ApiProperty()
  @IsEnum(GroupType)
  readonly groupType: GroupType;

  @IsOptional()
  @ValidateNested()
  @Type(() => User)
  groupAdmin: User;
}
