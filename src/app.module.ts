import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import RedisConfig  from '@common/config/redis.config';
import JwtConfig from '@common/config/jwt.config';
import PostgresConfig  from '@common/config/postgres.config';
import { ConfigService } from '@nestjs/config';

import { UserModule } from '@modules/users/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@common/redis/redis.module';
import { TeamsModule } from '@modules/teams/teams.module';
import { ShortenerModule } from '@modules/shortener/shortener.module';
import { ResponseInterceptor, RlsContextInterceptor } from '@common/interceptors';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [].concat(RedisConfig, PostgresConfig, JwtConfig),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          secret: configService.get<string>('jwt.secret'),
          signOptions: { expiresIn: configService.get<number>('jwt.expiresIn') },
        }),
        global: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('postgres.databaseUrl'),
        synchronize: process.env.NODE_ENV === 'DEV',
        autoLoadEntities: true
      }),
      inject: [ConfigService]
    }),
    UserModule,
    AuthModule,
    RedisModule,
    ShortenerModule,
    TeamsModule,
],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RlsContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
