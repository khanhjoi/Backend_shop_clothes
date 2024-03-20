import {
  ForbiddenException,
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

import { AddressDto } from './dto/AddressDto';
import { AuthService } from '@auth/auth.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService ) {}

  async getUsers(user: UserToken) {
    try {
      if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        throw new ForbiddenException(); // Throwing ForbiddenException for non-admin users
      }
      const users =
        await this.prisma.user.findMany({
          where: {
            id: { not: 0 },
          },
          select: {
            email: true,
            password: true,
            firstName: true,
            createdAt: true,
            lastName: true,
            phone: true,
            id: true,
            role: true,
          },
        });

      return users;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async deleteUserAdmin(user: UserToken, userId: string) {
    try {
      if (user.role !== "ADMIN") {
        throw new Error('Không có quyền thực hiện');
      }
  
      const id = parseInt(userId, 10); // Ensure id is parsed correctly
  
      // Fetch user details including related entities
      const userToDelete = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          cart: true,
          orders: true,
          addresses: true,
          rating: true,
        },
      });
  
      if (!userToDelete) {
        throw new Error('User not found');
      }
  
      // Delete all related entities
      if (userToDelete.cart) {
        await this.prisma.shoppingCart.delete({
          where: {
            id: userToDelete.cart.id,
          },
        });
      }
  
      await Promise.all(userToDelete.orders.map(async (order) => {
        await this.prisma.orderDetail.deleteMany({
          where: {
            orderId: order.id,
          }
        })
        await this.prisma.order.delete({
          where: {
            id: order.id,
          },
        });
        
      }));
  
      await Promise.all(userToDelete.addresses.map(async (address) => {
        await this.prisma.address.delete({
          where: {
            id: address.id,
          },
        });
      }));
  
      await Promise.all(userToDelete.rating.map(async (rating) => {
        await this.prisma.rating.delete({
          where: {
            id: rating.id,
          },
        });
      }));
  
      // Now, delete the user
      const deletedUser = await this.prisma.user.delete({
        where: {
          id: id,
        },
      });
  
      return deletedUser;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  
  /**
   * @param email
   * @returns User
   */
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

  /**
   * @param id
   * @returns User
   */
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

  /**
   * function update  User
   */
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


      const updateUser =
        await this.prisma.user.update({
          where: {
            id: userDB.id,
          },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
          },
          select: {
            email: true,
            lastName: true,
            firstName: true,
            phone: true,
            role: true,
          },
        });

      return updateUser;
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
  /**
   * @param user
   * @returns Address[]
   */
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

  /**
   *
   * @param user
   * @param address
   * @returns NewAddress
   */
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
  /**
   *
   * @param addressId
   * @returns Address has Delete
   */
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
