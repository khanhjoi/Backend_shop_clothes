import { Controller, Get } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { Category } from "@prisma/client";

@Controller('/category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('')
  getCategories():Promise<Category[]> {
    return this.categoryService.getCategories();
  }
}