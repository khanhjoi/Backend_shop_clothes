import {
  BadGatewayException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import {
  Prisma,
  Product,
  Rating,
  User,
} from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import {
  PaginateFunction,
  PaginatedResult,
  paginator,
} from 'common/decorators/Pagination';
import { CommentDto } from './dto/CommentDto';

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
        where: where ? JSON.parse(where) : {},
        orderBy: orderBy
          ? JSON.parse(orderBy)
          : {},
      },
      {
        page,
      },
    );
  }

  async getProduct(id: number): Promise<Product> {
    const product =
      await this.prisma.product.findUnique({
        where: {
          id: id,
        },
        include: {
          images: true,
          rating: true
        }
      });

    if (!product)
      throw new NotFoundException(
        'Product not found',
      );

    return product;
  }

  async commentProduct(
    productId: number,
    user: any,
    comment: CommentDto
  ): Promise<Rating> {
    
    const userDB = await this.prisma.user.findUnique({
      where:{
        id: user.sub,
      }
    })

    if(!userDB) throw new NotFoundException('User not found');

    const product = this.prisma.product.findUnique({
      where: {
        id: productId
      }
    })

    if(!product) throw new NotFoundException('Product not found');

    const rating = this.prisma.rating.create({
      data: {
        productId: productId,
        userId: userDB.id,
        comment: comment.comment,
        rating: comment.rating
      }
    }) 

      
    return rating;
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
