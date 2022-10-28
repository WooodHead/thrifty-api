import { ApiProperty } from "@nestjs/swagger";
import { MinLength, IsString } from "class-validator";


export class CreateFeatureFlagDto {

    @ApiProperty()
    @MinLength(3)
    @IsString()
    name: string;
}