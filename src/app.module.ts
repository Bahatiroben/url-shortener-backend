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

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    load: [configurations]
  }),
  TypeOrmModule.forRootAsync({
    useFactory: async (configService: ConfigService) => ({
      type: 'postgres',
      url: configService.get('DATABASE_URL'),
      synchronize: true, //TODO:  Set to false in production
      autoLoadEntities: true
    }),
    inject: [ConfigService]
}),
LinksModule
],
  controllers: [AppController, LinksController],
  providers: [AppService, LinksService],
})
export class AppModule {}
