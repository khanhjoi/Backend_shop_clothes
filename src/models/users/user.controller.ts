import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ShoppingCart, ShoppingCartProduct, User } from '@prisma/client';
import { Request } from 'express';
import { GetUser } from '../../auth/decorator';
import { JwtGuard } from '../../auth/guard';
import { UserService } from './user.service';
import { ProductCartDto } from './dto/ProductCartDto';
import { UserToken } from './dto/UserTokenDto';

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('/profile')
  getProfile(@GetUser() user: User) {
    return this.userService.findOne(user.email);;
  }

  @UseGuards(JwtGuard)
  @Post('/cart')
  @HttpCode(HttpStatus.CREATED)
  updateProductInCart(
    @GetUser() user: UserToken,
    @Body() productCart: ProductCartDto,
  ): Promise<ShoppingCartProduct | HttpException>{
    return this.userService.updateProductInCart(
      user,
      productCart,
    );
  }

  @UseGuards(JwtGuard)
  @Get('/cart')
  @HttpCode(HttpStatus.CREATED)
  getCart(
    @GetUser() user: UserToken,
  ): Promise<ShoppingCart | HttpException>{
    return this.userService.getCart(
      user,
    );
  }
}
