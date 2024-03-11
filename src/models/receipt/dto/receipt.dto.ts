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

export class ReceiptDetail {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  mainImage: string;
  
  @IsArray()  
  images: any[];

  @IsArray()  
  sizes: any[];

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
  quantity: number;

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
