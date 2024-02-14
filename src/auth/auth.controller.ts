import {
  Body,
  Controller,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { AuthDto } from './dto';

@Controller('/auth')
export class AuthController {
  /**
   * ---------------------Knowledge ----------------------
   * the parameter private in constructor is just sort temp
   * to create a constructor function
   * instead of creating
   *   authService: AuthService;
   *   constructor() {
   *    this.authService = new AuthService
   *   }
   */
  constructor(private authService: AuthService) {}
  /**
   * example to basic using pipe -> use class
   * @param email
   * @param password
   * @returns
   */
  @Post('/signup')
  signUp(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }
  // @Post('/signup')
  // signUp(
  //   @Body('email') email: string,
  //   @Body('password', ParseIntPipe)
  //   password: string,
  // ) {
  //   console.log({ email, password });
  //   return this.authService.signup();
  // }

  @Post('/signin') // Fix: Add a slash before 'signin'
  signIn() {
    return this.authService.signin();
  }
}
