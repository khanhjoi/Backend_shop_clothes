import { Module } from '@nestjs/common';
import { ProductService } from './products.service';
import { PrismaModule } from '@prisma/prisma.module';
import { ProductController } from './products.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductsModule {}
