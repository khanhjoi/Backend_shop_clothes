import {
  HttpCode,
  HttpException,
  Injectable,
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
} from '@prisma/client';
import { CategoryService } from 'models/category/category.service';
import { ProductDto } from 'models/products/dto/productDto';
import { ImageService } from 'models/image/image.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class ReceiptService {
  constructor(
    private prisma: PrismaService,
    private product: ProductService,
    private image: ImageService,
    private category: CategoryService,
  ) {}

  async getReceipts(): Promise<any> {
    return 'Receipts';
  }

  async getReceipt(id: number): Promise<any> {
    return `Receipt ${id}`;
  }

  async createReceipt(
    receiptDto: ReceiptDto,
  ): Promise<any> {
    try {
      // Create products
      await Promise.all(
        receiptDto.receiptDetail.map(
          async (product) => {
            await this.createProduct(product);
          },
        ),
      );

      // Create receipt
      await this.createReceiptHelp(receiptDto);

      return 'success';
    } catch (error) {
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
          nameReceipt: receiptDto.nameReceipt,
          receiptDetail: {
            createMany: {
              data: receiptDto.receiptDetail.map(
                (detail: ReceiptDetail) => ({
                  name: detail.name,
                  mainImage: detail.mainImage,
                  images: JSON.stringify(
                    detail.images,
                  ),
                  sizes: JSON.stringify(
                    detail.sizes,
                  ),
                  category: detail.category,
                  description: detail.description,
                  subDescription:
                    detail.subDescription,
                  quantity: detail.quantity,
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
        });

      if (!product) {
        await this.createProductIfNotExists(
          detailProduct,
        );
      } else {
        await this.updateProductIfExists(
          product.id,
          detailProduct.quantity,
        );
      }
    } catch (error) {
      throw new ExceptionsHandler(error.message);
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
      console.log("1")
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
            quantity: detailProduct.quantity,
            categoryId: detailProduct.category,
          },
        });
      // create image for product
      console.log("2")

      const image =
        await this.image.createProductImage(
          product.id,
          detailProduct.images,
        );

      if (!image) throw ExceptionsHandler;
      console.log("3")
      

      await this.createSizeProduct(
        product.id,
        detailProduct.sizes,
      );
      console.log("4")

      return product;
    } catch (error) {
      // Handle the error here, you can log it or perform any other actions.
      console.error(
        'Error creating product:',
        error,
      );
      // Rethrow the error to propagate it to the caller.
      throw error;
    }
  }

  /**
   *  this function will update the product if it exited
   * @param detailProduct
   */
  async updateProductIfExists(
    productId: number,
    quantity: number,
  ) {
    const product =
      await this.product.findProductById(
        productId,
      );

    if (!product)
      throw new NotFoundException(
        'Not found product',
      );

    product.quantity += quantity;

    // Save the updated product
    return await this.product.saveProduct(
      product,
    );
  }

  calculatePriceReceipt(
    listProduct: ReceiptDetail[],
  ) {
    let totalPrice = 0;
    listProduct.forEach(
      (product: ReceiptDetail) => {
        totalPrice += product.price;
      },
    );
    return totalPrice;
  }

  async createSizeProduct(
    productId: number,
    sizes: Size[],
  ) {
    await Promise.all(
      sizes.map(async (size: Size) => {
        const sizeDB =
          await this.prisma.size.create({
            data: {
              name: size.name,
              caption: size.caption,
              productId: productId,
            },
          });
        if (!sizeDB) {
          throw new NotFoundException(
            'error creating size',
          ); // Provide a more specific message
        }
      }),
    );
  }
}
