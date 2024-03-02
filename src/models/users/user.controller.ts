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
import { ShoppingCartProduct, User } from '@prisma/client';
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
    return user;
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
}
