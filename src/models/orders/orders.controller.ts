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
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './ordere.service';
import {
  Order,
  OrderDesign,
} from '@prisma/client';
import { UserToken } from 'models/users/dto/UserTokenDto';
import {
  NextFunction,
  Request,
  Response,
} from 'express';
import { ConfigService } from '@nestjs/config';

@Controller()
export class OrderController {
  constructor(
    private orderService: OrderService,
    private configService: ConfigService,
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
  @Get('/user/orders/design')
  async getOrderDesign(
    @GetUser() user: any,
  ): Promise<OrderDesign[]> {
    return this.orderService.getOrdersDesign(
      user,
    );
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
  @Post('/user/order/design')
  async createOrderDesign(
    @GetUser() user: any,
    @Body() order: any,
  ): Promise<any> {
    return this.orderService.createOrderDesign(
      user,
      order,
    );
  }

  @UseGuards(JwtGuard)
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

      const tmnCode =
        this.configService.get<string>('tmnCode');
      const secretKey =
        this.configService.get<string>(
          'secretKey',
        );
      let vnpUrl =
        this.configService.get<string>('vnpUrl');
      const returnUrl =
        this.configService.get<string>(
          'returnUrl',
        );

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

      const signData = qs.stringify(vnp_Params, {
        encode: false,
      });
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

      res.status(200).json({
        directURL: vnpUrl,
        secureHashValue: signed,
        vnp_TxnRef: orderId,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtGuard)
  @Get('/user/order/VnPay')
  vnpayReturn(@Query() vnpParams) {
    let secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    let vnpParamsSorted =
      this.sortObject(vnpParams);

    let tmnCode =
      this.configService.get<string>('tmnCode');

    let secretKey =
      this.configService.get<string>('secretKey');

    let signData = qs.stringify(vnpParamsSorted, {
      encode: false,
    });

    let hmac = crypto.createHmac(
      'sha512',
      secretKey,
    );

    let signed = hmac
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    if (secureHash === signed) {
      // Check if the data in the database is valid and notify the result
      return {
        code: vnpParamsSorted['vnp_ResponseCode'],
      };
    } else {
      return { code: '97' };
    }
  }

  @UseGuards(JwtGuard)
  @Get('/admin/orders')
  async getOrdersAdmin(
    @GetUser() user: any,
  ): Promise<any> {
    return this.orderService.getOrdersAdmin(user);
  }

  @UseGuards(JwtGuard)
  @Get('/admin/orders/design')
  async getOrdersDesignAdmin(
    @GetUser() user: any,
  ): Promise<any> {
    return this.orderService.getOrderDesignAdmin(
      user,
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
      order,
    );
  }

  @UseGuards(JwtGuard)
  @Put('/admin/orders/design')
  async updateOrderDesignAdmin(
    @GetUser() user: any,
    @Body() order: any,
  ): Promise<OrderDesign> {
    return this.orderService.updateOrderDesignAdmin(
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
