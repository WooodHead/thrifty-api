import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';


export class EntityIdDto {

    @ApiProperty()
    @IsUUID(4)
    readonly id: string;
}