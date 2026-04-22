import { IsInt, IsNumber, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsNumber()
  limit: number;

  @IsInt()
  @Min(1)
  @Max(31)
  closingDay: number;

  @IsInt()
  @Min(1)
  @Max(31)
  dueDay: number;
}
