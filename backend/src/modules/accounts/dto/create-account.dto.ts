import { IsBoolean, IsHexColor, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsNumber()
  initialBalance!: number;

  @IsString()
  @MinLength(2)
  icon!: string;

  @IsHexColor()
  color!: string;

  @IsBoolean()
  @IsOptional()
  showOnDashboard?: boolean;
}
