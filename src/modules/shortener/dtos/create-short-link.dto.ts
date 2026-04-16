import { IsNotEmpty, IsUrl, IsOptional, IsString, MaxLength, IsDateString } from 'class-validator';


export class CreateShortLinkDto {
  @IsNotEmpty()
  @IsUrl({ require_protocol: true })
  longUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  customAlias?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  teamId?: string;

  @IsOptional()
  customDomainId?: string;
}