import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class ImageService {
  bucketName: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly s3Client: S3Client,
  ) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_S3_REGION'),
    });
  }

  async uploadImage(stream: Readable): Promise<string> {
    const key = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

    console.log(stream);

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucketName,
        Key: key,
        Body: stream,
      },
    });

    try {
      const result = await upload.done();
      return result.Key;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // async uploadImage(file: Express.Multer.File): Promise<string> {
  //   if (!file || !file.buffer) {
  //     throw new Error('Invalid file: File is undefined or empty');
  //   }

  //   console.log(file);
  //   const key = `${Date.now()}-${Math.random().toString(36).substring(2)}${file.originalname}`;
  //   const stream = Readable.from(file.buffer);

  //   console.log(stream);

  //   const upload = new Upload({
  //     client: this.s3Client,
  //     params: {
  //       Bucket: this.bucketName,
  //       Key: key,
  //       Body: stream,
  //     },
  //   });

  //   try {
  //     const result = await upload.done();
  //     return result.Key;
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }
}
