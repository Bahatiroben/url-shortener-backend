import { Body, Controller, Post} from '@nestjs/common';
import { LoginDto } from './dtos';
import { AuthService } from './services';
import { IAuthResult } from './interfaces';
import { CreateUserDto } from '@modules/users/dtos';
import { BaseController } from '@common/base';
import { ApiResponse } from '@common/dto';

@Controller('v1/auth')
export class AuthController extends BaseController {

    constructor(private authService: AuthService) {
        super();
    }

    @Post('login')
    login(
        @Body() loginDto: LoginDto
    ): Promise<ApiResponse<IAuthResult>> {
        return this.createResponse(() => this.authService.authenticate(loginDto), 'Login successful');
    }

    @Post('register')
    register(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<IAuthResult>> {
        return this.createResponse(() => this.authService.register(createUserDto), 'User registered successfully');
    }
}
