import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';
import { validate } from './utils/validators/env.validation';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import appConfig from './config/app.config';
import redisConfig from './config/redis.config';
import throttlerConfig from './config/throttler.config';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env.development', '.env'],
      validate,
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        redisConfig,
        throttlerConfig,
      ],
    }),
    CacheModule.register({
      isGlobal: true,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      store: async () =>
        redisStore({
          socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
          },
          database: Number(process.env.REDIS_DATABASE),
        }),
    }),
    RedisModule.forRootAsync({
      useFactory: () => ({
        config: {
          url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        },
      }),
    }),
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        pinoHttp:
          configService.get<string>('app.nodeEnv') === 'development'
            ? {
                level: configService.get<string>('app.logLevel'),
                transport: {
                  target: 'pino-pretty',
                  options: {
                    levelFirst: true,
                    translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l',
                    singleLine: true,
                    colorize: true,
                  },
                },
              }
            : {
                level: configService.get<string>('app.logLevel'),
                transport: {
                  target: 'pino-pretty',
                  options: {
                    levelFirst: true,
                    translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l',
                    singleLine: true,
                    colorize: true,
                  },
                },
                stream: pino.destination({
                  dest: configService.get<string>('app.logFile'),
                  minLength: 4096,
                  sync: false,
                }),
              },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('throttle.ttl'),
        limit: configService.get<number>('throttle.limit'),
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        return new DataSource(options).initialize();
      },
    }),
    AuthModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
