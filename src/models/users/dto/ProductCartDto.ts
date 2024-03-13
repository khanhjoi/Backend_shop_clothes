import {
  IsEAN,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ProductCartDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  colorId: number;

  @IsNumber()
  @IsNotEmpty()
  sizeId: number;
}
