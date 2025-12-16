import { Module, Logger } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderProcessor } from './order.processor';
import { OrderService } from './order.service';
import { OrderGateway } from './order.gateway';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderEventsPublisher } from './order-events.publisher';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'orders',
    }),
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    Logger,
    OrderProcessor,
    OrderGateway,
    OrderEventsPublisher,
  ],
})
export class OrderModule {}
