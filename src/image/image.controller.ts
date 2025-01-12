import { Controller } from '@nestjs/common';

import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
  constructor(private imageService: ImageService) {}

  // @Post()
  // @UseInterceptors(FilesInterceptor('image'))
  // async uploadImage(
  //   @UploadedFile() file: Express.Multer.File,
  // ): Promise<string> {
  //   return this.imageService.uploadImage(file);
  // }
}
