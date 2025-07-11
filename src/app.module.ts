import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LinksController } from './links/links.controller';
import { LinksService } from './links/links.service';
import configurations from './config'
import { ConfigService } from '@nestjs/config';
import { LinksModule } from './links/links.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    load: [configurations]
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
],
  controllers: [AppController, LinksController, UserController],
  providers: [AppService, LinksService, UserService],
})
export class AppModule {}
