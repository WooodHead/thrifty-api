import { IsString, IsNotEmpty, IsInt, Min, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateGroupMemberDto {
    @ApiProperty()
    @IsUUID(4)
    userId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    savingsGroupId: string;
}

export class ContributeFundsDto {
    @ApiProperty()
    @IsInt()
    @Min(1, { message: 'Amount to save must be greater than 0' })
    amountToSave: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    savingsGroupId: string;
}