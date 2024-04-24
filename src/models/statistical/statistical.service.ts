import {
  Injectable,
  InternalServerErrorException,
  Module,
} from '@nestjs/common';
import {
  Order,
  OrderDesign,
} from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { UserToken } from 'models/users/dto/UserTokenDto';
import { InternalServerError } from 'openai';

@Injectable()
export class StatisticalService {
  constructor(private prisma: PrismaService) {}

  async getAllStatistical(user: UserToken) {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          'Người dùng không có quyền ',
        );
      }

      const orders =
        await this.prisma.order.findMany();
      const orderDesign =
        await this.prisma.orderDesign.findMany();

      return [orders.length, orderDesign.length];
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getStatisticOrder(
    user: UserToken,
    params?: any,
  ): Promise<any> {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          'Người dùng không có quyền',
        );
      }

      let whereClause = {}; // Define an empty where clause

      // Check if the status parameter is provided
      if (params && params.status) {
        whereClause = { status: params.status }; // Set the where clause to filter by status
      }

      const orders: Order[] =
        await this.prisma.order.findMany({
          where: whereClause, // Pass the where clause
          include: {
            OrderDetail: {
              select: {
                dateAdd: true,
              },
            },
          },
        });

      // Initialize an array to hold counts for each month
      const monthlyCounts: number[] = new Array(
        12,
      ).fill(0);

      const monthlyCountsCancel: number[] =
        new Array(12).fill(0);

      let sum: number = 0;

      // Count orders for each month
      orders.forEach((order: any) => {
        const month = new Date(
          order?.createdAt,
        ).getMonth();

        if (order?.status !== 'IS_CANCELLED') {
          sum += Number(order?.total);
        }
        if (order?.status === 'IS_CANCELLED') {
          monthlyCountsCancel[month]++;
        }

        if (order?.status !== 'IS_CANCELLED') {
          monthlyCounts[month]++;
        }
      });

      return {
        dataModel: monthlyCounts,
        dataModelCancel: monthlyCountsCancel,
        total: sum,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getStatisticOrderSelling(
    user: UserToken,
  ): Promise<any> {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          'Người dùng không có quyền',
        );
      }

      const orders: Order[] =
        await this.prisma.order.findMany({
          include: {
            OrderDetail: {
              select: {
                dateAdd: true,
              },
            },
          },
        });

      // Initialize an array to hold counts for each month
      const monthlyCounts: number[] = new Array(
        12,
      ).fill(0);

      const monthlyCountsCancel: number[] =
        new Array(12).fill(0);

      let sum: number = 0;

      // Count orders for each month
      orders.forEach((order: any) => {
        const month = new Date(
          order?.createdAt,
        ).getMonth();

        if (order?.status !== 'IS_CANCELLED') {
          sum += Number(order?.total);
        }
        if (order?.status !== 'IS_CANCELLED') {
          monthlyCounts[month] += Number(
            order?.total,
          );
        }
      });

      return {
        dataModel: monthlyCounts,
        total: sum,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getStatisticOrderDesign(
    user: UserToken,
    params?: any,
  ): Promise<any> {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          'Người dùng không có quyền',
        );
      }

      let whereClause = {}; // Define an empty where clause

      // Check if the status parameter is provided
      if (params && params.status) {
        whereClause = { status: params.status }; // Set the where clause to filter by status
      }

      const orders: OrderDesign[] =
        await this.prisma.orderDesign.findMany({
          where: whereClause, // Pass the where clause
        });

      // Initialize an array to hold counts for each month
      const monthlyCounts: number[] = new Array(
        12,
      ).fill(0);
      const monthlyCountsCancel: number[] =
        new Array(12).fill(0);

      let sum: number = 0;

      // Count orders for each month
      orders.forEach((order: any) => {
        const month = new Date(
          order?.createdAt,
        ).getMonth();

        if (order?.status !== 'IS_CANCELLED') {
          sum += Number(order?.total);
        }
        if (order?.status === 'IS_CANCELLED') {
          monthlyCountsCancel[month]++;
        }

        if (order?.status !== 'IS_CANCELLED') {
          monthlyCounts[month]++;
        }
      });

      return {
        dataModel: monthlyCounts,
        dataModelCancel: monthlyCountsCancel,
        total: sum,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getStatisticOrderDesignSelling(
    user: UserToken,
  ): Promise<any> {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          'Người dùng không có quyền',
        );
      }

      const orders: OrderDesign[] =
        await this.prisma.orderDesign.findMany(
          {},
        );

      // Initialize an array to hold counts for each month
      const monthlyCounts: number[] = new Array(
        12,
      ).fill(0);
      const monthlyCountsCancel: number[] =
        new Array(12).fill(0);

      let sum: number = 0;

      // Count orders for each month
      orders.forEach((order: any) => {
        const month = new Date(
          order?.createdAt,
        ).getMonth();

        if (order?.status !== 'IS_CANCELLED') {
          sum += Number(order?.total);
        }
     
        if (order?.status !== 'IS_CANCELLED') {
          monthlyCounts[month] += Number(order?.total);
        }
      });

      return {
        dataModel: monthlyCounts,
        total: sum,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getTopSellingProducts(
    user: UserToken,
    params?: any,
  ) {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          'Người dùng không có quyền',
        );
      }

      const topSelling =
        await this.prisma.orderDetail.groupBy({
          by: [
            'productOptionsColorId',
            'productOptionsProductId',
            'productOptionsSizeId',
          ],
          _sum: {
            quantity: true,
          },
          orderBy: {
            _sum: {
              quantity: 'desc',
            },
          },
          take: 5, // Limit the result to the top 10
        });

      let quantityTopSelling: any = [];
      let productsTopSelling: any = [];
      for (const item of topSelling) {
        const color =
          await this.prisma.color.findUnique({
            where: {
              id: item.productOptionsColorId,
            },
          });

        const size =
          await this.prisma.size.findUnique({
            where: {
              id: item.productOptionsSizeId,
            },
          });

        const product =
          await this.prisma.product.findUnique({
            where: {
              id: item.productOptionsProductId,
            },
          });

        quantityTopSelling.push(
          item._sum.quantity,
        );
        productsTopSelling.push(
          `${product.name}, ${color.color}, ${size.name}`,
        );
      }

      return {
        items: productsTopSelling,
        quantity: quantityTopSelling,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getOutOfStockProducts(
    user: UserToken,
    params?: any,
  ) {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          'Người dùng không có quyền',
        );
      }

      const outOfStockProducts =
        await this.prisma.productOptions.findMany(
          {
            where: {
              quantity: {
                lte: 10, // Quantity less than or equal to 10
              },
            },
            include: {
              Product: true,
              Color: true,
              Size: true,
            },
            take: 5,
          },
        );

      let itemsOutOfStock = [];
      let quantityOutOfStock = [];
      for (const item of outOfStockProducts) {
        itemsOutOfStock.push(
          `${item?.Product?.name}, ${item.Color.color}, ${item.Size.name}`,
        );
        quantityOutOfStock.push(item.quantity);
      }

      return {
        items: itemsOutOfStock,
        quantity: quantityOutOfStock,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }
}
