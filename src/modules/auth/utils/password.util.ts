import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordUtil {
    constructor(
    ) {
        
    }

    hashPassword(rawPassword: string): string {
        return bcrypt.hashSync(rawPassword, 10);
    }

    comparePasswords(rawPassword: string, hashedPassword: string): boolean {
        return bcrypt.compareSync(rawPassword, hashedPassword);
    }
}