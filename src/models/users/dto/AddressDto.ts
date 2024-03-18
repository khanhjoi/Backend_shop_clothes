import { IsNotEmpty, IsString } from "class-validator";

export class AddressDto {
  @IsNotEmpty()
  @IsString()
  nameAddress: string;
}