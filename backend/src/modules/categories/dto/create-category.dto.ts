import { CategoryType } from '@prisma/client';
import {
  IsEnum,
  IsHexColor,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(CategoryType)
  type: CategoryType;

  @IsString()
  @MinLength(2)
  icon: string;

  @IsHexColor()
  color: string;

  @IsOptional()
  @IsString()
  parentCategoryId?: string;
}
