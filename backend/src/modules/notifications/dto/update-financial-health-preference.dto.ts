import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export enum NotificationFrequencyDto {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export class UpdateFinancialHealthPreferenceDto {
  @IsBoolean()
  enabled: boolean;

  @IsEnum(NotificationFrequencyDto)
  frequency: NotificationFrequencyDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  weekday?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  time: string;

  @IsString()
  @Matches(/^[A-Za-z_]+\/[A-Za-z_]+(?:\/[A-Za-z_]+)?$/)
  timezone: string;
}
