import { Injectable } from '@nestjs/common';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { Order } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}
  async getOrder(user: any) {
    try {
    } catch (error) {}
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

  async getOrders(user: any): Promise<Order> {
    try {
      const order =
        await this.prisma.order.findFirst({
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

  async getOrdersByAdmin() {
    try {
    } catch (error) {}
  }

  async createOrderDetail(
    orderId: number,
    orderDetail: any,
  ) {
    if(orderDetail.length <= 0) throw new Error('orderDetail must have value')

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
}
