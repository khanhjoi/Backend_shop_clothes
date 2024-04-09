import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'cloudinary/cloudinary.service';

@Controller('/image')
export class ImageController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    
    return this.cloudinaryService.uploadFile(
      file,
    );
  }
}
