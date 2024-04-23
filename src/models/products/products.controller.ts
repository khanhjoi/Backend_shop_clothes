import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './products.service';
import {
  Prisma,
  Product,
  Rating,
  Size,
  User,
} from '@prisma/client';
import { PaginatedResult } from 'common/decorators/Pagination';
import { JwtGuard } from '@auth/guard';
import { GetUser } from '@auth/decorator';
import { CommentDto } from './dto/CommentDto';
import { UserToken } from 'models/users/dto/UserTokenDto';

@Controller('/products')
export class ProductController {
  constructor(
    private productSV: ProductService,
  ) {}

  @UseGuards(JwtGuard)
  @Get('/admin')
  async getProductsAdmin(
    @GetUser() user: UserToken,
  ): Promise<Product[]> {
    return this.productSV.getProductsAdmin(user);
  }

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

  @Get('/sizes')
  @HttpCode(HttpStatus.OK)
  async getSizes(): Promise<Size[]> {
    return this.productSV.getSize();
  }

  @Get('/discount')
  @HttpCode(HttpStatus.OK)
  async getProductsDiscount() {
    return this.productSV.getProductsDiscount();
  }

  @UseGuards(JwtGuard)
  @Put('/:id/admin')
  async updateProductAdmin(
    @Body() product: Product,
    @Param('id') id: number,
  ): Promise<Product> {
    return this.productSV.updateProduct(
      Number(id),
      product,
    ); 
  }

  @UseGuards(JwtGuard)
  @Delete('/:id/admin')
  async deleteProductAdmin(
    @Param('id') id: number,
  ) {
    return this.productSV.deleteProduct(
      Number(id),
    );
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
    @Body() comment: CommentDto,
  ): Promise<Rating> {
    return this.productSV.commentProduct(
      parseInt(id),
      user,
      comment,
    );
  }

  @UseGuards(JwtGuard)
  @Put('/:id')
  async UpdateComment(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() comment: CommentDto,
  ): Promise<Rating> {
    return this.productSV.updateComment(
      parseInt(id),
      user,
      comment,
    );
  }

  @UseGuards(JwtGuard)
  @Delete('/:id/:comment')
  async deleteComment(
    @Param('id') id: string,
    @Param('comment') commentId: string,
    @GetUser() user: any,
  ): Promise<String> {
    return this.productSV.deleteComment(
      parseInt(id),
      user,
      parseInt(commentId),
    );
  }
}
