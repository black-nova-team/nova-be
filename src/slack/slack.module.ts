import { Module } from '@nestjs/common';
import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ImageModule } from 'src/image/image.module';

@Module({
  imports: [PrismaModule, ImageModule, ConfigModule],
  controllers: [SlackController],
  providers: [SlackService],
})
export class SlackModule {}
