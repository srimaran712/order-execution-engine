import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('Health is good! 200 ok');
    return 'Hello World!';
  }
}
