import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisConfig, PostgresConfig, JwtConfig } from './common/config';
import { ConfigService } from '@nestjs/config';
import { UserController } from './modules/users/user.controller';
import { UserService } from './modules/users/services';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from './common/redis/redis.module';
import { TeamsModule } from './modules/teams/teams.module';
import { ShortenerModule } from './modules/shortener/shortener.module';

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
    TeamsModule,
    ShortenerModule
],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
