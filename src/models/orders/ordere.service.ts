import { Injectable } from "@nestjs/common";
import { ExceptionsHandler } from "@nestjs/core/exceptions/exceptions-handler";
import { Order } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { NotFoundError } from "rxjs";

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {

  }
  async getOrder (user:any) {
    try {
      
    } catch (error) {
      
    }
  }

  async createOrder (user:any, order:any) {
    try {
      console.log('user', user);
      console.log("order", order);

      const createOrder = await this.prisma.order.create({
        data: {
          userId: user.sub,
          status: "IN_PROGRESS",
          total: order.total
        }
      })

      if(!createOrder) throw new NotFoundError("some error occurred while creating");

      await this.createOrderDetail(createOrder.id, order.orderDetail)

    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  async getOrders() {
    try {
      
    } catch (error) {
      
    }
  }

  async getOrdersByAdmin() {
    try {
      
    } catch (error) {
      
    }
  }

  async createOrderDetail(orderId: number, orderDetail:any) {

    orderDetail.forEach( async(option:any) => {
      const orderDetailOption = await this.prisma.orderDetail.create({
        data: {
          orderId: orderId,
          quantity: option.quantity,
          productOptionsProductId: option.productId,
          productOptionsColorId: option.colorId,
          productOptionsSizeId: option.sizeId,
        }
      })

      if(!orderDetailOption) throw new NotFoundError("something wrong happened")
    });
  }
}