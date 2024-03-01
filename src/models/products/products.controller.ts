import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './products.service';
import { Prisma, Product, Rating, User } from '@prisma/client';
import { PaginatedResult } from 'common/decorators/Pagination';
import { JwtGuard } from '@auth/guard';
import { GetUser } from '@auth/decorator';
import { CommentDto } from './dto/CommentDto';

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
    return this.productSV.getProducts({
      where,
      orderBy,
      page,
    });
  }

  @Get('/:id')
  async getProduct(
    @Param('id') id: string,
  ): Promise<Product> {
    return this.productSV.getProduct(
      parseInt(id),
    );
  }

  @UseGuards(JwtGuard)
  @Post('/:id')
  async CommentProduct(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() comment: CommentDto
  ): Promise<Rating> {
    return this.productSV.commentProduct(parseInt(id), user, comment);
  }
}
