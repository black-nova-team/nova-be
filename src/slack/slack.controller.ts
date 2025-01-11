import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('slack')
export class SlackController {
  constructor() {}

  @Post('info')
  @UseInterceptors(FileInterceptor('image')) // body에 'image' 필드로 파일을 받음
  async sendInfo(
    @Query('username') username: string,
    @Query('inputText') inputText: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    // 요청받은 데이터를 로그로 출력 (예시)
    console.log('Username:', username);
    console.log('InputText:', inputText);
    console.log('Image:', image.originalname);

    return {
      message: 'Data received successfully',
      username,
      inputText,
      imageName: image.originalname,
    };
  }
}
