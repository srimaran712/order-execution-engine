import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = parseInt(process.env.PORT || '3000', 10);

  // Enable CORS for HTTP
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Apply WebSocket adapter

  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(port);
  // WebSocket server on a different port

  console.log(`HTTP server running on: http://localhost:${port}`);
  console.log(`WebSocket server running on: ws://localhost:${port}/ws`);
}

// Handle promise rejection
bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
