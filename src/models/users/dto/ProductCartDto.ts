import {
  IsEAN,
  IsNotEmpty,
  IsNumber,
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
}
