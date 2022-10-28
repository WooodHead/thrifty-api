import { ApiProperty, PartialType } from '@nestjs/swagger';
import { MinLength, IsString, IsBoolean } from 'class-validator';


export class CreateFeatureFlagDto {

    @ApiProperty()
    @MinLength(3)
    @IsString()
    readonly name: string;

    @ApiProperty()
    @IsBoolean()
    readonly isEnabled: boolean;

}

export class UpdateFeatureFlagDto extends PartialType(CreateFeatureFlagDto) { }