import {
  IsString,
  IsNumber,
  IsEnum,
  IsDecimal,
  IsNotEmpty,
} from 'class-validator';
import { OrderType } from '../entities/order.entity';

export class createOrderDto {
  @IsString()
  @IsNotEmpty()
  tokenIn: string;

  @IsString()
  @IsNotEmpty()
  tokenOut: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(OrderType)
  @IsNotEmpty()
  type: OrderType;
}
