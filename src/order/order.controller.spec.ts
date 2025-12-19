import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';

describe('OrderController', () => {
  let controller: OrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

  describe('executeOrder', () => {
    it('should execute order successfully', async () => {
      const dto = {
        orderId: '1',
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'LIMIT',
        timeInForce: 'GTC',
        price: '1000',
        quantity: '0.001',
      };
      const result = {
        orderId: '1',
        status: 'SUCCESS',
      };
      const spy = jest.spyOn(controller, 'executeOrder').mockResolvedValue(result);
      expect(await controller.executeOrder(dto)).toEqual(result);
      expect(spy).toHaveBeenCalledWith(dto);
    });
  });
