import { GetUser } from '@auth/decorator';
import { JwtGuard } from '@auth/guard';
import * as moment from 'moment';
import * as qs from 'qs';
import * as crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './ordere.service';
import { Order } from '@prisma/client';
import { UserToken } from 'models/users/dto/UserTokenDto';
import {
  NextFunction,
  Request,
  Response,
} from 'express';

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
    @Body() orderStatus: any,
    @Param('id') id: string,
  ): Promise<Order> {
    return this.orderService.updateOrder(
      user,
      orderStatus,
      id,
    );
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

  @Post('/user/order/VnPay')
  createPaymentUrl(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      process.env.TZ = 'Asia/Ho_Chi_Minh';

      const date = new Date();
      const createDate = moment(date).format(
        'YYYYMMDDHHmmss',
      );

      const ipAddr =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress;

      const tmnCode = '7TCNLTSB';
      const secretKey =
        'HZHTGBEAKNCVSDYITREETUAMBHBGYHCK';
      let vnpUrl =
        'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
      const returnUrl = 'https://sandbox.vnpayment.vn/merchantv2/';
      const orderId =
        moment(date).format('DDHHmmss');
      const amount = req.body.amount;
      const bankCode = req.body.bankCode;

      let locale = req.body.language;
      if (locale === null || locale === '') {
        locale = 'vn';
      }
      const currCode = 'VND';
      let vnp_Params: any = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = tmnCode;
      vnp_Params['vnp_Locale'] = locale;
      vnp_Params['vnp_CurrCode'] = currCode;
      vnp_Params['vnp_TxnRef'] = orderId;
      vnp_Params['vnp_OrderInfo'] =
        `Ma giao dich ${orderId}`;
      vnp_Params['vnp_OrderType'] = 'other';
      vnp_Params['vnp_Amount'] = amount * 100;
      vnp_Params['vnp_ReturnUrl'] = returnUrl;
      vnp_Params['vnp_IpAddr'] = ipAddr;
      vnp_Params['vnp_CreateDate'] = createDate;
      if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
      }

      vnp_Params = this.sortObject(vnp_Params);

      const signData = qs.stringify(
        vnp_Params,
        { encode: false },
      );
      const hmac = crypto.createHmac(
        'sha512',
        secretKey,
      );
      const signed = hmac
        .update(Buffer.from(signData, 'utf-8'))
        .digest('hex');

      vnp_Params['vnp_SecureHash'] = signed;
      vnpUrl +=
        '?' +
        qs.stringify(vnp_Params, {
          encode: false,
        });

      res.status(200).json(vnpUrl);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @UseGuards(JwtGuard)
  @Get('/admin/orders')
  async getOrdersAdmin(
    @GetUser() user: any,
    @Body() order: any,
  ): Promise<any> {
    return this.orderService.getOrdersAdmin(user);
  }

  @UseGuards(JwtGuard)
  @Put('/admin/orders')
  async updateOrderStatusAdmin(
    @GetUser() user: any,
    @Body() order: any,
  ): Promise<Order> {
    return this.orderService.updateOrderAdmin(
      user,
      order,
    );
  }

  sortObject(obj: any) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(
        obj[str[key]],
      ).replace(/%20/g, '+');
    }
    return sorted;
  }
}
