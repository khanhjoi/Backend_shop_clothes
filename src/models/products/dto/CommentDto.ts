import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CommentDto {
  id?: number;

  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsNumber()
  rating: number;
}
