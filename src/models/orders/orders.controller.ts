import { GetUser } from '@auth/decorator';
import { JwtGuard } from '@auth/guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './ordere.service';
import { Order } from '@prisma/client';

@Controller()
export class OrderController {
  constructor(
    private orderService: OrderService,
  ) {}

  @UseGuards(JwtGuard)
  @Get('/user/order')
  async getOrders(
    @GetUser() user: any,
  ): Promise<any> {
    return this.orderService.getOrder(user);
  }

  @UseGuards(JwtGuard)
  @Put('/user/orders/:id')
  async updateOrderUser(
    @GetUser() user: any,
    @Body() orderStatus:any,
    @Param('id') id: string
  ): Promise<Order> {
    return this.orderService.updateOrder(user, orderStatus, id);
  }

  @UseGuards(JwtGuard)
  @Get('/user/orders')
  async getAllOrder(
    @GetUser() user: any,
  ): Promise<Order[]> {
    return this.orderService.getOrders(user);
  }

  

  @UseGuards(JwtGuard)
  @Post('/user/order')
  async createOrder(
    @GetUser() user: any,
    @Body() order: any,
  ): Promise<any> {
    return this.orderService.createOrder(
      user,
      order,
    );
  }

  @UseGuards(JwtGuard)
  @Get('/admin/orders')
  async getOrdersAdmin(
    @GetUser() user: any,
    @Body() order: any,
  ): Promise<any> {
    return this.orderService.getOrdersAdmin(
      user
    );
  } 

  @UseGuards(JwtGuard)
  @Put('/admin/orders')
  async updateOrderStatusAdmin(
    @GetUser() user: any,
    @Body() order: any,
  ): Promise<Order> {
    return this.orderService.updateOrderAdmin(
      user,
      order
    );
  }
}
