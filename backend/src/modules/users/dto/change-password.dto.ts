import { IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @Length(6, 100)
  currentPassword!: string;

  @IsString()
  @Length(6, 100)
  newPassword!: string;
}
