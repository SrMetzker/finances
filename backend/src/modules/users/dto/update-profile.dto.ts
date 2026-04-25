import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 60)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000000)
  avatarUrl?: string;
}
