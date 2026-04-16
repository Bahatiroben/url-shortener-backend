import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/modules/users/services';
import { LoginDto } from '../dtos/login.dto';
import { IAuthResult, IValidatedUser } from '../interfaces';
import { JwtService } from '@nestjs/jwt';
import { PasswordUtil } from '../utils/password.util';
import { CreateUserDto } from '../../users/dtos';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private passwordUtil: PasswordUtil
    ) {}

    async authenticate(loginDto: LoginDto): Promise<IAuthResult> {
        const { email, password } = loginDto;
        const user = await this.validateUser(email, password);
        if(!user) {
            throw new UnauthorizedException("Invalid credentials");
        }
        return this.login(user);
    }

    async register(createUserDto: CreateUserDto): Promise<IAuthResult> {
        const hashedPassword = this.passwordUtil.hashPassword(createUserDto.password);
        const user = await this.userService.create({...createUserDto, password: hashedPassword});
        const { password, ...result } = user;
        return this.login(result);
    }

    async validateUser(email: string, rawPassword: string): Promise<IValidatedUser | null> {
        const user = await this.userService.findOneBy({email});
        const passwordMatches = user?.password && this.passwordUtil.comparePasswords(rawPassword, user?.password)
        if(!passwordMatches) {
            return null;
        }
        const { password, ...result } = user;

        return result;
    }

    async login(user: IValidatedUser): Promise<IAuthResult> {
        const accessToken = await this.jwtService.signAsync(user);
        return {
            ...user,
            accessToken,
        }
    }

}
