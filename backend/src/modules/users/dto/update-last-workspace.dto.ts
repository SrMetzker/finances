import { IsString, Length } from 'class-validator';

export class UpdateLastWorkspaceDto {
  @IsString()
  @Length(3, 100)
  workspaceId!: string;
}
