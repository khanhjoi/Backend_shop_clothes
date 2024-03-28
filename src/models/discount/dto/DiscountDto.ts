import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class DiscountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  dateStart: string;

  @IsString()
  @IsNotEmpty()
  dateEnd: string;

  @IsNumber()
  @IsNotEmpty()
  percent: number;

 
  bannerImage?: string;
}
