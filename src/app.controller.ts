import { Controller, Get, Delete, HttpCode } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiExcludeController()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Delete('clear-cache')
  @HttpCode(204)
  async clearCache() {
    return await this.appService.clearCache();
  }
}
