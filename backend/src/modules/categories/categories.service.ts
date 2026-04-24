import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  create(workspaceId: string, dto: CreateCategoryDto) {
    return this.categoriesRepository.create(workspaceId, dto);
  }

  findAll(workspaceId: string) {
    return this.categoriesRepository.findAll(workspaceId);
  }

  async findOne(workspaceId: string, id: string) {
    const item = await this.categoriesRepository.findById(workspaceId, id);
    if (!item) throw new NotFoundException('Categoria não encontrada.');
    return item;
  }

  async update(workspaceId: string, id: string, dto: UpdateCategoryDto) {
    const result = await this.categoriesRepository.update(workspaceId, id, dto);
    if (result.count === 0)
      throw new NotFoundException('Categoria não encontrada.');
    return this.findOne(workspaceId, id);
  }

  async remove(workspaceId: string, id: string) {
    const result = await this.categoriesRepository.remove(workspaceId, id);
    if (result.count === 0)
      throw new NotFoundException('Categoria não encontrada.');
    return { deleted: true };
  }
}
