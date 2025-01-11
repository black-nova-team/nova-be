import { Controller, Post } from '@nestjs/common';

@Controller('slack')
export class SlackController {
  constructor() {}


  @Post('info')
  async sendInfo()
}
