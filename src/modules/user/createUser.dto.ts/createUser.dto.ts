import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @IsString()
    readonly username: string;

    @IsEmail()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    readonly password: string;

}