import { OmitType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserPasswordDto extends PickType(CreateUserDto, ['password'] as const) {}

export class UpdateUserDto extends OmitType(CreateUserDto, ['email', 'password'] as const) {}
