import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Product,
  ShoppingCart,
  ShoppingCartProduct,
  User,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductCartDto } from './dto/ProductCartDto';
import { UserToken } from './dto/UserTokenDto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { HttpAdapterHost } from '@nestjs/core';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(
    email: string,
  ): Promise<User | undefined> {
    const user = await this.prisma.user.findFirst(
      {
        where: { email: email },
      },
    );
    return user;
  }

  async updateProductInCart(
    user: UserToken,
    productCart: ProductCartDto,
  ): Promise<
    ShoppingCartProduct | HttpException
  > {
    try {
      const userDB = await this.findOne(
        user.email,
      );

      if (!userDB) {
        throw new NotFoundException(
          'User not found',
        );
      }

      const cart =
        await this.prisma.shoppingCart.findUnique(
          {
            where: {
              userId: user.sub,
            },
          },
        );

      const product =
        await this.prisma.product.findUnique({
          where: {
            id: productCart.productId,
          },
        });

      const cartDetail =
        await this.findOrCreateCartDetail(
          cart,
          product,
          productCart,
        );

      return cartDetail;
    } catch (error) {
      // Handle any unexpected errors
      throw new InternalServerErrorException(
        'Something went wrong while updating the product in the cart',
      );
    }
  }

  private async findOrCreateCartDetail(
    cart: ShoppingCart,
    product: Product,
    productCart: ProductCartDto,
  ): Promise<ShoppingCartProduct> {
    const isCartDetailExist =
      await this.prisma.shoppingCartProduct.findUnique(
        {
          where: {
            shoppingCartId_productId: {
              shoppingCartId: cart.id,
              productId: product.id,
            },
          },
        },
      );

    if (
      isCartDetailExist &&
      productCart.quantity === 0
    ) {
      await this.prisma.shoppingCartProduct.delete(
        {
          where: {
            shoppingCartId_productId: {
              shoppingCartId: cart.id,
              productId: product.id,
            },
          },
        },
      );
      throw new HttpException(
        'Delete product in cart',
        HttpStatus.OK,
      );
    }

    if (productCart.quantity > 0) {
      if (isCartDetailExist) {
        return await this.prisma.shoppingCartProduct.update(
          {
            where: {
              shoppingCartId_productId: {
                shoppingCartId: cart.id,
                productId: product.id,
              },
            },
            data: {
              quantity: productCart.quantity,
            },
          },
        );
      } else {
        return await this.prisma.shoppingCartProduct.create(
          {
            data: {
              shoppingCartId: cart.id,
              productId: product.id,
              quantity: productCart.quantity,
            },
          },
        );
      }
    }
    return null;
  }
}
