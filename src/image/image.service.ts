import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageService {
  bucketName: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly s3Client: S3Client,
  ) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    console.log(file);
    const key = `${Date.now()}-${Math.random().toString(36).substring(2)}${file.originalname}`;

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
      },
    });

    try {
      const result = await upload.done();
      return result.Key;
    } catch (error) {
      console.error(error);
      throw error;
    }

    // const command = new PutObjectCommand({
    //   Bucket: this.bucketName,
    //   Key: key,
    //   Body: file.buffer,
    //   Metadata: {
    //     originalName: encodeURIComponent(file.originalname),
    //   },
    // });

    // try {
    //   await this.s3Client.send(command);
    //   return key;
    // } catch (error) {
    //   console.log(error);
    //   throw new InternalServerErrorException('Failed to upload file');
    // }
  }
}
