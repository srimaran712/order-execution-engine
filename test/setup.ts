import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

let app: INestApplication;

export async function createTestModule() {
  const moduleFixture = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: parseInt(config.get('DB_PORT', '5432')),
          username: config.get('DB_USERNAME', 'postgres'),
          password: config.get('DB_PASSWORD', 'postgres'),
          database: config.get('DB_NAME', 'test_db'),
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          synchronize: true,
          dropSchema: true, // Be careful with this in production-like environments
        }),
        inject: [ConfigService],
      }),
      ScheduleModule.forRoot(),
      BullModule.forRootAsync({
        useFactory: () => ({
          redis: {
            host: 'localhost',
            port: 6379,
          },
        }),
      }),
    ],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
  return { app, moduleFixture };
}

export async function closeTestModule() {
  if (app) {
    await app.close();
  }
}

// Handle application shutdown
afterAll(async () => {
  await closeTestModule();
});
