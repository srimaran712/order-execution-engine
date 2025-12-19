import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  @Cron('*/2 * * * *')
  async handleCron() {
    this.logger.debug('Called every 2 seconds');
    await axios.get('https://order-execution-engine-1-n0ru.onrender.com');
  }
}
