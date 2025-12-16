import { Injectable, Logger } from '@nestjs/common';
import { createOrderDto } from 'src/dtos/order.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectQueue('orders') private readonly orderQueue: Queue,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private logger: Logger,
  ) {}

  async createOrder(orderData: createOrderDto) {
    this.logger.log(
      'order has processing has started, order id has to the queue',
    );
    const creatingOrder = await this.orderRepository.save(orderData);
    this.logger.log('order has been saved to the database');

    //adding the order to the queue
    const jobData = {
      orderId: creatingOrder.id,
      tokenIn: creatingOrder.tokenIn,
      tokenOut: creatingOrder.tokenOut,
      amount: creatingOrder.amount,
      type: creatingOrder.type,
    };
    await this.orderQueue.add('order', jobData);
    return {
      orderId: creatingOrder.id,
      message:
        'order id has generated, order is being processed ,check for updates click websocket link',
      url: `ws://localhost:3000/ws`,
    };
  }

  getOrderById(id: string) {
    return this.orderRepository.findOneBy({ id });
  }
}
