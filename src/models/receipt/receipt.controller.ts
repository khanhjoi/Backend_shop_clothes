import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { ReceiptDto } from './dto/receipt.dto';
import { JwtGuard } from '@auth/guard';
import { GetUser } from '@auth/decorator';
import { UserToken } from 'models/users/dto/UserTokenDto';
import { Shop } from '@prisma/client';

@Controller('/receipt')
export class ReceiptController {
  constructor(
    private receiptSV: ReceiptService,
  ) {}

  @UseGuards(JwtGuard)
  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getReceipts(@GetUser() user: UserToken) {
    return this.receiptSV.getReceipts(user);
  }

  @Get('/shops')
  @HttpCode(HttpStatus.OK)
  async getShops(): Promise<any> {
    return this.receiptSV.getShops();
  }

  @Get('/categories')
  @HttpCode(HttpStatus.OK)
  async getCategories(): Promise<any> {
    return this.receiptSV.getCategories();
  }

  @Get('/sizes')
  @HttpCode(HttpStatus.OK)
  async getSizes(): Promise<any> {
    return this.receiptSV.getSizes();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getReceipt(@Param('id') id: number) {
    return this.receiptSV.getReceipt(id);
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  async createReceipt(
    @Body() receiptDto: ReceiptDto,
  ) {
    return this.receiptSV.createReceipt(
      receiptDto,
    );
  }
}
