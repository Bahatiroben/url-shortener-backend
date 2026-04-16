import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services';
import { UserModule } from '../users/user.module';
import { PasswordUtil } from './utils/password.util';
import { AuthGuard } from './guards/auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PasswordUtil, AuthGuard],
  imports: [UserModule],
  exports: [AuthGuard]
})
export class AuthModule {
}
