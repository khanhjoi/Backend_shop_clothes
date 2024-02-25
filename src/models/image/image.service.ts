import { Injectable } from '@nestjs/common';
import { Image } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  async createProductImage(
    productId: number,
    images: any[],
  ): Promise<boolean | undefined> {
    try {
      images.forEach(async (image) => {
        await this.prisma.image.create({
          data: {
            filePath: image.filePath,
            color: image.color,
            caption: image.caption,
            // Any other fields needed for an image
            Product: {
              connect: { id: productId },
            }, // Connect the image to the product
          },
        });
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
