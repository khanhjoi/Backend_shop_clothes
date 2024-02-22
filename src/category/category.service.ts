import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {

  }

  async createCategory() {}

  async getCategoryByCategoryId(
    categoryId: number,
  ): Promise<Category | undefined> {
    const category = await this.prisma.category.findUnique({
      where:{
        id: categoryId,
      }
    });
    return category;
  }
}
