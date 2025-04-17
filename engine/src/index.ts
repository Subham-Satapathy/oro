import { MatchingEngine } from './services/MatchingEngine';
import { Order } from './models/Order';
import * as fs from 'fs/promises';
import * as path from 'path';

async function main() {
  try {
    const paths = {
      orders: path.resolve(__dirname, '../src/input/orders.json'),
      orderBook: path.resolve(__dirname, '../outputs/orderbook.json'),
      trades: path.resolve(__dirname, '../outputs/trades.json')
    };

    console.log('Reading orders from:', paths.orders);

    const orders: Order[] = JSON.parse(
      await fs.readFile(paths.orders, 'utf-8')
    );

    const engine = new MatchingEngine();
    engine.processOrders(orders);
    
    await Promise.all([
      fs.writeFile(
        paths.orderBook, 
        JSON.stringify(engine.getOrderBook(), null, 2)
      ),
      fs.writeFile(
        paths.trades, 
        JSON.stringify(engine.getTrades(), null, 2)
      )
    ]);

    console.log('Processing complete. Check orderbook.json and trades.json for results.');
  } catch (error) {
    console.error('Error processing orders:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();