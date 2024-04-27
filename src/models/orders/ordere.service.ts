import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import {
  Order,
  OrderDesign,
  Prisma,
  Status,
  User,
} from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { UserToken } from 'models/users/dto/UserTokenDto';
import { NotFoundError } from 'rxjs';
import { UpdateStatusReq } from './types/updateStatus';
import { MailService } from 'mail/mail.service';
import moment from 'moment';
import { SendEmailDto } from 'mail/dto/mail.dto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async getOrders(user: any): Promise<Order[]> {
    try {
      const order =
        await this.prisma.order.findMany({
          where: {
            userId: user.sub,
          },
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            OrderDetail: {
              select: {
                productOption: {
                  include: {
                    Color: true,
                    Size: true,
                    Product: true,
                  },
                },
                quantity: true,
              },
            },
          },
        });
      if (!order)
        throw new NotFoundError(
          `Order not found`,
        );

      return order;
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  async getOrdersDesign(
    user: any,
  ): Promise<OrderDesign[]> {
    try {
      const order =
        await this.prisma.orderDesign.findMany({
          where: {
            userId: user.sub,
          },
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        });
      if (!order)
        throw new NotFoundError(
          `Order not found`,
        );

      return order;
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  async getOrder(user: any) {
    try {
    } catch (error) {}
  }

  async updateOrder(
    user: UserToken,
    orderStatus: any,
    orderId: string,
  ): Promise<Order> {
    try {
      const order =
        await this.prisma.order.findFirst({
          where: {
            id: Number(orderId),
          },
        });


      if (order?.userId !== user.sub)
        throw new Error(
          'Người dùng không phải chủ đơn hàng',
        );

      const updateOrder =
        await this.prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: orderStatus.orderStatus,
          },
          include: {
            OrderDetail: true,
          },
        });

      if (updateOrder.status === 'IS_CANCELLED') {
        for (const product of updateOrder.OrderDetail) {
          const option =
            await this.prisma.productOptions.findFirst(
              {
                where: {
                  sizeId:
                    product.productOptionsSizeId,
                  colorId:
                    product.productOptionsColorId,
                  productId:
                    product.productOptionsProductId,
                },
              },
            );

          const quantity =
            option.quantity + product.quantity;

          await this.prisma.productOptions.update(
            {
              where: {
                productId_sizeId_colorId: {
                  sizeId: option.sizeId,
                  colorId: option.colorId,
                  productId: option.productId,
                },
              },
              data: {
                quantity: quantity,
              },
            },
          );
        }
      }

      return updateOrder;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async updateOrderDesignUser(
    user: UserToken,
    orderStatus: any,
    orderId: string,
  ): Promise<OrderDesign> {
    try {
      const order =
        await this.prisma.orderDesign.findFirst({
          where: {
            id: Number(orderId),
          },
        });


      if (order?.userId !== user.sub)
        throw new Error(
          'Người dùng không phải chủ đơn hàng',
        );

      const updateOrder =
        await this.prisma.orderDesign.update({
          where: {
            id: order.id,
          },
          data: {
            status: orderStatus.orderStatus,
          },
        });

      return updateOrder;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async createOrder(user: any, order: any) {
    try {
      const createOrder =
        await this.prisma.order.create({
          data: {
            userId: user.sub,
            address: order.address,
            status: 'IN_PROGRESS',
            payment: order.payment,
            total: order.total,
          },
        });

      if (!createOrder)
        throw new NotFoundError(
          'some error occurred while creating',
        );

      await this.createOrderDetail(
        createOrder.id,
        order.orderDetail,
      );

      await this.removeCartDetail(user.sub);
      return createOrder;
    } catch (error) {

      throw new ExceptionsHandler(error);
    }
  }

  async createOrderDesign(
    user: UserToken,
    order: any,
  ): Promise<OrderDesign> {
    try {
      const orderDesign =
        await this.prisma.orderDesign.create({
          data: {
            userId: user.sub,
            address: order.address.nameAddress,
            detail: JSON.stringify(order.detail),
            colorCode: order.colorCode,
            status: 'IN_PROGRESS',
            logo: order.logo,
            image: order.image,
            material: order.material.name,
            total: order.total,
          },
        });

      if (!orderDesign) {
        throw new Error(
          'orderDesign create failed',
        );
      }
      return orderDesign;
    } catch (error) {

      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getOrdersByAdmin() {
    try {
    } catch (error) {}
  }

  async createOrderDetail(
    orderId: number,
    orderDetail: any,
  ) {
    if (orderDetail.length <= 0)
      throw new Error(
        'orderDetail must have value',
      );

    for (const option of orderDetail) {
      const orderDetailOption =
        await this.prisma.orderDetail.create({
          data: {
            orderId: orderId,
            quantity: option.quantity,
            productOptionsProductId:
              option.productOption.Product.id,
            productOptionsColorId:
              option.productOption.Color.id,
            productOptionsSizeId:
              option.productOption.Size.id,
          },
        });

      const productOption =
        await this.prisma.productOptions.findFirst(
          {
            where: {
              productId:
                option.productOption.Product.id,
              colorId:
                option.productOption.Color.id,
              sizeId:
                option.productOption.Size.id,
            },
          },
        );

      if (!productOption)
        throw new NotFoundError(
          'can find product option',
        );

      await this.prisma.productOptions.update({
        where: {
          productId_sizeId_colorId: {
            productId:
              option.productOption.Product.id,
            colorId:
              option.productOption.Color.id,
            sizeId: option.productOption.Size.id,
          },
        },
        data: {
          quantity:
            productOption.quantity -
            option.quantity,
        },
      });

      if (!orderDetailOption)
        throw new NotFoundError(
          'something wrong happened',
        );
    }
  }

  async removeCartDetail(userId: number) {
    try {
      const shoppingCart =
        await this.prisma.shoppingCart.findFirst({
          where: {
            userId: userId,
          },
        });

      if (!shoppingCart)
        throw new NotFoundError(
          `No shopping cart`,
        );

      const shoppingCartDetail =
        await this.prisma.shoppingCartProduct.deleteMany(
          {
            where: {
              shoppingCartId: shoppingCart.id,
            },
          },
        );

      if (!shoppingCartDetail)
        throw new NotFoundError(
          `No shopping cart`,
        );

      return shoppingCartDetail;
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  // admin

  async getOrderDesignAdmin(
    user: UserToken,
  ): Promise<OrderDesign[]> {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new ForbiddenException(); // Throwing ForbiddenException for non-admin users
      }

      const orders =
        await this.prisma.orderDesign.findMany({
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        });

      for (const order of orders) {
        if (order.status === 'IN_ACCEPT') {

          const givenDate: any = new Date(
            order.createdAt,
          );

          // Get the current date
          const currentDate: any = new Date();

          // Calculate the difference in milliseconds
          const differenceInMilliseconds =
            currentDate - givenDate;

          // Convert milliseconds to days
          const differenceInDays =
            differenceInMilliseconds /
            (1000 * 60 * 60 * 24);
          // Check if the difference is greater than 2 days
          if (differenceInDays > 7) {
            await this.prisma.orderDesign.update({
              where: {
                id: order.id,
              },
              data: {
                status: 'IS_CANCELLED',
              },
            });
          } 
        }
        // Parse the given date string into a Date object
      }
      if (!orders)
        throw new Error(
          'orders must be specified',
        );
      return orders;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getOrdersAdmin(
    user: UserToken,
  ): Promise<Order[]> {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new ForbiddenException(); // Throwing ForbiddenException for non-admin users
      }

      const orders =
        await this.prisma.order.findMany({
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            OrderDetail: {
              select: {
                productOption: {
                  include: {
                    Color: true,
                    Size: true,
                    Product: true,
                  },
                },
                quantity: true,
              },
            },
          },
        });

      if (!orders)
        throw new Error(
          'orders must be specified',
        );
      return orders;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getReceipt(user: UserToken) {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new ForbiddenException(); // Throwing ForbiddenException for non-admin users
      }
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async updateOrderAdmin(
    user: UserToken,
    updateStatus: UpdateStatusReq,
  ): Promise<Order> {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          'Người dùng không có quyền truy cập',
        );
      }

      const order =
        await this.prisma.order.findUnique({
          where: {
            id: updateStatus.order.orderId,
          },
        });

      if (!order)
        throw new Error(
          'Đơn hàng không tồn tại!',
        );

      if (
        order.status === 'IS_SUCCESS' ||
        order.status === 'IS_CANCELLED' ||
        order.status === 'DELIVERED' ||
        order.status === 'RETURNED' ||
        order.status === 'REFUNDED'
      ) {
        throw new Error(
          'Đơn hàng đã kết thúc không thể thay đổi trạng thái!',
        );
      }
      const update =
        await this.prisma.order.update({
          where: {
            id: updateStatus.order.orderId,
          },
          data: {
            status: updateStatus.order.status,
          },
          include: {
            OrderDetail: true,
          },
        });

      if (update.status === 'IS_CANCELLED') {
        for (const product of update.OrderDetail) {
          const option =
            await this.prisma.productOptions.findFirst(
              {
                where: {
                  sizeId:
                    product.productOptionsSizeId,
                  colorId:
                    product.productOptionsColorId,
                  productId:
                    product.productOptionsProductId,
                },
              },
            );

          const quantity =
            option.quantity + product.quantity;

          await this.prisma.productOptions.update(
            {
              where: {
                productId_sizeId_colorId: {
                  sizeId: option.sizeId,
                  colorId: option.colorId,
                  productId: option.productId,
                },
              },
              data: {
                quantity: quantity,
              },
            },
          );
        }
      }

      return update;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async updateOrderDesignAdmin(
    user: UserToken,
    updateStatus: UpdateStatusReq,
  ): Promise<OrderDesign> {
    try {
      if (
        !['ADMIN', 'STAFF'].includes(user.role)
      ) {
        throw new Error(
          'Người dùng không có quyền truy cập',
        );
      }

      const order =
        await this.prisma.orderDesign.findUnique({
          where: {
            id: updateStatus.order.orderId,
          },
        });

      if (!order) {
        throw new Error(
          'Đơn hàng không tồn tại!',
        );
      }

      const terminalStatuses = [
        'IS_SUCCESS',
        'IS_CANCELLED',
        'DELIVERED',
        'RETURNED',
        'REFUNDED',
      ];
      if (
        terminalStatuses.includes(order.status)
      ) {
        throw new Error(
          'Đơn hàng đã kết thúc không thể thay đổi trạng thái!',
        );
      }

      const userDB =
        await this.prisma.user.findUnique({
          where: {
            id: order.userId,
          },
        });

      if (!userDB) {
        throw new Error(
          'Người dùng không tồn tại',
        );
      }

      let dataToUpdate: any = {
        status: updateStatus.order.status,
      };

      if (updateStatus.order.total >= 0) {
        dataToUpdate.total =
          updateStatus.order.total;
      } else {
        dataToUpdate.total = 0;
      }

      const update =
        await this.prisma.orderDesign.update({
          where: {
            id: updateStatus.order.orderId,
          },
          data: dataToUpdate,
        });

      if (update.status === 'IN_ACCEPT') {
        const dto: SendEmailDto = {
          from: {
            name: 'CMS',
            address: 'CMS@gmail.com',
          },
          recipients: [
            {
              name: `${userDB.firstName} ${userDB.lastName}`,
              address: userDB.email,
            },
          ],
          subject:
            'Hãy xác nhận đơn hàng của bạn!!!',
          html: `
          <div
          style="
            width: 40%;
            height: 34rem;
            margin: 10px auto;
            border-radius: 4px;
            box-shadow: 1px 2px 4px rgb(0, 0, 0, 0.2);
          "
        >
          <h1
            style="
              padding-top: 10px;
              width: full;
              text-align: center;
              font-size: 2rem;
            "
          >
            Xác nhận đơn hàng của bạn
          </h1>
    
          <img
            src="https://t3.ftcdn.net/jpg/04/60/79/46/360_F_460794612_JXF0OGQ84Y49kDCj4Sz3tfdnKNrKNj9A.jpg"
            alt=""
            srcset=""
            style="
              display: block;
              width: 80%;
              margin: 0 auto;
              margin-top: 10px;
            "
          />
          <p
            style="text-align: center;"
          >
            Xin chào người dùng
            <span style="font-weight: bold">
              ${userDB.firstName} ${userDB.lastName}</span
            >
            đơn hàng của bạn đã được xác nhận và thành
            tiền vui lòng truy cập
            <a href="http://localhost:5173/profile"
              >Đơn hàng</a
            >
            để xác nhận đơn hàng. <br/>
           Lưu ý: Vui lòng cập nhật đơn hàng của bạn đơn hàng sẽ hủy trong 7 ngày, nếu bạn không xác nhận,kể từ ngày gửi email này.
          </p>
          
        </div>`,
        };
        this.mail.sendMail(dto);
      }

      return update;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }
}
