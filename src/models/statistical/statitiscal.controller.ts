import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StatisticalService } from './statistical.service';
import { JwtGuard } from '@auth/guard';
import { GetUser } from '@auth/decorator';
import { UserToken } from 'models/users/dto/UserTokenDto';

@Controller('/statistical')
export class StatisticalController {
  constructor(
    private statisticalService: StatisticalService,
  ) {}

  @UseGuards(JwtGuard)
  @Get('/')
  @HttpCode(HttpStatus.OK)
  getAllStatistical(@GetUser() user: UserToken) {
    return this.statisticalService.getAllStatistical(
      user,
    );
  }

  @UseGuards(JwtGuard)
  @Get('/topSelling')
  @HttpCode(HttpStatus.OK)
  getTopSellingProducts(
    @GetUser() user: UserToken,
  ) {
    return this.statisticalService.getTopSellingProducts(
      user,
    );
  }

  @UseGuards(JwtGuard)
  @Get('/outOfStock')
  @HttpCode(HttpStatus.OK)
  getOutOfStockProducts(
    @GetUser() user: UserToken,
  ) {
    return this.statisticalService.getOutOfStockProducts(
      user,
    );
  }

  @UseGuards(JwtGuard)
  @Get('/orders')
  @HttpCode(HttpStatus.OK)
  getStatisticalOrder(
    @GetUser() user: UserToken,
    @Query() params: any,
  ) {
    return this.statisticalService.getStatisticOrder(
      user,
      params,
    );
  }

  @UseGuards(JwtGuard)
  @Get('/orders/selling')
  @HttpCode(HttpStatus.OK)
  getStatisticalOrderSelling(
    @GetUser() user: UserToken,
  ) {
    return this.statisticalService.getStatisticOrderSelling(
      user,
    );
  }

  @UseGuards(JwtGuard)
  @Get('/orders-design')
  @HttpCode(HttpStatus.OK)
  getStatisticalOrderDesign(
    @GetUser() user: UserToken,
    @Query() params: any,
  ) {
    return this.statisticalService.getStatisticOrderDesign(
      user,
      params,
    );
  }

  @UseGuards(JwtGuard)
  @Get('/orders-design/selling')
  @HttpCode(HttpStatus.OK)
  getStatisticalOrderDesignSelling(
    @GetUser() user: UserToken,
    @Query() params: any,
  ) {
    return this.statisticalService.getStatisticOrderDesignSelling(
      user,
    );
  }
}
