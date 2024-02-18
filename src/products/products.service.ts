import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
  constructor(
  ) {}

  async getProducts(): Promise<any> {
    return "products";
  }

  async getProduct(id: number): Promise<any> {
    return `products/${id}`;
  }
}
