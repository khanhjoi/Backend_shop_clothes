import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import {
  Order,
  Prisma,
  Status,
} from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { UserToken } from 'models/users/dto/UserTokenDto';
import { NotFoundError } from 'rxjs';
import { UpdateStatusReq } from './types/updateStatus';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async getOrders(user: any): Promise<Order[]> {
    try {
      const order =
        await this.prisma.order.findMany({
          where: {
            userId: user.sub,
          },
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            OrderDetail: {
              select: {
                productOption: {
                  include: {
                    Color: true,
                    Size: true,
                    Product: true,
                  },
                },
                quantity: true,
              },
            },
          },
        });
      if (!order)
        throw new NotFoundError(
          `Order not found`,
        );

      return order;
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  async getOrder(user: any) {
    try {
    } catch (error) {}
  }

  async updateOrder(
    user: UserToken,
    orderStatus: any,
    orderId: string,
  ): Promise<Order> {
    try {
      let id: number;
      if (typeof orderStatus === 'string') {
        id = parseInt(orderId, 10);
      }

      const order =
        await this.prisma.order.findFirst({
          where: {
            id: id,
          },
        });

      if (order.userId !== user.sub)
        throw new Error(
          'Người dùng không phải chủ đơn hàng',
        );

      console.log(orderStatus);

      const updateOrder =
        await this.prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: orderStatus.orderStatus,
          },
          include: {
            OrderDetail: true,
          },
        });

      if (updateOrder.status === 'IS_CANCELLED') {
        for (const product of updateOrder.OrderDetail) {
          const option =
            await this.prisma.productOptions.findFirst(
              {
                where: {
                  sizeId:
                    product.productOptionsSizeId,
                  colorId:
                    product.productOptionsColorId,
                  productId:
                    product.productOptionsProductId,
                },
              },
            );

          const quantity =
            option.quantity + product.quantity;

          await this.prisma.productOptions.update(
            {
              where: {
                productId_sizeId_colorId: {
                  sizeId: option.sizeId,
                  colorId: option.colorId,
                  productId: option.productId,
                },
              },
              data: {
                quantity: quantity,
              },
            },
          );
        }
      }

      return updateOrder;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async createOrder(user: any, order: any) {
    try {
      const createOrder =
        await this.prisma.order.create({
          data: {
            userId: user.sub,
            address: order.address,
            status: 'IN_PROGRESS',
            total: order.total,
          },
        });

      if (!createOrder)
        throw new NotFoundError(
          'some error occurred while creating',
        );

      await this.createOrderDetail(
        createOrder.id,
        order.orderDetail,
      );

      await this.removeCartDetail(user.sub);
      return createOrder;
    } catch (error) {
      console.log(error);
      throw new ExceptionsHandler(error);
    }
  }

  async getOrdersByAdmin() {
    try {
    } catch (error) {}
  }

  async createOrderDetail(
    orderId: number,
    orderDetail: any,
  ) {
    if (orderDetail.length <= 0)
      throw new Error(
        'orderDetail must have value',
      );

    for (const option of orderDetail) {
      const orderDetailOption =
        await this.prisma.orderDetail.create({
          data: {
            orderId: orderId,
            quantity: option.quantity,
            productOptionsProductId:
              option.productOption.Product.id,
            productOptionsColorId:
              option.productOption.Color.id,
            productOptionsSizeId:
              option.productOption.Size.id,
          },
        });

      const productOption =
        await this.prisma.productOptions.findFirst(
          {
            where: {
              productId:
                option.productOption.Product.id,
              colorId:
                option.productOption.Color.id,
              sizeId:
                option.productOption.Size.id,
            },
          },
        );

      if (!productOption)
        throw new NotFoundError(
          'can find product option',
        );

      await this.prisma.productOptions.update({
        where: {
          productId_sizeId_colorId: {
            productId:
              option.productOption.Product.id,
            colorId:
              option.productOption.Color.id,
            sizeId: option.productOption.Size.id,
          },
        },
        data: {
          quantity:
            productOption.quantity -
            option.quantity,
        },
      });

      if (!orderDetailOption)
        throw new NotFoundError(
          'something wrong happened',
        );
    }
  }

  async removeCartDetail(userId: number) {
    try {
      const shoppingCart =
        await this.prisma.shoppingCart.findFirst({
          where: {
            userId: userId,
          },
        });

      if (!shoppingCart)
        throw new NotFoundError(
          `No shopping cart`,
        );

      const shoppingCartDetail =
        await this.prisma.shoppingCartProduct.deleteMany(
          {
            where: {
              shoppingCartId: shoppingCart.id,
            },
          },
        );

      if (!shoppingCartDetail)
        throw new NotFoundError(
          `No shopping cart`,
        );

      return shoppingCartDetail;
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  // admin

  async getOrdersAdmin(
    user: UserToken,
  ): Promise<Order[]> {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new ForbiddenException(); // Throwing ForbiddenException for non-admin users
      }

      const orders =
        await this.prisma.order.findMany({
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            OrderDetail: {
              select: {
                productOption: {
                  include: {
                    Color: true,
                    Size: true,
                    Product: true,
                  },
                },
                quantity: true,
              },
            },
          },
        });
      if (!orders)
        throw new Error(
          'orders must be specified',
        );
      return orders;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getReceipt(user: UserToken) {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new ForbiddenException(); // Throwing ForbiddenException for non-admin users
      }
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async updateOrderAdmin(
    user: UserToken,
    updateStatus: UpdateStatusReq,
  ): Promise<Order> {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          'Người dùng không có quyền truy cập',
        );
      }

      const order =
        await this.prisma.order.findUnique({
          where: {
            id: updateStatus.order.orderId,
          },
        });

      if (!order)
        throw new Error(
          'Đơn hàng không tồn tại!',
        );

      if (
        order.status === 'IS_SUCCESS' ||
        order.status === 'IS_CANCELLED' ||
        order.status === 'DELIVERED' ||
        order.status === 'RETURNED' ||
        order.status === 'REFUNDED'
      ) {
        throw new Error(
          'Đơn hàng đã kết thúc không thể thay đổi trạng thái!',
        );
      }
      const update =
        await this.prisma.order.update({
          where: {
            id: updateStatus.order.orderId,
          },
          data: {
            status: updateStatus.order.status,
          },
          include: {
            OrderDetail: true,
          },
        });

      if (update.status === 'IS_CANCELLED') {
        for (const product of update.OrderDetail) {
          const option =
            await this.prisma.productOptions.findFirst(
              {
                where: {
                  sizeId:
                    product.productOptionsSizeId,
                  colorId:
                    product.productOptionsColorId,
                  productId:
                    product.productOptionsProductId,
                },
              },
            );

          const quantity =
            option.quantity + product.quantity;

          await this.prisma.productOptions.update(
            {
              where: {
                productId_sizeId_colorId: {
                  sizeId: option.sizeId,
                  colorId: option.colorId,
                  productId: option.productId,
                },
              },
              data: {
                quantity: quantity,
              },
            },
          );
        }
      }

      return update;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }
}
