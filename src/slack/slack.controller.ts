import { Controller } from '@nestjs/common';
import { SlackService } from './slack.service';
import { App } from '@slack/bolt';

@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  registerSlackEvents(app: App) {
    app.command('/start', async (args) => {
      this.slackService.handleStartCommand(args);
    });
    app.action('open_modal_button', async (args) =>
      this.slackService.handleOpenModalButton(args),
    );
    app.view('user_info_modal', async (args) =>
      this.slackService.handleUserInfoModal(args),
    );
    app.command('/stop', async (args) =>
      this.slackService.handleStopCommand(args),
    );
  }
}
