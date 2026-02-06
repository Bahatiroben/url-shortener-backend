import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { UserEntity } from '../user/user.entity';
import { LoginDto } from './dtos/login.dto';
import { IAuthResult, IValidatedUser } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { PasswordUtil } from './utils/password.util';
import { CreateUserDto } from '../user/createUser.dto.ts/createUser.dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private passwordUtil: PasswordUtil
    ) {

    }

    async authenticate(loginDto: LoginDto): Promise<IAuthResult> {
        const { username, password } = loginDto;
        const user = await this.validateUser(username, password);
        if(!user) {
            throw new UnauthorizedException("Invalid credentials");
        }
        return this.signIn(user);
    }

    async signup(createUserDto: CreateUserDto): Promise<IAuthResult> {
        const hashedPassword = this.passwordUtil.hashPassword(createUserDto.password);
        const user = await this.userService.create({...createUserDto, password: hashedPassword});
        const { password, ...result } = user;
        return this.signIn(result);
    }

    async validateUser(username: string, rawPassword: string): Promise<IValidatedUser | null> {
        const user = await this.userService.findUserBy({username});
        const passwordMatches = user?.password && this.passwordUtil.comparePasswords(rawPassword, user?.password)
        if(!passwordMatches) {
            return null;
        }
        const { password, ...result } = user;

        return result;
    }

    async signIn(user: IValidatedUser): Promise<IAuthResult> {
        const accessToken = await this.jwtService.signAsync(user);
        return {
            ...user,
            accessToken,
        }
    }

}
