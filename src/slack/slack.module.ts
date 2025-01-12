import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SlackController } from './slack.controller';
import { ImageModule } from 'src/image/image.module';
import { ConfigModule } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
@Module({
  imports: [PrismaModule, ImageModule, ConfigModule],
  providers: [SlackService, S3Client],
  controllers: [SlackController],
})
export class SlackModule {}
