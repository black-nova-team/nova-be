import { Controller } from '@nestjs/common';
import { SlackService } from './slack.service';
import { App } from '@slack/bolt';

@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  registerSlackEvents(app: App) {
    app.command('/start', this.slackService.handleStartCommand.bind(this));
    app.action(
      'open_modal_button',
      this.slackService.handleOpenModalButton.bind(this),
    );
    app.view('user_info_modal', async (args) =>
      this.slackService.handleUserInfoModal(args),
    );
    app.command('/stop', async (args) =>
      this.slackService.handleStopCommand(args),
    );
  }
}
