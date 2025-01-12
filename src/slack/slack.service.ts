import { Injectable } from '@nestjs/common';
import { startMessage, userInfoModal } from './view/slackview';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImageService } from 'src/image/image.service';
import User from './model/user.model';

class RegisterSlack {
  ts: string;
  channelId: string;

  constructor(ts: string, channelId: string) {
    this.ts = ts;
    this.channelId = channelId;
  }
}

@Injectable()
export class SlackService {
  constructor(
    private readonly imageService: ImageService,
    private readonly prismaService: PrismaService,
  ) {}
  private registerSlack: RegisterSlack;

  async handleStartCommand({ ack, say }: { ack: any; say: any }) {
    await ack();
    await say(startMessage);
  }

  async handleOpenModalButton({
    ack,
    body,
    client,
  }: {
    ack: any;
    body: any;
    client: any;
  }) {
    await ack();
    this.registerSlack = new RegisterSlack(
      body.container.message_ts,
      body.container.channel_id,
    );
    try {
      await client.views.open({
        trigger_id: body.trigger_id,
        view: userInfoModal,
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  async handleUserInfoModal({
    view,
    ack,
    body,
    client,
  }: {
    view: any;
    ack: any;
    body: any;
    client: any;
  }) {
    try {
      await ack();
      const name = view.state.values.name_block.name_input.value;
      const hobby = view.state.values.hobby_block.hobby_input.value;
      const mbti = view.state.values.mbti_block.mbti_input.value;
      const file =
        view.state.values.input_block_id.file_input_action_id_1.files;
      const slackId = body.user.id;
      const slackName = body.user.name;

      const user = new User(name, hobby, mbti, file, slackId, slackName);

      await this.uploadImageAndUser(user);

      await client.chat.postMessage({
        channel: this.registerSlack.channelId,
        text: `신청이 완료되었습니다, ${slackName}님!`,
        thread_ts: this.registerSlack.ts,
      });
    } catch (error) {
      console.error('Error posting message:', error);
    }
  }

  async uploadImageAndUser(user: User) {
    const imageKey = await this.imageService.uploadImage(user.file[0]);
    console.log(imageKey);
    await this.prismaService.slack.create({
      data: {
        name: user.name,
        hobby: user.hobby,
        mbti: user.mbti,
        imageKey: imageKey,
        slackId: user.slackId,
        slackName: user.slackName,
      },
    });
  }

  async handleStopCommand({
    ack,
    say,
    body,
    client,
  }: {
    ack: any;
    say: any;
    body: any;
    client: any;
  }) {
    await ack();
    const response = await this.checkingAdmin(body, client);
    if (response) {
      await this.getUserList(client, say);
    } else {
      await say('You are not admin');
    }
  }

  async checkingAdmin(body: any, client: any) {
    const response = await client.users.info({ user: body.user_id });
    if (response.ok && response.user.is_admin) {
      return true;
    }
    return false;
  }

  async getUserList(client: any, say: any) {
    await say('잠시만 기다려 주세요!');
    const response = await client.users.list();
    for (const member of response.members) {
      if (!member.is_bot) {
        await this.postDM(client, member.id);
      }
    }
    await say('사용자 목록을 불러왔습니다.');
  }

  async postDM(client: any, userId: string) {
    const response = await client.conversations.open({
      users: userId,
    });
    const channelId = response.channel.id;
    await client.chat.postMessage({
      channel: channelId,
      text: '당신의 Breaker가 도착했습니다.',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '당신의 Breaker가 도착했습니다.',
          },
        },
        {
          type: 'image',
          image_url:
            'https://blackout-05-images.s3.us-east-1.amazonaws.com/blackout.png',
          alt_text: 'Image description',
        },
      ],
    });
  }
}
