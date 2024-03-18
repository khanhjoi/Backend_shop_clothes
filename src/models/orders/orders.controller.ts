import { GetUser } from '@auth/decorator';
import { JwtGuard } from '@auth/guard';
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './ordere.service';

@Controller()
export class OrderController {
  constructor(private orderService: OrderService) {}

  @UseGuards(JwtGuard)
  @Get('/user/order')
  async getOrders(
    @GetUser() user: any,
  ): Promise<any> {
    return this.orderService.getOrder(user);
  }

  @UseGuards(JwtGuard)
  @Get('/user/orders')
  async getAllOrder(
    @GetUser() user: any,
    @Body() order: any
  ): Promise<any> {
    return this.orderService.createOrder(user, order);
  }

  @UseGuards(JwtGuard)
  @Post('/user/order')
  async createOrder(
    @GetUser() user: any,
    @Body() order: any
  ): Promise<any> {
    return this.orderService.createOrder(user, order);

  }
}