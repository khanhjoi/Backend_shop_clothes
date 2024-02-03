import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

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

  @Post('/signup')
  signUp() {
    return this.authService.signup();
  }

  @Post('/signin') // Fix: Add a slash before 'signin'
  signIn() {
    return this.authService.signin();
  }
}
