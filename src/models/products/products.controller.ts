import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ProductService } from './products.service';
import { Prisma, Product } from '@prisma/client';
import { PaginatedResult } from 'common/decorators/Pagination';

@Controller('/products')
export class ProductController {
  constructor(
    private productSV: ProductService,
  ) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  async getProducts(
    @Query('where') where: string, // Assuming 'where' is coming from query parameters
    @Query('orderBy')
    orderBy: string,
    // UserOrderByWithRelationInput
    @Query('page') page: number,
  ): Promise<PaginatedResult<Product>> {  
    return this.productSV.getProducts({ where, orderBy, page });
  }

  @Get('/:id')
  async getProduct(
    @Param('id') id: number,
  ): Promise<string> {
    return this.productSV.getProduct(id);
  }
}
