import { PartialType } from '@nestjs/swagger';
import { CreateSavingsGroupDto } from './create-savings-group.dto';

export class UpdateSavingsGroupDto extends PartialType(CreateSavingsGroupDto) {}
