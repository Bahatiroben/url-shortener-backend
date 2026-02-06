
import { IsNotEmpty, IsString } from "class-validator";
export class LoginDto {
    @IsString()
    readonly username: string;

    @IsString()
    @IsNotEmpty()
    readonly password: string;
}