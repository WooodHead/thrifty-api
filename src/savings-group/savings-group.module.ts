import { Module } from '@nestjs/common';
import { SavingsGroupService } from './savings-group.service';
import { SavingsGroupController } from './savings-group.controller';

@Module({
  controllers: [SavingsGroupController],
  providers: [SavingsGroupService]
})
export class SavingsGroupModule {}
