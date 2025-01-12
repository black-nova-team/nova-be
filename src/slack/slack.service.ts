import { Injectable } from '@nestjs/common';
import { startMessage, userInfoModal } from './view/slackview';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImageService } from 'src/image/image.service';
import User from './model/user.model';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';
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
    private readonly configService: ConfigService,
  ) {}
  private registerSlack: RegisterSlack;

  async handleStartCommand({
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
      await say(startMessage);
    } else {
      await say('You are not admin');
    }
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
    const fileUrl = user.file[0].url_private_download;
    const response = await axios.get(fileUrl, {
      responseType: 'stream', // 스트림 형태로 응답 받기
      headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
    });

    const form = new FormData();
    form.append('file', response.data);

    const convertedImage = await axios.post(
      'http://3.92.206.249:31222/convert',
      form,
      {
        headers: {
          ...form.getHeaders(),
          accept: 'image/jpeg',
        },
      },
    );

    const imageKey = await this.imageService.uploadImage(convertedImage.data);
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
    //
    const response = await client.users.list();
    const targetUsers = this.filteringUsers(response.members);

    const shuffledUsers = await this.shuffleUsers(targetUsers);

    for (const member of shuffledUsers) {
      if (!member.is_bot) {
        await this.postDM(client, member.id);
      }
    }
    await say('사용자 목록을 불러왔습니다.');

    await this.prismaService.slack.updateMany({
      where: { released: false },
      data: { released: true },
    });
  }

  async postDM(client: any, userId: string) {
    const user = await this.prismaService.slack.findMany({
      where: { slackId: userId },
    })[0];

    if (!user || !user.manittoId) {
      console.error(
        `User with slackId ${userId} not found or manittoId is missing`,
      );
      return;
    }

    // 2. manittoId에 해당하는 사용자의 이미지 키 조회
    const manitto = await this.prismaService.slack.findUnique({
      where: { id: user.manittoId },
    });

    if (!manitto || !manitto.imageKey) {
      console.error(
        `Manitto with id ${user.manittoId} not found or imageKey is missing`,
      );
      return;
    }

    const imageUrl = `https://${this.configService.get<string>('AWS_S3_BUCKET_NAME')}.s3.${this.configService.get<string>('AWS_S3_REGION')}.amazonaws.com/${manitto.imageKey}`;

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
          image_url: imageUrl,
          alt_text: 'Image description',
        },
      ],
    });
  }

  // 워크스페이스 전체 유저 중에서, 워크플로 등록한 유저만 필터링해서 반환
  async filteringUsers(members) {
    const notReleasedUsers = await this.getNotReleasedUsers();
    const notReleasedSlackIds = notReleasedUsers.map((user) => user.slackId);
    const filteredMembers = members.filter((member) =>
      notReleasedSlackIds.includes(member.id),
    );
    return filteredMembers;
  }

  // DB에서 워크플로 등록 후 released된 적 없는 유저 리스트 반환
  async getNotReleasedUsers() {
    const users = this.prismaService.slack.findMany({
      where: {
        released: false,
      },
    });

    return users;
  }

  async shuffleUsers(targetUsers): Promise<any[]> {
    const shuffledUsers = targetUsers.sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffledUsers.length; i++) {
      const currentUser = shuffledUsers[i];
      const nextUser = shuffledUsers[(i + 1) % shuffledUsers.length]; // 마지막 사용자는 첫 번째 사용자와 연결
      currentUser.manittoId = nextUser.slackId;

      await this.prismaService.slack.updateMany({
        where: { slackId: currentUser.id, released: false },
        data: { manittoId: nextUser.id },
      });
    }

    return shuffledUsers;
  }
}
