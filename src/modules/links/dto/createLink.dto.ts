import {IsString, IsNotEmpty, IsUrl, IsDate, IsBoolean} from 'class-validator';

export class createLinkDTO {
    @IsUrl()
    readonly longUrl!: string;

}