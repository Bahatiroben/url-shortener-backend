import { Transform } from 'class-transformer';
import {IsString, IsNotEmpty, IsUrl, IsDateString, IsBoolean, Min, IsOptional} from 'class-validator';

export class createLinkDTO {
    @IsUrl()
    readonly originalUrl!: string;

    @IsString()
    @IsNotEmpty()
    readonly title!: string;

    @IsString()
    readonly description?: string;

    @IsDateString()
    // @Transform(({ value }) => new Date(value).getTime())
    // @Min(Date.now(), { message: 'validUntil must be in the future' })
    readonly validUntil!: string;

    @IsOptional()
    @IsBoolean()
    readonly isActive?: boolean;

}