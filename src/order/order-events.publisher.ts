import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class OrderEventsPublisher {
  private redis = new Redis({
    port: 11795,
    host: 'redis-11795.c83.us-east-1-2.ec2.cloud.redislabs.com',
    password: 'lXlWBD7k7E9Vj3ksBCEZtU5bpegzHfsg',
  });

  async publish(payload: any) {
    await this.redis.publish('order-status', JSON.stringify(payload));
  }
}
