import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(workspaceId: string, dto: CreateCategoryDto) {
    this.assertTransferCategoryNotAllowed(dto.type);

    if (dto.parentCategoryId) {
      const parent = await this.categoriesRepository.findById(
        workspaceId,
        dto.parentCategoryId,
      );
      if (!parent) {
        throw new BadRequestException('Categoria pai não encontrada.');
      }
      if (parent.type !== dto.type) {
        throw new BadRequestException(
          'Subcategoria deve ter o mesmo tipo da categoria pai.',
        );
      }
      if (parent.parentCategoryId) {
        throw new BadRequestException(
          'Não é permitido criar subcategoria de subcategoria.',
        );
      }
    }

    const duplicate = await this.categoriesRepository.findByName(
      workspaceId,
      dto.name,
      dto.parentCategoryId ?? null,
    );
    if (duplicate) {
      throw new ConflictException(
        dto.parentCategoryId
          ? 'Já existe uma subcategoria com esse nome nesta categoria.'
          : 'Já existe uma categoria com esse nome.',
      );
    }

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
    const current = await this.categoriesRepository.findById(workspaceId, id);
    if (!current) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    if (current.type === 'TRANSFERENCIA') {
      throw new BadRequestException(
        'Categoria de transferência é interna do sistema.',
      );
    }

    if (dto.type) {
      this.assertTransferCategoryNotAllowed(dto.type);
    }

    if (dto.parentCategoryId !== undefined) {
      if (dto.parentCategoryId === id) {
        throw new BadRequestException('Categoria não pode ser pai dela mesma.');
      }

      if (dto.parentCategoryId === null) {
        // permitido converter subcategoria em categoria raiz
      } else {
        const parent = await this.categoriesRepository.findById(
          workspaceId,
          dto.parentCategoryId,
        );
        if (!parent) {
          throw new BadRequestException('Categoria pai não encontrada.');
        }
        if (parent.type !== (dto.type ?? current.type)) {
          throw new BadRequestException(
            'Subcategoria deve ter o mesmo tipo da categoria pai.',
          );
        }
        if (parent.parentCategoryId) {
          throw new BadRequestException(
            'Não é permitido criar subcategoria de subcategoria.',
          );
        }
      }
    }

    if (dto.name && dto.name.trim() !== current.name) {
      const parentId =
        dto.parentCategoryId !== undefined
          ? dto.parentCategoryId
          : current.parentCategoryId;
      const duplicate = await this.categoriesRepository.findByName(
        workspaceId,
        dto.name.trim(),
        parentId ?? null,
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(
          parentId
            ? 'Já existe uma subcategoria com esse nome nesta categoria.'
            : 'Já existe uma categoria com esse nome.',
        );
      }
    }

    const result = await this.categoriesRepository.update(workspaceId, id, dto);
    if (result.count === 0) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    if (dto.color && !current.parentCategoryId) {
      await this.categoriesRepository.updateChildrenColor(
        workspaceId,
        id,
        dto.color,
      );
    }

    return this.findOne(workspaceId, id);
  }

  async remove(workspaceId: string, id: string) {
    const current = await this.categoriesRepository.findById(workspaceId, id);
    if (!current) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    if (current.type === 'TRANSFERENCIA') {
      throw new BadRequestException(
        'Categoria de transferência é interna do sistema.',
      );
    }

    const transactionsCount =
      await this.categoriesRepository.countTransactionsByCategory(
        workspaceId,
        id,
      );
    if (transactionsCount > 0) {
      throw new ConflictException(
        'Não é possível excluir categoria com transações vinculadas.',
      );
    }

    const subcategoriesCount =
      await this.categoriesRepository.countSubcategories(workspaceId, id);
    if (subcategoriesCount > 0) {
      throw new ConflictException(
        'Não é possível excluir categoria que possui subcategorias.',
      );
    }

    const result = await this.categoriesRepository.remove(workspaceId, id);
    if (result.count === 0) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    return { deleted: true };
  }

  private assertTransferCategoryNotAllowed(type: string) {
    if (type !== 'TRANSFERENCIA') {
      return;
    }

    throw new BadRequestException(
      'Categorias de transferência são internas do sistema.',
    );
  }
}
