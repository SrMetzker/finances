import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const CURRENCIES = ['EUR', 'USD', 'BRL', 'GBP'] as const;

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsIn(CURRENCIES)
  currency?: (typeof CURRENCIES)[number];
}
