import { genSalt, hash, compare} from 'bcrypt';

export async function hashPassword(rawPassword: string): Promise<string> {
    const passwordSalt = await genSalt()
    return  hash(rawPassword, passwordSalt);
}

export async function verifyPassword(rawPassword: string, hashedPassword: string): Promise<boolean> {
    return compare(rawPassword, hashedPassword);
}