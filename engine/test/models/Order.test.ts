import { Order, Trade } from '../../src/models/Order';

describe('Order and Trade interfaces', () => {
  describe('Order interface', () => {
    it('should create a valid buy order', () => {
      const buyOrder: Order = {
        type_op: 'CREATE',
        account_id: 'acc123',
        amount: '5.5',
        order_id: 'order123',
        pair: 'BTC/USD',
        limit_price: '41200.50',
        side: 'BUY'
      };

      expect(buyOrder.type_op).toBe('CREATE');
      expect(buyOrder.account_id).toBe('acc123');
      expect(buyOrder.amount).toBe('5.5');
      expect(buyOrder.order_id).toBe('order123');
      expect(buyOrder.pair).toBe('BTC/USD');
      expect(buyOrder.limit_price).toBe('41200.50');
      expect(buyOrder.side).toBe('BUY');
    });

    it('should create a valid sell order', () => {
      const sellOrder: Order = {
        type_op: 'CREATE',
        account_id: 'acc456',
        amount: '2.75',
        order_id: 'order456',
        pair: 'ETH/USD',
        limit_price: '3500.25',
        side: 'SELL'
      };

      expect(sellOrder.type_op).toBe('CREATE');
      expect(sellOrder.account_id).toBe('acc456');
      expect(sellOrder.amount).toBe('2.75');
      expect(sellOrder.order_id).toBe('order456');
      expect(sellOrder.pair).toBe('ETH/USD');
      expect(sellOrder.limit_price).toBe('3500.25');
      expect(sellOrder.side).toBe('SELL');
    });

    it('should create a valid cancel order', () => {
      const cancelOrder: Order = {
        type_op: 'DELETE',
        account_id: 'acc123',
        amount: '5.5',
        order_id: 'order123',
        pair: 'BTC/USD',
        limit_price: '41200.50',
        side: 'BUY'
      };

      expect(cancelOrder.type_op).toBe('DELETE');
      expect(cancelOrder.order_id).toBe('order123');
    });
  });

  describe('Trade interface', () => {
    it('should create a valid trade', () => {
      const trade: Trade = {
        trade_id: 'trade123',
        buyOrderId: 'buy123',
        sellOrderId: 'sell123',
        price: 42000,
        quantity: 1.5,
        timestamp: 1681234567890
      };

      expect(trade.trade_id).toBe('trade123');
      expect(trade.buyOrderId).toBe('buy123');
      expect(trade.sellOrderId).toBe('sell123');
      expect(trade.price).toBe(42000);
      expect(trade.quantity).toBe(1.5);
      expect(trade.timestamp).toBe(1681234567890);
    });
  });
}); 