import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
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

  @Post('/signup')
  async signUp(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @Post('/signin') // Fix: Add a slash before 'signin'
  signIn(@Body() dto:AuthDto) {
    return this.authService.signin(dto);
  }
}
