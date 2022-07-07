import { Controller, Get, Res, Delete, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
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
  clearCache() {
    return this.appService.clearCache();
  }

  // @Get()
  // index(@Res() res) {
  //   res.status(302).redirect('/login');
  // }
}
