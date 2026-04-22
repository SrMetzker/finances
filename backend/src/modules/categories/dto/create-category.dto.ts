import { CategoryType } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(CategoryType)
  type: CategoryType;
}
