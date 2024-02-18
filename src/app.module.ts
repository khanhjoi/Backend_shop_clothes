import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { ClothesModule } from './clothes/clothes.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from 'products/products.module';
import { ReceiptModule } from 'receipt/receipt.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ClothesModule,
    ReceiptModule,
    ProductsModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  exports: [AppModule]
})
export class AppModule {}
