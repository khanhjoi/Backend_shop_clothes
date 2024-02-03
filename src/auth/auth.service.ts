import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {

  }
  signin() {
    return 'I am signed';
  }
  signup() {
    return 'I am signed up';
  }
}
