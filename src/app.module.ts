import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SlackModule } from './slack/slack.module';

@Module({
  imports: [SlackModule],
  controllers: [AppController],
})
export class AppModule {}
