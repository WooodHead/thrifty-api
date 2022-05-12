import { IsString, IsNotEmpty } from "class-validator";

export class UpdateGroupMemberDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    savingsGroupId: string;
}