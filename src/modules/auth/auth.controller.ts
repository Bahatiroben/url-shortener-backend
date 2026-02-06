import { Body, Controller, NotImplementedException, Post} from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { LoginDto } from 'src/modules/auth/dtos/login.dto';
import { IAuthResult } from './interfaces';
import { CreateUserDto } from '../user/createUser.dto.ts/createUser.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {
        
    }

    @Post('signin')
    login(
        @Body() loginDto: LoginDto
    ): Promise<IAuthResult> {
        return this.authService.authenticate(loginDto);
    }

    @Post('signup')
    signup(@Body() createUserDto: CreateUserDto): Promise<IAuthResult> {
        return this.authService.signup(createUserDto)
    }
}
