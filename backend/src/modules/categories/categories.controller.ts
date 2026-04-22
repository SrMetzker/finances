import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceAccessGuard } from '../../common/guards/workspace-access.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@WorkspaceId() wid: string, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(wid, dto);
  }

  @Get()
  findAll(@WorkspaceId() wid: string) {
    return this.categoriesService.findAll(wid);
  }

  @Get(':id')
  findOne(@WorkspaceId() wid: string, @Param('id') id: string) {
    return this.categoriesService.findOne(wid, id);
  }

  @Patch(':id')
  update(
    @WorkspaceId() wid: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(wid, id, dto);
  }

  @Delete(':id')
  remove(@WorkspaceId() wid: string, @Param('id') id: string) {
    return this.categoriesService.remove(wid, id);
  }
}
