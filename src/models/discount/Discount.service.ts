import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UserToken } from 'models/users/dto/UserTokenDto';
import { DiscountDto } from './dto/DiscountDto';
import { Discount } from '@prisma/client';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}

  async getDiscount(
    user: UserToken,
  ): Promise<Discount[]> {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          'Done have permission to do this',
        );
      }

      const discounts =
        await this.prisma.discount.findMany({});

      return discounts;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async createDiscount(
    user: UserToken,
    discount: DiscountDto,
  ): Promise<Discount> {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          'Done have permission to create',
        );
      }

      const discountDB =
        await this.prisma.discount.create({
          data: {
            name: discount.name,
            description: discount.description,
            dateStart: discount.dateStart,
            dateEnd: discount.dateEnd,
            percent: discount.percent,
            bannerImage: discount.bannerImage
          },
        });

      if (!discountDB) {
        throw new Error(
          'discountDB not available',
        );
      }

      return discountDB;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async updateDiscount(
    user: UserToken,
    discount: DiscountDto,
    idDiscount: number,
  ): Promise<Discount> {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          'Done have permission to create',
        );
      }

      let id: number;
      if (typeof idDiscount === 'string') {
        id = parseInt(idDiscount, 10);
      }

      const discountDB =
        await this.prisma.discount.findUnique({
          where: {
            id: id,
          },
        });

      if (!discountDB)
        throw new Error('Discount not found');

      const discountUpdate =
        await this.prisma.discount.update({
          where: {
            id: discountDB.id,
          },
          data: {
            name: discount.name,
            description: discount.description,
            dateStart: discount.dateStart,
            dateEnd: discount.dateEnd,
            percent: discount.percent,
            bannerImage: discount.bannerImage
          },
        });
      return discountUpdate;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async deleteDiscount(
    idDiscount: number,
  ): Promise<Discount> {
    try {
      let id: number;
      if (typeof idDiscount === 'string') {
        id = parseInt(idDiscount, 10);
      }

      const deleteDiscount =
        await this.prisma.discount.delete({
          where: {
            id: id,
          },
        });

      if (!deleteDiscount)
        throw new Error(
          'Delete false something wrong happened',
        );

      return deleteDiscount;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async addProductToDiscount(
    user: UserToken,
    discountId: string,
    productListId: number[],
  ) {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          "You don't have permission to add",
        );
      }

      let id: number;
      if (typeof discountId === 'string') {
        id = parseInt(discountId, 10);
      }
      const discount =
        await this.prisma.discount.findUnique({
          where: {
            id: id,
          },
        });

      if (!discount)
        throw new Error('Discount not found');

      for (const productId of productListId) {
        const product =
          await this.prisma.product.findUnique({
            where: {
              id: productId,
            },
          });

        if (!product)
          throw new Error('Product not found');

        await this.prisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            discountId: discount.id,
          },
        });
      }

      return 'update success';
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }
}
