import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  Address,
  ShoppingCart,
  ShoppingCartProduct,
  User,
} from '@prisma/client';
import { Request } from 'express';
import { GetUser } from '../../auth/decorator';
import { JwtGuard } from '../../auth/guard';
import { UserService } from './user.service';
import { ProductCartDto } from './dto/ProductCartDto';
import { UserToken } from './dto/UserTokenDto';
import { AddressDto } from './dto/AddressDto';

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('/profile')
  async getProfile(@GetUser() user: UserToken) {
    try {
      const profile =
        await this.userService.getUserById(
          user.sub,
        );
      if (!profile) throw new Error('user not exit');
      return profile;
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
    return;
  }

  @UseGuards(JwtGuard)
  @Put('/profile')
  updateUser(
    @GetUser() user: UserToken,
    @Body() data: any,
  ) {
    return this.userService.updateUser(
      user,
      data,
    );
  }

  @UseGuards(JwtGuard)
  @Post('/cart')
  @HttpCode(HttpStatus.CREATED)
  updateProductInCart(
    @GetUser() user: UserToken,
    @Body() productCart: ProductCartDto,
  ): Promise<
    ShoppingCartProduct | HttpException
  > {
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
  ): Promise<
    ShoppingCartProduct[] | HttpException
  > {
    return this.userService.getCart(user);
  }

  @UseGuards(JwtGuard)
  @Get('/addresses')
  @HttpCode(HttpStatus.CREATED)
  getAddress(
    @GetUser() user: UserToken,
  ): Promise<Address[] | HttpException> {
    return this.userService.getAddress(user);
  }

  @UseGuards(JwtGuard)
  @Post('/address')
  @HttpCode(HttpStatus.CREATED)
  addNewAddress(
    @GetUser() user: UserToken,
    @Body() address: AddressDto,
  ): Promise<Address | HttpException> {
    return this.userService.addNewAddress(
      user,
      address,
    );
  }

  @UseGuards(JwtGuard)
  @Delete('/address/:id')
  @HttpCode(HttpStatus.CREATED)
  deleteAddress(
    @GetUser() user: UserToken,
    @Param('id') addressId: number,
  ): Promise<Address | HttpException> {
    return this.userService.deleteAddress(
      addressId,
    );
  }

  @UseGuards(JwtGuard)
  @Get('')
  @HttpCode(HttpStatus.CREATED)
  getUsers(
    @GetUser() user: UserToken,
  ): Promise<any | HttpException> {
    return this.userService.getUsers(user);
  }

  @UseGuards(JwtGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.CREATED)
  deleteUser(
    @GetUser() user: UserToken,
    @Param('id') id: string,
  ): Promise<any | HttpException> {
    return this.userService.deleteUserAdmin(
      user,
      id,
    );
  }
}
