import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { Material, Prisma } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class MaterialService {
  constructor(private prisma: PrismaService) {

  }
  async getMaterials():Promise<Material[]> {
    try {
      const materials = await this.prisma.material.findMany();

      if(materials.length <= 0) {
        throw new Error('Material not found')
      }

      return materials
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST
      )
    }
  }
}
