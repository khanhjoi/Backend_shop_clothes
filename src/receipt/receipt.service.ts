import { Injectable } from '@nestjs/common';

@Injectable()
export class ReceiptService {
  constructor() {}

  async getReceipts(): Promise<any> {
    return 'Receipts';
  }

  async getReceipt(id: number): Promise<any> {
    return `Receipt ${id}`;
  }

  async createReceipt(
    receiptDto: string,
  ): Promise<any> {
    const value = JSON.stringify(receiptDto);
    return `Receipt created with value ${value}`;
  }
}
