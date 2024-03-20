import {
  IsNotEmpty,
  isNotEmpty,
} from 'class-validator';

export class UserToken {
  @IsNotEmpty()
  sub: number;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  iat: number;

  @IsNotEmpty()
  exp: number;

  @IsNotEmpty()
  role: string;
}
