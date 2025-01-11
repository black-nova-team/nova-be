import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from 'src/image/image.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('slack')
export class SlackController {
  constructor(
    private readonly imageService: ImageService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post('info')
  @UseInterceptors(FileInterceptor('image'))
  async sendInfo(
    @Query('username') username: string,
    @Query('inputText') inputText: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    console.log('Username:', username);
    console.log('InputText:', inputText);
    console.log('Image:', image.originalname);

    // 1. 이미지 변환 API 요청
    // 우선 생략

    // 2. 반환된 이미지 S3에 업로드
    const imageS3Key = await this.imageService.uploadImage(image);

    // 3. S3 key와 함께 DB에 저장

    const newRecord = await this.prismaService.slack.create({
      data: {
        username,
        inputText,
        imageKey: imageS3Key,
        manittoId: null, // 필요한 경우 null이 아닌 다른 값을 설정
        correct: false,
        released: false,
        createdAd: new Date(),
      },
    });

    return newRecord;
  }
}
