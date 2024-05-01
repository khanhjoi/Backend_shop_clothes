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
  ): Promise<{ month: string; count: number }[]> {
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

      // Check if the date range parameters are provided
      if (
        params &&
        params.dateStart &&
        params.dateEnd
      ) {
        whereClause = {
          createdAt: {
            gte: params.dateStart,
            lte: params.dateEnd,
          },
        }; // Set the where clause to filter by date range
      }

      const orders: Order[] =
        await this.prisma.order.findMany({
          where: whereClause,
          include: {
            OrderDetail: {
              select: {
                dateAdd: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc', // Order by createdAt in ascending order
          },
        });

      // Create an object to store the count of orders for each month
      const orderCountsByMonth: {
        [month: string]: number;
      } = {};

      // Count the number of orders for each month
      for (const order of orders) {
        if (order.status === 'IS_SUCCESS') {
          const monthYear = order.createdAt
            .toISOString()
            .slice(0, 7); // Extracting only year and month
          if (orderCountsByMonth[monthYear]) {
            orderCountsByMonth[monthYear]++;
          } else {
            orderCountsByMonth[monthYear] = 1;
          }
        }
      }

      // Convert orderCountsByMonth to the desired format
      const result = Object.entries(
        orderCountsByMonth,
      ).map(([month, count]) => ({
        month,
        count,
      }));

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }
  async getStatisticOrderSelling(
    user: UserToken,
    params: any,
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

      // Check if the date range parameters are provided
      if (
        params &&
        params.dateStart &&
        params.dateEnd
      ) {
        whereClause = {
          createdAt: {
            gte: params.dateStart,
            lte: params.dateEnd,
          },
        }; // Set the where clause to filter by date range
      }

      const orders: Order[] =
        await this.prisma.order.findMany({
          where: whereClause,
          include: {
            OrderDetail: {
              select: {
                dateAdd: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc', // Order by createdAt in ascending order
          },
        });

      // Create an object to store the count of orders for each month
      const orderCountsByMonth: {
        [month: string]: number;
      } = {};
      let total = 0;
      // Count the number of orders for each month
      for (const order of orders) {
        if (order.status === 'IS_SUCCESS') {
          const monthYear = order.createdAt
            .toISOString()
            .slice(0, 7); // Extracting only year and month
          if (orderCountsByMonth[monthYear]) {
            orderCountsByMonth[monthYear] +=
              Number(order.total);
          } else {
            orderCountsByMonth[monthYear] =
              Number(order.total);
          }
          total += Number(order.total);
        }
      }

      // Convert orderCountsByMonth to the desired format
      const result = Object.entries(
        orderCountsByMonth,
      ).map(([month, count]) => ({
        month,
        count,
      }));

      return [result, total];
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
      if (
        params &&
        params.dateStart &&
        params.dateEnd
      ) {
        whereClause = {
          createdAt: {
            gte: params.dateStart,
            lte: params.dateEnd,
          },
        }; // Set the where clause to filter by date range
      }

      const orders: OrderDesign[] =
        await this.prisma.orderDesign.findMany({
          where: whereClause, // Pass the where clause
          orderBy: {
            createdAt: 'asc', // Order by createdAt in ascending order
          },
        });

      const orderCountsByMonth: {
        [month: string]: number;
      } = {};
      // Count the number of orders for each month
      for (const order of orders) {
        if (order.status === 'IS_SUCCESS') {
          const monthYear = order.createdAt
            .toISOString()
            .slice(0, 7); // Extracting only year and month
          if (orderCountsByMonth[monthYear]) {
            orderCountsByMonth[monthYear]++;
          } else {
            orderCountsByMonth[monthYear] = 1;
          }
        }
      }
      // Convert orderCountsByMonth to the desired format
      const result = Object.entries(
        orderCountsByMonth,
      ).map(([month, count]) => ({
        month,
        count,
      }));

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getStatisticOrderDesignSelling(
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
      if (
        params &&
        params.dateStart &&
        params.dateEnd
      ) {
        whereClause = {
          createdAt: {
            gte: params.dateStart,
            lte: params.dateEnd,
          },
        }; // Set the where clause to filter by date range
      }

      const orders: OrderDesign[] =
        await this.prisma.orderDesign.findMany({
          where: whereClause, // Pass the where clause
          orderBy: {
            createdAt: 'asc', // Order by createdAt in ascending order
          },
        });

      const orderCountsByMonth: {
        [month: string]: number;
      } = {};
      let total = 0;
      // Count the number of orders for each month
      for (const order of orders) {
        if (order.status === 'IS_SUCCESS') {
          const monthYear = order.createdAt
            .toISOString()
            .slice(0, 7); // Extracting only year and month
          if (orderCountsByMonth[monthYear]) {
            orderCountsByMonth[monthYear] +=
              Number(order.total);
          } else {
            orderCountsByMonth[monthYear] =
              Number(order.total);
          }
          total += Number(order.total);
        }
      }
      // Convert orderCountsByMonth to the desired format
      const result = Object.entries(
        orderCountsByMonth,
      ).map(([month, count]) => ({
        month,
        count,
      }));

      return [result, total];
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
