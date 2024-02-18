import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ProductService } from './products.service';

@Controller('/products')
export class ProductController {
  constructor(
    private productSV: ProductService,
  ) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  async getProducts(): Promise<string> {
    return this.productSV.getProducts();
  }

  @Get('/:id')
  async getProduct(
    @Param('id') id: number,
  ): Promise<string> {
    return this.productSV.getProduct(id);
  }
}
