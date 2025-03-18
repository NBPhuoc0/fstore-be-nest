import { Controller, Get, Redirect, Res } from '@nestjs/common';
import AppService from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  index(@Res() res) {
    res.status(302).redirect('/api/docs');
  }
}
