# Order Execution System

A high-performance order processing system built with NestJS, WebSockets, and Redis Queue for real-time order management and processing.

## 🚀 Features

- Real-time order processing with WebSocket support
- Background job processing using BullMQ and Redis
- RESTful API for order management
- Event-driven architecture for order status updates
- Database integration with TypeORM
- Environment-based configuration

## 🏗️ Project Structure

```
order-execution/
├── src/
│   ├── database/        # Database configuration and migrations
│   ├── dtos/            # Data Transfer Objects
│   ├── entities/        # TypeORM entities
│   ├── order/           # Order processing logic
│   │   ├── order.controller.ts    # REST API endpoints
│   │   ├── order.gateway.ts       # WebSocket gateway
│   │   ├── order.processor.ts     # Background job processor
│   │   ├── order.service.ts       # Business logic
│   │   └── order-events.publisher.ts  # Event publisher
│   ├── queue/           # Queue configuration
│   │   └── queue.module.ts
│   ├── app.module.ts    # Root application module
│   └── main.ts          # Application entry point
├── test/                # Test files
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## 🛠️ Tech Stack

- **Backend Framework**: NestJS
- **Database**: PostgreSQL (with TypeORM)
- **Real-time**: WebSockets (Socket.IO)
- **Queue System**: BullMQ with Redis
- **API**: RESTful API
- **Language**: TypeScript


## 📦 Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Redis server (local or remote)
- PostgreSQL database
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/srimaran712/order-execution-engine.git
   cd order-execution-engine/order-execution
   ```
# git branch master

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Server
   PORT=3000
   NODE_ENV=development

  
   ```





## 🏃 Running the Application

1. **Development mode**
   ```bash
   npm run start:dev
   ```

2. **Production build**
   ```bash
   npm run build
   npm run start:prod
   ```

3. **Running tests**
   ```bash
   npm test
   ```
## API domain 
https://order-execution-engine-1-n0ru.onrender.com

## health check
https://order-execution-engine-1-n0ru.onrender.com
## 🌐 API Endpoints

### Orders

EndPoint - `https://order-execution-engine-1-n0ru.onrender.com/api/create/orders/execute`
- `POST /api/orders/execute` - Create a new order returns order id in the response and process the order with bullmq calling the websocket connection to emit events



### WebSocket Events
- `order.created` - Emitted when a new order is created
- `order.building` - Emitted when an order is in building
- `order.routing` - Emitted when an order is price comparison
- `order.confirmed` - Emitted when an order is confirmed
- `order.completed` - Emitted when an order is completed



## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NestJS 
- BullMQ 
- Socket.IO 
- TypeORM 
- Redis
- PostgreSQL


# Created By 

Manimaran Srinivasan