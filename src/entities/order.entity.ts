import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  SNIPER = 'sniper',
}

export enum OrderStatus {
  PENDING = 'pending',
  ROUTING = 'routing',
  BUILDING = 'building',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export enum DexType {
  RAYDIUM = 'raydium',
  METEORA = 'meteora',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tokenIn: string;

  @Column()
  tokenOut: string;

  @Column('decimal', { precision: 18, scale: 8 })
  amount: number;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.MARKET,
  })
  type: OrderType;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: DexType,
    nullable: true,
  })
  selectedDex: DexType;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  executionPrice: number;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  fee: number;

  @Column({ nullable: true })
  txHash: string;

  @Column({ nullable: true })
  error: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  updateStatus(status: OrderStatus, data?: Partial<Order>) {
    this.status = status;
    if (data) {
      Object.assign(this, data);
    }
    this.updatedAt = new Date();
  }
}
