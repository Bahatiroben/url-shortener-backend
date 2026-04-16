import { Body, Controller, Post} from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';
import { IAuthResult } from './interfaces';
import { CreateUserDto } from '../users/createUser.dto.ts/createUser.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {
        
    }

    @Post('login')
    login(
        @Body() loginDto: LoginDto
    ): Promise<IAuthResult> {
        return this.authService.authenticate(loginDto);
    }

    @Post('register')
    register(@Body() createUserDto: CreateUserDto): Promise<IAuthResult> {
        return this.authService.register(createUserDto)
    }
}
