import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './models/users/user.module';
import { ClothesModule } from './models/clothes/clothes.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from 'models/products/products.module';
import { ReceiptModule } from 'models/receipt/receipt.module';
import { CategoryModule } from 'models/category/category.module';
import { ImageModule } from 'models/image/image.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ClothesModule,
    ReceiptModule,
    CategoryModule,
    ImageModule,
    ProductsModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  exports: [AppModule]
})
export class AppModule {}
