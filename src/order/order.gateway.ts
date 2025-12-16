// import {
//   WebSocketGateway,
//   WebSocketServer,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
//   MessageBody,
//   ConnectedSocket,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { OrderService } from './order.service';
// import { Logger } from '@nestjs/common';

// @WebSocketGateway({
//   namespace: '/ws',
//   cors: {
//     origin: 'http://localhost:3000',
//     credentials: true,
//   },
//   transports: ['websocket', 'polling'],
// })
// export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   constructor(
//     private readonly orderService: OrderService,
//     private logger: Logger,
//   ) {}

//   handleConnection(client: Socket) {
//     console.log(`Client connected: ${client.id}`);
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
//   }

//   @SubscribeMessage('getOrderById')
//   async handleSubscribe(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: { orderId: string },
//   ) {
//     const order = await this.orderService.getOrderById(data.orderId);

//     if (!order) {
//       client.emit('error', { message: 'Order not found' });
//       return;
//     }

//     // Join room for this order
//     client.join(data.orderId);

//     // Send current status
//     client.emit('update', {
//       orderId: data.orderId,
//       status: order.status,
//       message: 'Connected!',
//       timestamp: new Date(),
//     });

//     console.log(`📡 Client ${client.id} subscribed to order ${data.orderId}`);
//   }

//   // Send update to all clients watching an order
//   sendOrderUpdate(orderId: string, update: any) {
//     this.server.to(orderId).emit('update', {
//       orderId,
//       ...update,
//     });
//   }
// }

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OrderService } from './order.service';
import { Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@WebSocketGateway({
  namespace: '/ws', // This creates /ws namespace
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Support both
})
export class OrderGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrderGateway.name);
  private redisSub = new Redis({
    port: 11795,
    host: 'redis-11795.c83.us-east-1-2.ec2.cloud.redislabs.com',
    password: 'lXlWBD7k7E9Vj3ksBCEZtU5bpegzHfsg',
  });

  constructor(private readonly orderService: OrderService) {}

  // Initialize WebSocket server
  afterInit() {
    this.logger.log('✅ WebSocket Gateway initialized at /ws');

    this.redisSub.subscribe('order-status');

    this.redisSub.on('message', (_, message) => {
      const payload = JSON.parse(message);

      this.logger.log(`📨 Order update ${payload.orderId}: ${payload.status}`);

      this.server.to(payload.orderId).emit('orderUpdate', {
        ...payload,
        timestamp: new Date().toISOString(),
      });
    });
  }

  // Handle client connection
  handleConnection(client: Socket) {
    this.logger.log(`✅ Client connected: ${client.id}`);
    // Send welcome message
    client.emit('connected', {
      clientId: client.id,
      message: 'Connected to Order Execution Engine',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle client disconnect
  handleDisconnect(client: Socket) {
    this.logger.log(` Client disconnected: ${client.id}`);
  }

  // Handle subscription to order updates
  @SubscribeMessage('getOrderById')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    if (!data || !data.orderId) {
      client.emit('error', { message: 'orderId is required' });
      return;
    }

    this.logger.log(`Client ${client.id} subscribing to order ${data.orderId}`);

    const order = await this.orderService.getOrderById(data.orderId);

    if (!order) {
      client.emit('error', { message: `Order ${data.orderId} not found` });
      return;
    }

    // Join room for this order
    client.join(data.orderId);

    // Send initial order data
    client.emit('orderUpdate', {
      orderId: data.orderId,
      status: order.status,
      message: 'Subscribed to order updates',
      order: order,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `✅ Client ${client.id} subscribed to order ${data.orderId}`,
    );
  }

  // Send update to all clients watching an order
  sendOrderUpdate(orderId: string, update: any) {
    this.logger.log(`📤 Sending update for order ${orderId}:`);
    this.server.to(orderId).emit('orderUpdate', {
      orderId,
      ...update,
      timestamp: new Date().toISOString(),
    });
  }

  // Test endpoint for WebSocket
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', {
      message: 'WebSocket is working!',
      timestamp: new Date().toISOString(),
    });
  }
}
