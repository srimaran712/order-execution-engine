import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { createOrderDto } from 'src/dtos/order.dto';

@Controller('/api/orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('execute')
  async executeOrder(@Body() body: createOrderDto) {
    return this.orderService.createOrder(body);
  }

  @Get(':id')
  getOrderById(@Query('orderId') id: string) {
    return this.orderService.getOrderById(id);
  }
}
