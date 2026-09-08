import { IsObject, IsOptional, IsString, IsUrl } from 'class-validator';

export class PushSubscriptionDto {
  @IsUrl()
  endpoint!: string;

  @IsObject()
  keys!: {
    p256dh: string;
    auth: string;
  };

  @IsOptional()
  @IsString()
  userAgent?: string;
}