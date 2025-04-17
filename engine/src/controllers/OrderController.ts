import { Order } from '../models/Order';
import { MatchingEngine } from '../services/MatchingEngine';
import { OrderBookView } from '../views/OrderBookView';
import { TradeView } from '../views/TradeView';

export class OrderController {
  private matchingEngine: MatchingEngine;
  private orderBookView: OrderBookView;
  private tradeView: TradeView;

  constructor() {
    this.matchingEngine = new MatchingEngine();
    this.orderBookView = new OrderBookView();
    this.tradeView = new TradeView();
  }

  async processOrders(orders: Order[]): Promise<void> {
    this.matchingEngine.processOrders(orders);
    
    await Promise.all([
      this.orderBookView.render(this.matchingEngine.getOrderBook()),
      this.tradeView.render(this.matchingEngine.getTrades())
    ]);
  }
  
  getOrderBook() {
    return this.matchingEngine.getOrderBook();
  }
  
  getTrades() {
    return this.matchingEngine.getTrades();
  }
} 