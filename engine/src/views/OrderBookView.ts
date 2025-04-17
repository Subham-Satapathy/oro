import * as fs from 'fs/promises';
import * as path from 'path';
import { Order } from '../models/Order';

export class OrderBookView {
  private readonly outputPath = path.join(process.cwd(), 'outputs/orderbook.json');

  async render(orderBook: { buy: Order[], sell: Order[] }): Promise<void> {
    await fs.writeFile(
      this.outputPath,
      JSON.stringify(orderBook, null, 2)
    );
  }
} 