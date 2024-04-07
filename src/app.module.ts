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
import { OrderModule } from 'models/orders/orderes.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DiscountModule } from 'models/discount/Discount.module';
import { AIModule } from 'AIService/AI.module';
import { MaterialModule } from 'models/material/Material.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ClothesModule,
    ReceiptModule,
    CategoryModule,
    ImageModule,
    MaterialModule,
    AIModule,
    ProductsModule,
    OrderModule,
    PrismaModule,
    DiscountModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CloudinaryModule,
  ],
  exports: [AppModule],
})
export class AppModule {}
