import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SupabaseExchangeDto {
  @IsString()
  @MinLength(20)
  accessToken: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  workspaceName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  leadSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  leadCampaign?: string;
}
