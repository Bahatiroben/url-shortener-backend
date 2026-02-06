import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LinksController } from './modules/links/links.controller';
import { LinksService } from './modules/links/links.service';
import configurations from './config'
import { ConfigService } from '@nestjs/config';
import { LinksModule } from './modules/links/links.module';
import { UserController } from './modules/user/user.controller';
import { UserService } from './modules/user/user.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configurations],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        synchronize: process.env.NODE_ENV === 'DEV',
        autoLoadEntities: true
      }),
      inject: [ConfigService]
    }),
    LinksModule,
    UserModule,
    AuthModule
],
  controllers: [AppController, LinksController, UserController],
  providers: [AppService, LinksService, UserService],
})
export class AppModule {}
