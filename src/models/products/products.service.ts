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
  perPage: 6,
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
    let filter = JSON.parse(where);

    let whereFilter: any = {
      price: filter.price,
    };

    if (
      filter.categoryId &&
      filter.categoryId !== 'all'
    ) {
      whereFilter.categoryId = parseInt(
        filter.categoryId,
      );
    }

    return paginate(
      this.prisma.product,
      {
        where: whereFilter,
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
          rating: {
            include: {
              User: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                }, // Specify desired user fields
              },
            },
          },
        },
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
    comment: CommentDto,
  ): Promise<Rating> {
    const userDB =
      await this.prisma.user.findUnique({
        where: {
          id: user.sub,
        },
      });

    if (!userDB)
      throw new NotFoundException(
        'User not found',
      );

    const product =
      this.prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!product)
      throw new NotFoundException(
        'Product not found',
      );

    const rating = this.prisma.rating.create({
      data: {
        productId: productId,
        userId: userDB.id,
        comment: comment.comment,
        rating: comment.rating,
      },
    });

    return rating;
  }

  async updateComment(
    id: number,
    user: any,
    comment: CommentDto,
  ): Promise<Rating> {
    console.log(comment);

    const rating =
      await this.prisma.rating.findUnique({
        where: {
          id: comment.id,
        },
      });

    if (!rating) {
      throw new NotFoundException(
        'The rating is not available',
      );
    }

    const updatedRating =
      await this.prisma.rating.update({
        where: { id: comment.id }, // Assuming 'id' is the primary key of the rating
        data: {
          // Assuming 'user' and 'comment' are fields of the Rating model
          comment: comment.comment,
          rating: comment.rating,
          // You can add more fields to update here
        },
      });

    return updatedRating;
  }

  async deleteComment(
    id: number,
    user: any,
    commentId: number,
  ): Promise<String> {
    const commentInProduct =
      await this.prisma.rating.findFirst({
        where: {
          id: commentId,
          productId: id,
          userId: user.sub,
        },
      });

    if (!commentInProduct)
      throw new NotFoundException(
        `Comment is not in product`,
      );

    const rating =
      await this.prisma.rating.findUnique({
        where: {
          id: commentId,
        },
      });

    if (!rating)
      throw new NotFoundException(
        `No rating found to delete`,
      );

    await this.prisma.rating.delete({
      where: {
        id: commentId,
      },
    });

    return 'Delete Successfully';
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
