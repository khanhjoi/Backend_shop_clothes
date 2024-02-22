import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async getProducts(): Promise<any> {
    return 'products';
  }

  async getProduct(id: number): Promise<any> {
    return `products/${id}`;
  }

  async findProductByName(
    name: string,
  ): Promise<Product | undefined> {
    const product = await this.prisma.product.findFirst({
      where: {
        name: name,
      }
    })
    return product;
  }
  
  async findProductById(id: number): Promise<Product | undefined> {
    const product = await this.prisma.product.findUnique({
      where: {
        id: id,
      }
    })
    return product;
  }

  async saveProduct(product: Product): Promise<Product | undefined> {
    const newProduct = await this.prisma.product.update({
      where: {
        id: product.id,
      },
      data: product
    })
    return newProduct;
  }
}

