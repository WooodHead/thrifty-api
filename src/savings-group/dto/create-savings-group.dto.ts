import { IsString, IsNotEmpty, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GroupType } from '../interfaces/savings-group.interface';
import { User } from '../../user/entities/user.entity';

export class CreateSavingsGroupDto {
    @IsString()
    @IsNotEmpty()
    groupName: string;

    @IsEnum(GroupType)
    groupType: GroupType;

    @IsOptional()
    @ValidateNested()
    @Type(() => User)
    groupAdmin: User;
}
