import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>(
            'REDIS_HOST',
            'redis-11795.c83.us-east-1-2.ec2.cloud.redislabs.com',
          ),
          port: configService.get<number>('REDIS_PORT', 11795),
          password: configService.get<string>(
            'REDIS_PASSWORD',
            'lXlWBD7k7E9Vj3ksBCEZtU5bpegzHfsg',
          ),
          connectTimeout: 60000,
          enableOfflineQueue: false,
          retryDelayOnClusterDown: 300,
          maxConnections: 5,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
