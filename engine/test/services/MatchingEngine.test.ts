import { MatchingEngine } from '../../src/services/MatchingEngine';
import { Order } from '../../src/models/Order';

describe('MatchingEngine', () => {
  let engine: MatchingEngine;

  beforeEach(() => {
    engine = new MatchingEngine();
  });

  describe('processOrders', () => {
    it('should process a list of orders', () => {
      // Create test orders
      const orders: Order[] = [
        {
          type_op: 'CREATE',
          account_id: 'acc1',
          amount: '10',
          order_id: '1',
          pair: 'BTC/USD',
          limit_price: '40000',
          side: 'BUY'
        },
        {
          type_op: 'CREATE',
          account_id: 'acc2',
          amount: '5',
          order_id: '2',
          pair: 'BTC/USD',
          limit_price: '40000',
          side: 'SELL'
        }
      ];

      // Process orders
      engine.processOrders(orders);

      // Check results
      const trades = engine.getTrades();
      const orderBook = engine.getOrderBook();

      // Expect one trade to be created
      expect(trades.length).toBe(1);
      expect(trades[0].buyOrderId).toBe('1');
      expect(trades[0].sellOrderId).toBe('2');
      expect(trades[0].price).toBe(40000);
      expect(trades[0].quantity).toBe(5);

      // Expect remaining buy order in the order book
      expect(orderBook.buy.length).toBe(1);
      expect(orderBook.buy[0].order_id).toBe('1');
      expect(orderBook.buy[0].amount).toBe('5');

      // Expect empty sell orders
      expect(orderBook.sell.length).toBe(0);
    });

    it('should handle order cancellation', () => {
      // Create a buy order
      const buyOrder: Order = {
        type_op: 'CREATE',
        account_id: 'acc1',
        amount: '10',
        order_id: '1',
        pair: 'BTC/USD',
        limit_price: '40000',
        side: 'BUY'
      };

      // Process the buy order
      engine.processOrders([buyOrder]);

      // Check order book
      let orderBook = engine.getOrderBook();
      expect(orderBook.buy.length).toBe(1);

      // Cancel the order
      const cancelOrder: Order = {
        type_op: 'DELETE',
        account_id: 'acc1',
        amount: '10',
        order_id: '1',
        pair: 'BTC/USD',
        limit_price: '40000',
        side: 'BUY'
      };

      // Process the cancel order
      engine.processOrders([cancelOrder]);

      // Check order book again
      orderBook = engine.getOrderBook();
      expect(orderBook.buy.length).toBe(0);
    });
  });

  describe('order matching', () => {
    it('should match buy and sell orders at the same price', () => {
      const orders: Order[] = [
        {
          type_op: 'CREATE',
          account_id: 'acc1',
          amount: '5',
          order_id: '1',
          pair: 'BTC/USD',
          limit_price: '40000',
          side: 'BUY'
        },
        {
          type_op: 'CREATE',
          account_id: 'acc2',
          amount: '5',
          order_id: '2',
          pair: 'BTC/USD',
          limit_price: '40000',
          side: 'SELL'
        }
      ];

      engine.processOrders(orders);
      
      const trades = engine.getTrades();
      const orderBook = engine.getOrderBook();
      
      expect(trades.length).toBe(1);
      expect(trades[0].quantity).toBe(5);
      expect(orderBook.buy.length).toBe(0);
      expect(orderBook.sell.length).toBe(0);
    });

    it('should match buy orders with lower priced sell orders', () => {
      const orders: Order[] = [
        {
          type_op: 'CREATE',
          account_id: 'acc1',
          amount: '5',
          order_id: '1',
          pair: 'BTC/USD',
          limit_price: '41000',
          side: 'BUY'
        },
        {
          type_op: 'CREATE',
          account_id: 'acc2',
          amount: '5',
          order_id: '2',
          pair: 'BTC/USD',
          limit_price: '40000',
          side: 'SELL'
        }
      ];

      engine.processOrders(orders);
      
      const trades = engine.getTrades();
      const orderBook = engine.getOrderBook();
      
      expect(trades.length).toBe(1);
      expect(trades[0].price).toBe(41000); // Trade occurs at buy price
      expect(orderBook.buy.length).toBe(0);
      expect(orderBook.sell.length).toBe(0);
    });

    it('should not match buy orders with higher priced sell orders', () => {
      const orders: Order[] = [
        {
          type_op: 'CREATE',
          account_id: 'acc1',
          amount: '5',
          order_id: '1',
          pair: 'BTC/USD',
          limit_price: '39000',
          side: 'BUY'
        },
        {
          type_op: 'CREATE',
          account_id: 'acc2',
          amount: '5',
          order_id: '2',
          pair: 'BTC/USD',
          limit_price: '40000',
          side: 'SELL'
        }
      ];

      engine.processOrders(orders);
      
      const trades = engine.getTrades();
      const orderBook = engine.getOrderBook();
      
      expect(trades.length).toBe(0);
      expect(orderBook.buy.length).toBe(1);
      expect(orderBook.sell.length).toBe(1);
    });

    it('should partially match orders of different sizes', () => {
      const orders: Order[] = [
        {
          type_op: 'CREATE',
          account_id: 'acc1',
          amount: '10',
          order_id: '1',
          pair: 'BTC/USD',
          limit_price: '40000',
          side: 'BUY'
        },
        {
          type_op: 'CREATE',
          account_id: 'acc2',
          amount: '4',
          order_id: '2',
          pair: 'BTC/USD',
          limit_price: '40000',
          side: 'SELL'
        }
      ];

      engine.processOrders(orders);
      
      const trades = engine.getTrades();
      const orderBook = engine.getOrderBook();
      
      expect(trades.length).toBe(1);
      expect(trades[0].quantity).toBe(4);
      expect(orderBook.buy.length).toBe(1);
      expect(orderBook.buy[0].amount).toBe('6');
      expect(orderBook.sell.length).toBe(0);
    });
  });
}); 