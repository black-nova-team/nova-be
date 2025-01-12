import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { App } from '@slack/bolt';
import { SlackController } from './slack/slack.controller';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const slackController = app.get(SlackController);

  const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
  });

  slackController.registerSlackEvents(slackApp);
  await app.listen(process.env.PORT ?? 3000);
  await slackApp.start();
}
bootstrap();
