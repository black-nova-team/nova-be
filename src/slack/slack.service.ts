import { Injectable } from '@nestjs/common';
import { startMessage, userInfoModal } from './view/slackview';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImageService } from 'src/image/image.service';
import User from './model/user.model';
import axios from 'axios';

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
    console.log(user.file);
    const fileUrl = user.file[0].url_private_download;
    const response = await axios.get(fileUrl, {
      responseType: 'stream', // 스트림 형태로 응답 받기
      headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
    });

    const imageKey = await this.imageService.uploadImage(response.data);

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
}
