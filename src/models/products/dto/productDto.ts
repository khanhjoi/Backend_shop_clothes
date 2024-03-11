import { Size } from "@prisma/client";
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  mainImage: string;
  
  @IsArray()  
  images: Image[];

  @IsArray()  
  sizes: Size[];

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

export class Image{
  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsString()
  @IsNotEmpty()
  captions: string;

}