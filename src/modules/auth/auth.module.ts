import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PasswordUtil } from './utils/password.util';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PasswordUtil],
  imports: [JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '1h' },
      global: true,
    })
  }), UserModule],
})
export class AuthModule {
}
