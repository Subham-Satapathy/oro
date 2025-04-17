import { Order, Trade } from '../models/Order';
import { v4 as uuidv4 } from 'uuid';


export class MatchingEngine {
  
  private buyOrders = new Map<string, Order>();
  private sellOrders = new Map<string, Order>();
  
  private buyPrices: { price: number, orderIds: string[] }[] = [];
  private sellPrices: { price: number, orderIds: string[] }[] = [];
  
  private trades: Trade[] = [];

  processOrders(orders: Order[]): void {
    for (const order of orders) {
      if (order.type_op === 'CREATE') {
        this.processOrder(order);
      } else if (order.type_op === 'DELETE') {
        this.cancelOrder(order);
      }
    }
  }

  private processOrder(order: Order): void {
    const isBuy = order.side === 'BUY';
    let remainingQuantity = parseFloat(order.amount);
    const price = parseFloat(order.limit_price);
    
    
    if (isBuy) {
      remainingQuantity = this.matchWithSellOrders(order, price, remainingQuantity);
    } else {
      remainingQuantity = this.matchWithBuyOrders(order, price, remainingQuantity);
    }

    if (remainingQuantity > 0) {
      this.addToOrderBook(order, remainingQuantity);
    }
  }

  private matchWithSellOrders(buyOrder: Order, buyPrice: number, quantity: number): number {
    let remainingQty = quantity;
    
    while (remainingQty > 0 && this.sellPrices.length > 0) {
      const bestPrice = this.sellPrices[0];
      
      
      if (bestPrice.price > buyPrice) break;
      
      
      const orderIds = [...bestPrice.orderIds]; 
      
      for (let i = 0; i < orderIds.length && remainingQty > 0; i++) {
        const sellOrderId = orderIds[i];
        const sellOrder = this.sellOrders.get(sellOrderId);
        
        if (!sellOrder) continue; 
        
        const sellQuantity = parseFloat(sellOrder.amount);
        const matchedQuantity = Math.min(remainingQty, sellQuantity);
        
        
        this.trades.push({
          trade_id: uuidv4(),
          buyOrderId: buyOrder.order_id,
          sellOrderId: sellOrder.order_id,
          price: bestPrice.price,
          quantity: matchedQuantity,
          timestamp: Date.now()
        });

        remainingQty -= matchedQuantity;
        const remainingSellQty = sellQuantity - matchedQuantity;
        
        if (remainingSellQty <= 0) {
          
          this.sellOrders.delete(sellOrderId);
          bestPrice.orderIds.splice(bestPrice.orderIds.indexOf(sellOrderId), 1);
        } else {
          
          sellOrder.amount = remainingSellQty.toString();
        }
      }
      
      
      if (bestPrice.orderIds.length === 0) {
        this.sellPrices.shift();
      }
    }
    
    return remainingQty;
  }

  private matchWithBuyOrders(sellOrder: Order, sellPrice: number, quantity: number): number {
    let remainingQty = quantity;
    
    
    while (remainingQty > 0 && this.buyPrices.length > 0) {
      const bestPrice = this.buyPrices[0];
      
      
      if (bestPrice.price < sellPrice) break;
      
      
      const orderIds = [...bestPrice.orderIds];
      
      for (let i = 0; i < orderIds.length && remainingQty > 0; i++) {
        const buyOrderId = orderIds[i];
        const buyOrder = this.buyOrders.get(buyOrderId);
        
        if (!buyOrder) continue; 
        
        const buyQuantity = parseFloat(buyOrder.amount);
        const matchedQuantity = Math.min(remainingQty, buyQuantity);
        
        
        this.trades.push({
          trade_id: uuidv4(),
          buyOrderId: buyOrder.order_id,
          sellOrderId: sellOrder.order_id,
          price: bestPrice.price,
          quantity: matchedQuantity,
          timestamp: Date.now()
        });

        remainingQty -= matchedQuantity;
        const remainingBuyQty = buyQuantity - matchedQuantity;
        
        if (remainingBuyQty <= 0) {
          
          this.buyOrders.delete(buyOrderId);
          bestPrice.orderIds.splice(bestPrice.orderIds.indexOf(buyOrderId), 1);
        } else {
          
          buyOrder.amount = remainingBuyQty.toString();
        }
      }
      
     
      if (bestPrice.orderIds.length === 0) {
        this.buyPrices.shift();
      }
    }
    
    return remainingQty;
  }

  private addToOrderBook(order: Order, quantity: number): void {
    const isBuy = order.side === 'BUY';
    const priceFloat = parseFloat(order.limit_price);
    const newOrder = { ...order, amount: quantity.toString() };
    
    
    const orderMap = isBuy ? this.buyOrders : this.sellOrders;
    orderMap.set(order.order_id, newOrder);
    
   
    const priceLevels = isBuy ? this.buyPrices : this.sellPrices;
    
    
    let priceLevel = priceLevels.find(p => p.price === priceFloat);
    
    if (!priceLevel) {
      priceLevel = { price: priceFloat, orderIds: [] };
      
      
      if (isBuy) {
       
        const index = priceLevels.findIndex(p => p.price < priceFloat);
        if (index === -1) {
          priceLevels.push(priceLevel);
        } else {
          priceLevels.splice(index, 0, priceLevel);
        }
      } else {
        
        const index = priceLevels.findIndex(p => p.price > priceFloat);
        if (index === -1) {
          priceLevels.push(priceLevel);
        } else {
          priceLevels.splice(index, 0, priceLevel);
        }
      }
    }
    
  
    priceLevel.orderIds.push(order.order_id);
  }

  private cancelOrder(order: Order): void {
    const isBuy = order.side === 'BUY';
    const orderMap = isBuy ? this.buyOrders : this.sellOrders;
    const priceLevels = isBuy ? this.buyPrices : this.sellPrices;
    
    
    const existingOrder = orderMap.get(order.order_id);
    if (!existingOrder) return;
    
    orderMap.delete(order.order_id);
    
    
    const price = parseFloat(existingOrder.limit_price);
    const priceLevel = priceLevels.find(p => p.price === price);
    
    if (priceLevel) {
      const index = priceLevel.orderIds.indexOf(order.order_id);
      if (index !== -1) {
        priceLevel.orderIds.splice(index, 1);
        
       
        if (priceLevel.orderIds.length === 0) {
          const levelIndex = priceLevels.indexOf(priceLevel);
          priceLevels.splice(levelIndex, 1);
        }
      }
    }
  }

  getOrderBook(): { buy: Order[], sell: Order[] } {
    return {
      buy: Array.from(this.buyOrders.values()),
      sell: Array.from(this.sellOrders.values())
    };
  }

  getTrades(): Trade[] {
    return this.trades;
  }
}