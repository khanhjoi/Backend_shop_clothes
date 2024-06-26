import {
  HttpCode,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ReceiptDetail,
  ReceiptDto,
} from './dto/receipt.dto';
import { PrismaService } from '@prisma/prisma.service';
import { ProductService } from 'models/products/products.service';
import {
  Prisma,
  Product,
  Size,
  Color,
  ProductOptions,
  Shop,
} from '@prisma/client';
import { CategoryService } from 'models/category/category.service';
import {
  Image,
  ProductDto,
} from 'models/products/dto/productDto';
import { ImageService } from 'models/image/image.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { UserToken } from 'models/users/dto/UserTokenDto';

@Injectable()
export class ReceiptService {
  constructor(
    private prisma: PrismaService,
    private product: ProductService,
    private image: ImageService,
    private category: CategoryService,
  ) {}

  async getReceipts(
    user: UserToken,
  ): Promise<any> {
    try {
      if (
        user.role !== 'ADMIN' &&
        user.role !== 'STAFF'
      ) {
        throw new Error(
          'Người dùng không có quyền truy cập!',
        );
      }

      const receipts =
        await this.prisma.receipt.findMany({
          include: {
            receiptDetail: true,
          },
        });

      return receipts;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getReceipt(id: number): Promise<any> {
    return `Receipt ${id}`;
  }

  async createReceipt(
    receiptDto: ReceiptDto,
  ): Promise<any> {
    try {
      // Create products
      for (const product of receiptDto.receiptDetail) {
        await this.createProduct(product);
      }
      // Create receipt
      await this.createReceiptHelp(receiptDto);

      return 'success';
    } catch (error) {
      console.log(error);
      throw new ExceptionsHandler(error);
    }
  }

  async createReceiptHelp(
    receiptDto: ReceiptDto,
  ) {
    try {
      const totalPrice =
        this.calculatePriceReceipt(
          receiptDto.receiptDetail,
        );

      const receiptData: Prisma.ReceiptCreateInput =
        {
          shopId: receiptDto.shopId,
          totalPrice: totalPrice,
          nameShop: receiptDto.nameShop,
          nameReceipt: receiptDto.nameReceipt,
          receiptDetail: {
            createMany: {
              data: receiptDto.receiptDetail.map(
                (detail: ReceiptDetail) => ({
                  name: detail.name,
                  mainImage: detail.mainImage,
                  options: JSON.stringify(
                    detail.options,
                  ),
                  category: detail.category,
                  description: detail.description,
                  subDescription:
                    detail.subDescription,
                  price: detail.price,
                }),
              ),
            },
          },
        };

      await this.prisma.receipt.create({
        data: receiptData,
      });
    } catch (error) {
      throw new ExceptionsHandler(error.message);
    }
  }
  /**
   * check product
   * not exit -> create new product
   * exit -> update quantity
   * @param detailProduct
   * @returns
   */
  async createProduct(
    detailProduct: ReceiptDetail,
  ) {
    try {
      const category =
        await this.prisma.category.findUnique({
          where: { id: detailProduct.category },
        });

      if (!category) {
        throw new NotFoundException(
          'Cannot find category',
        );
      }

      let product =
        await this.prisma.product.findFirst({
          where: {
            name: detailProduct.name,
            categoryId: detailProduct.category,
          },
          include: {
            options: true,
          },
        });

      if (!product) {
        await this.createProductIfNotExists(
          detailProduct,
        );
      } else {
        await this.updateProductIfExists(
          detailProduct.options,
          product.id,
        );
      }
    } catch (error) {
      throw new ExceptionsHandler(
        error.response.message,
      );
    }
  }

  /**
   *  this function will create new product if it not exited
   * @param detailProduct
   */
  async createProductIfNotExists(
    detailProduct: ProductDto,
  ) {
    try {
      // create new product
      const product =
        await this.prisma.product.create({
          data: {
            name: detailProduct.name,
            mainImage: detailProduct.mainImage,
            description:
              detailProduct.description,
            subDescription:
              detailProduct.subDescription,
            price: detailProduct.price,
            categoryId: detailProduct.category,
          },
        });
      // create options product

      await this.createOptions(
        detailProduct.options,
        product,
      );

      return product;
    } catch (error) {
      // Handle the error here, you can log it or perform any other actions.

      // Rethrow the error to propagate it to the caller.
      throw error;
    }
  }

  /**
   *  this function will update the product if it exited
   * @param detailProduct
   */
  async updateProductIfExists(
    options: any,
    productId: number,
  ) {
    try {
      for (const optionArr of options) {
        const color =
          await this.isColorExist(optionArr);

        for (const size of optionArr.sizeId) {
          const option =
            await this.prisma.productOptions.findFirst(
              {
                where: {
                  productId: productId,
                  sizeId: size,
                  colorId: color.id,
                },
              },
            );

          if (!option)
            throw new NotFoundException(
              'Option not found',
            );

          const AddProductToInventory =
            (option.quantity +=
              optionArr.quantity);

          await this.prisma.productOptions.update(
            {
              where: {
                productId_sizeId_colorId: {
                  productId: productId,
                  sizeId: size,
                  colorId: color.id,
                },
              },
              data: {
                quantity: AddProductToInventory,
              },
            },
          );
        }
      }
      console.log('3');
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  calculatePriceReceipt(
    listProduct: ReceiptDetail[],
  ) {
    let totalPrice = 0;
    listProduct.forEach(
      (product: ReceiptDetail) => {
        let number = 0;
        for (const option of product.options) {
          number += option.quantity;
        }

        totalPrice += product.price * number;
      },
    );
    return totalPrice;
  }

  async isColorExist(
    option: any,
  ): Promise<Color> {
    try {
      const existingColor =
        await this.prisma.color.findFirst({
          where: {
            color: option.color,
            codeColor: option.codeColor,
          },
        });

      if (existingColor) {
        return existingColor;
      } else {
        const newColor =
          await this.prisma.color.create({
            data: {
              color: option.color,
              codeColor: option.codeColor,
            },
          });

        return newColor;
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  private async createOptions(
    options: any[],
    product: Product,
  ) {
    try {
      for (const optionArr of options) {
        const color =
          await this.isColorExist(optionArr);

        if (!color)
          throw new NotFoundException(
            'color not found',
          );

        for (const size of optionArr.sizeId) {
          const option =
            await this.prisma.productOptions.create(
              {
                data: {
                  colorId: color.id,
                  sizeId: size,
                  productId: product.id,
                  quantity: optionArr.quantity,
                },
              },
            );

          await this.createImageColor(
            option,
            optionArr.images,
          );
        }
      }
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  private async createImageColor(
    option: ProductOptions,
    images: Image[],
  ) {
    try {
      images.map(async (imageDB) => {
        const image =
          await this.prisma.image.create({
            data: {
              filePath: imageDB.filePath,
              caption: imageDB.captions,
              productOptionsColorId:
                option.colorId,
              productOptionsProductId:
                option.productId,
              productOptionsSizeId: option.sizeId,
            },
          });
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  //***************** shop ***********
  async getShops(): Promise<any> {
    try {
      const shops =
        await this.prisma.shop.findMany();
      return shops;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getCategories(): Promise<any> {
    try {
      const shops =
        await this.prisma.category.findMany();
      return shops;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async getSizes(): Promise<any> {
    try {
      const sizes =
        await this.prisma.size.findMany();
      return sizes;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }
}
