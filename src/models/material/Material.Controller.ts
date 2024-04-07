import { Controller, Get } from '@nestjs/common';
import { MaterialService } from './Material.service';
import { Material } from '@prisma/client';

@Controller()
export class MaterialController {
  constructor(
    private materialService: MaterialService,
  ) {}
  @Get('/material')
  getMaterials(): Promise<Material[]> {
    return this.materialService.getMaterials();
  }
}
