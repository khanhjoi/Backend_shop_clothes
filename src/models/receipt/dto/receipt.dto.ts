import {
  IsNumber,
  IsString,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Color } from 'models/products/dto/productDto';

export class ReceiptDetail {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  mainImage: string;
  
  @IsArray()  
  options: any[]

  @IsNumber()
  @IsNotEmpty()
  category: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  subDescription: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class ReceiptDto {
  @IsNumber()
  @IsNotEmpty()
  shopId: number;

  @IsString()
  @IsNotEmpty()
  nameReceipt: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReceiptDetail)
  receiptDetail: ReceiptDetail[];
}
