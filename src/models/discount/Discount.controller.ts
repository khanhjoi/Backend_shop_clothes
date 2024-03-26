import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { DiscountService } from './Discount.service';
import { JwtGuard } from '@auth/guard';
import { GetUser } from '@auth/decorator';
import { UserToken } from 'models/users/dto/UserTokenDto';
import { DiscountDto } from './dto/DiscountDto';
import { Discount } from '@prisma/client';

@Controller('/discount')
export class DiscountController {
  constructor(
    private discountService: DiscountService,
  ) {}

  @UseGuards(JwtGuard)
  @Get('')
  async getDiscounts(
    @GetUser() user: UserToken,
  ): Promise<Discount[]> {
    return this.discountService.getDiscount(
      user,
    );
  }

  @UseGuards(JwtGuard)
  @Post('')
  async createDiscount(
    @GetUser() user: UserToken,
    @Body() discount: DiscountDto,
  ): Promise<Discount> {
    return this.discountService.createDiscount(
      user,
      discount,
    );
  }

  @UseGuards(JwtGuard)
  @Post(':id/addProduct')
  async addProductToDiscount(
    @GetUser() user: UserToken,
    @Param('id') discountId: string,
    @Body() productListId: number[],
  ): Promise<any> {
    return this.discountService.addProductToDiscount(
      user,
      discountId,
      productListId
    );
  }

  @UseGuards(JwtGuard)
  @Put('/:id')
  async updateDiscount(
    @GetUser() user: UserToken,
    @Body() discount: DiscountDto,
    @Param('id') idDiscount: number
  ): Promise<Discount> {
    return this.discountService.updateDiscount(
      user,
      discount,
      idDiscount
    );
  }

  
  @UseGuards(JwtGuard)
  @Delete('/:id')
  async deleteDiscount(
    @Param('id') idDiscount: number
  ): Promise<Discount> {
    return this.discountService.deleteDiscount(
      idDiscount
    );
  }
}
