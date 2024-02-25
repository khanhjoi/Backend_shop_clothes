import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import {
  PaginateFunction,
  PaginatedResult,
  paginator,
} from 'common/decorators/Pagination';

const paginate: PaginateFunction = paginator({
  perPage: 10,
});

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async getProducts({
    where,
    orderBy,
    page,
  }: {
    where?: string;
    orderBy?: string;
    page?: number;
  }): Promise<PaginatedResult<Product>> {


    return paginate(
      this.prisma.product,
      {
        where: where ? JSON.parse(where): {} ,
        orderBy: orderBy ? JSON.parse(orderBy): {} ,
      },
      {
        page,
      },
    );
  }

  async getProduct(id: number): Promise<any> {
    return `products/${id}`;
  }

  async findProductByName(
    name: string,
  ): Promise<Product | undefined> {
    const product =
      await this.prisma.product.findFirst({
        where: {
          name: name,
        },
      });
    return product;
  }

  async findProductById(
    id: number,
  ): Promise<Product | undefined> {
    const product =
      await this.prisma.product.findUnique({
        where: {
          id: id,
        },
      });
    return product;
  }

  async saveProduct(
    product: Product,
  ): Promise<Product | undefined> {
    const newProduct =
      await this.prisma.product.update({
        where: {
          id: product.id,
        },
        data: product,
      });
    return newProduct;
  }
}
