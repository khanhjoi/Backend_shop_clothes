import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { ReceiptDto } from './dto/receipt.dto';

@Controller('receipt')
export class ReceiptController {
  constructor( private receiptSV: ReceiptService) {}
  
  @Get('')
  @HttpCode(HttpStatus.OK)
  async getReceipts() {
    return this.receiptSV.getReceipts();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getReceipt(@Param('id') id: number) {
    return this.receiptSV.getReceipt(id);
  }

  @Post('')
  @HttpCode(HttpStatus.OK)
  async createReceipt(@Body() receiptDto: ReceiptDto) {
    return this.receiptSV.createReceipt(receiptDto);
  }
}
