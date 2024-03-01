import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CommentDto {
  @IsNotEmpty()
  @IsString()
  comment: string;
  
  @IsNotEmpty()
  @IsNumber()
  rating: number;
}
