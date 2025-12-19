import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderGateway } from './order.gateway';
import { OrderEventsPublisher } from './order-events.publisher';
import { OrderService } from './order.service';
import { OrderStatus, DexType } from 'src/entities/order.entity';

interface OrderJobData {
  orderId: string;
  tokenIn: string;
  tokenOut: string;
  amount: number;
  type: string;
}
// Mock DEX prices
const getMockPrice = (tokenIn: string, tokenOut: string) => {
  // Simple mock prices
  const prices = {
    'SOL-USDC': 100, // 1 SOL = 100 USDC
    'USDC-SOL': 0.01, // 1 USDC = 0.01 SOL
    'SOL-RAY': 200, // 1 SOL = 200 RAY
    'RAY-SOL': 0.005, // 1 RAY = 0.005 SOL
  };

  const key = `${tokenIn}-${tokenOut}`;
  return prices[key] || 1;
};

@Processor('orders',{concurrency:10})
export class OrderProcessor extends WorkerHost {
  constructor(
    private ordersGateway: OrderGateway,
    private ordersService: OrderService,
    private orderEventsPublisher: OrderEventsPublisher,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {
    super();
  }

  async process(job: Job<OrderJobData, any, string>): Promise<any> {
    return this.handleOrder(job);
  }

  async handleOrder(job: Job<OrderJobData>) {
    const order = job.data;
    console.log(`🔄 Processing order ${order.orderId}`);

    try {
      // 1. PENDING (already set)

      // 2. ROUTING - Check both DEXs
      await this.delay(5000);
      await this.orderRepository.update(order.orderId, {
        status: OrderStatus.ROUTING,
      });
      // this.ordersGateway.sendOrderUpdate(order.orderId, {
      //   status: OrderStatus.ROUTING,
      //   message: 'Checking Raydium and Meteora for best price...',
      // });
      await this.orderEventsPublisher.publish({
        orderId: order.orderId,
        status: OrderStatus.ROUTING,
        message: 'Checking Raydium and Meteora...',
      });

      // Get mock quotes
      const raydiumPrice =
        getMockPrice(order.tokenIn, order.tokenOut) *
        (0.98 + Math.random() * 0.04);
      const meteoraPrice =
        getMockPrice(order.tokenIn, order.tokenOut) *
        (0.97 + Math.random() * 0.05);

      // Pick better price
      const selectedDex = raydiumPrice > meteoraPrice ? 'raydium' : 'meteora';
      const bestPrice = Math.max(raydiumPrice, meteoraPrice);

      console.log(`💰 Raydium: $${raydiumPrice}, Meteora: $${meteoraPrice}`);
      console.log(`✅ Selected ${selectedDex} at $${bestPrice}`);

      // 3. BUILDING
      await this.delay(5000);
      await this.orderRepository.update(order.orderId, {
        status: OrderStatus.BUILDING,
        selectedDex: selectedDex as DexType,
        executionPrice: bestPrice,
      });
      // this.ordersGateway.sendOrderUpdate(order.orderId, {
      //   status: 'building',
      //   message: `Building transaction for ${selectedDex}...`,
      //   selectedDex,
      //   price: bestPrice,
      // });
      await this.orderEventsPublisher.publish({
        orderId: order.orderId,
        status: OrderStatus.ROUTING,
        message: 'Checking Raydium and Meteora...',
      });

      // 4. SUBMITTED
      await this.delay(5000);
      await this.orderRepository.update(order.orderId, {
        status: OrderStatus.SUBMITTED,
      });
      // this.ordersGateway.sendOrderUpdate(order.orderId, {
      //   status: OrderStatus.SUBMITTED,
      //   message: 'Transaction submitted to blockchain...',
      // });
      await this.orderEventsPublisher.publish({
        orderId: order.orderId,
        status: OrderStatus.SUBMITTED,
        message: 'Transaction submitted to blockchain...',
      });

      // 5. EXECUTING (simulate 2 seconds)
      await this.delay(2000);

      // 6. CONFIRMED
      const txHash = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const executedPrice = bestPrice * (0.995 + Math.random() * 0.01);

      await this.orderRepository.update(order.orderId, {
        status: OrderStatus.CONFIRMED,
        txHash,
        executionPrice: executedPrice,
      });

      // this.ordersGateway.sendOrderUpdate(order.orderId, {
      //   status: 'confirmed',
      //   message: 'Order executed successfully!',
      //   txHash,
      //   price: executedPrice,
      //   received: order.amount * executedPrice,
      //   timestamp: new Date(),
      // });
      await this.orderEventsPublisher.publish({
        orderId: order.orderId,
        status: OrderStatus.CONFIRMED,
        message: 'Order executed successfully!',
        txHash,
        price: executedPrice,
        received: order.amount * executedPrice,
        timestamp: new Date(),
      });

      console.log(`🎉 Order ${order.orderId} completed! TX: ${txHash}`);
    } catch (error: unknown) {
      // 7. FAILED
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      await this.orderRepository.update(order.orderId, {
        status: OrderStatus.FAILED,
        error: errorMessage,
      });

      this.ordersGateway.sendOrderUpdate(order.orderId, {
        status: 'failed',
        message: `Order failed: ${errorMessage}`,
      });

      console.error(`❌ Order ${order.orderId} failed:`, error);
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
