import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Address,
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
import { AddressDto } from './dto/AddressDto';

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
    if (user) delete user.role;
    return user;
  }

  async getUserById(
    id: number,
  ): Promise<User | undefined> {
    const user = await this.prisma.user.findFirst(
      {
        where: { id: id },
      },
    );
    if (user) delete user.role;
    return user;
  }

  async updateUser(user: UserToken, data: any) {
    try {
      const userDB =
        await this.prisma.user.findUnique({
          where: {
            id: user.sub,
          },
        });

      if (!userDB)
        throw new Error(
          `User not exit to update`,
        );

      const checkEmail =
        await this.prisma.user.findFirst({
          where: { email: data.email },
        });

      if (checkEmail)
        throw new Error(
          'email has already been taken',
        );

      const updateUser = await this.prisma.user.update({
        where: {
          id: userDB.id
        }, 
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone
        },
        select: {
          email: true,
          lastName: true,
          firstName: true,
          phone: true,
          role: true
        }
      })

      return updateUser
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  /**
   * get cart of user
   * @param user
   * @returns
   */
  async getCart(
    user: UserToken,
  ): Promise<any[] | HttpException> {
    const cart =
      await this.prisma.shoppingCart.findFirst({
        where: {
          userId: user.sub,
        },
      });

    const cartDetail =
      await this.prisma.shoppingCartProduct.findMany(
        {
          where: {
            shoppingCartId: cart.id,
          },
          select: {
            productOption: {
              select: {
                Product: {
                  select: {
                    name: true,
                    mainImage: true,
                    price: true,
                    id: true,
                  },
                },
                Color: {
                  select: {
                    id: true,
                    color: true,
                  },
                },
                Size: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            quantity: true,
          },
        },
      );

    if (!cart)
      throw new HttpException(
        'No cart found',
        HttpStatus.NOT_FOUND,
      );

    return cartDetail;
  }

  /**
   * add, update and delete product in cart
   * @param user
   * @param productCart
   * @returns
   */
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

  async getAddress(
    user: UserToken,
  ): Promise<Address[]> {
    try {
      const address =
        await this.prisma.address.findMany({
          where: {
            accountId: user.sub,
          },
        });

      if (!address)
        throw new NotFoundException(
          `User not found`,
        );

      return address;
    } catch (error) {
      // throw new ExceptionsHandler(error);
    }
  }

  async addNewAddress(
    user: UserToken,
    address: AddressDto,
  ): Promise<Address> {
    try {
      const userDB =
        await this.prisma.user.findUnique({
          where: {
            id: user.sub,
          },
        });

      if (!userDB)
        throw new NotFoundException(
          `user not found`,
        );

      const addressDB =
        await this.prisma.address.create({
          data: {
            accountId: userDB.id,
            nameAddress: address.nameAddress,
          },
        });

      return addressDB;
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  async deleteAddress(
    addressId: number,
  ): Promise<Address> {
    try {
      if (typeof addressId === 'string') {
        addressId = parseInt(addressId, 10);
      }

      const address =
        await this.prisma.address.delete({
          where: {
            id: addressId,
          },
        });

      if (!address)
        throw new Error('Address not found');

      return address;
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  /**
    function update product cart 
   * if quantity = 0 -> delete product in cart 
   * if cart not exit -> create new cart 
   * if cart exit && quantity = 0 -> update product in cart
   * @param cart cart entity 
   * @param product product entity
   * @param productCart  product Dto
   * @returns 
   */
  private async findOrCreateCartDetail(
    cart: ShoppingCart,
    product: Product,
    productCart: ProductCartDto,
  ): Promise<ShoppingCartProduct> {
    const isCartDetailExist =
      await this.prisma.shoppingCartProduct.findFirst(
        {
          where: {
            shoppingCartId: cart.id,
            productOptionsColorId:
              productCart.colorId,
            productOptionsProductId:
              productCart.productId,
            productOptionsSizeId:
              productCart.sizeId,
          },
        },
      );

    if (
      isCartDetailExist &&
      productCart.quantity === 0
    ) {
      const cartDelete =
        await this.prisma.shoppingCartProduct.delete(
          {
            where: {
              shoppingCartId_productOptionsProductId_productOptionsSizeId_productOptionsColorId:
                {
                  shoppingCartId: cart.id,
                  productOptionsColorId:
                    productCart.colorId,
                  productOptionsProductId:
                    productCart.productId,
                  productOptionsSizeId:
                    productCart.sizeId,
                },
            },
          },
        );
      return cartDelete;
    }

    if (productCart.quantity > 0) {
      if (isCartDetailExist) {
        return await this.prisma.shoppingCartProduct.update(
          {
            where: {
              shoppingCartId_productOptionsProductId_productOptionsSizeId_productOptionsColorId:
                {
                  shoppingCartId: cart.id,
                  productOptionsColorId:
                    productCart.colorId,
                  productOptionsProductId:
                    productCart.productId,
                  productOptionsSizeId:
                    productCart.sizeId,
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
              productOptionsColorId:
                productCart.colorId,
              productOptionsProductId:
                productCart.productId,
              productOptionsSizeId:
                productCart.sizeId,
              quantity: productCart.quantity,
            },
          },
        );
      }
    }
  }
}
