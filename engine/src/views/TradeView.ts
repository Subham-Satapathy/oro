import * as fs from 'fs/promises';
import * as path from 'path';

export class TradeView {
  private readonly outputPath = path.join(__dirname, '../../outputs/trades.json');

  async render(trades: any[]): Promise<void> {
    await fs.writeFile(
      this.outputPath,
      JSON.stringify(trades, null, 2)
    );
  }
} 